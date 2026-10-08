import type {
  CatalogoRead,
  ErrorDetail,
  EvaluacionCreate,
  InformeRead,
  SesionCreate,
  SesionListado,
  SesionRead,
  SesionResumen,
  TokenPair,
  TurnoRespuesta,
  UserCreate,
  UserLogin,
  UserRead,
  ValidationError,
} from "./api.types";
import {
  clearClientSession,
  readClientSession,
  writeClientSession,
} from "./session";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(
  /\/$/,
  "",
);

const ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: "Correo o contraseña incorrectos.",
  user_already_exists: "Ese correo o nombre de usuario ya está registrado.",
  user_not_found: "No encontramos esa cuenta.",
  user_not_active: "Esta cuenta está desactivada.",
  invalid_token: "Tu sesión expiró. Vuelve a iniciar sesión.",
  session_not_found: "No encontramos esa sesión.",
  session_not_available:
    "La sesión tiene más de 30 días y ya no está disponible.",
  session_concluded: "Esta sesión ya fue cerrada.",
  session_not_active: "La sesión no está activa.",
  session_not_paused: "La sesión no está en pausa.",
  feedback_not_available: "El informe estará disponible al cerrar la sesión.",
  evaluation_not_allowed: "Primero debes cerrar la sesión.",
  evaluation_already_submitted: "Ya evaluaste esta sesión.",
  turn_failed: "El agente no pudo responder. Inténtalo de nuevo.",
  ai_not_configured: "El servicio de IA no está configurado en el servidor.",
  ai_rate_limited: "Se alcanzó el límite de uso de la IA. Espera un momento e inténtalo de nuevo.",
  ai_timeout: "La IA tardó demasiado en responder. Inténtalo de nuevo.",
  ai_invalid_response: "El agente devolvió una respuesta inválida. Inténtalo de nuevo.",
  speech_not_configured: "El servicio de voz no está configurado en el servidor.",
  speech_rate_limited: "Se alcanzó el límite de uso del servicio de voz. Espera un momento.",
  speech_timeout: "El servicio de voz tardó demasiado. Inténtalo de nuevo.",
  audio_too_large: "El audio supera el tamaño máximo permitido (10 MB).",
  unsupported_audio_format: "El formato de audio no es compatible.",
  empty_transcription: "No detectamos voz en la grabación. Inténtalo de nuevo.",
  network_error:
    "No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.",
  session_expired: "Tu sesión expiró. Vuelve a iniciar sesión.",
};

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly fieldErrors: Record<string, string>;

  constructor(
    code: string,
    status: number,
    message: string,
    fieldErrors: Record<string, string> = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

function messageFor(code: string, fallback: string): string {
  return ERROR_MESSAGES[code] ?? fallback;
}

async function parseErrorResponse(response: Response): Promise<ApiError> {
  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  const detail = (payload as { detail?: unknown } | null)?.detail;

  if (Array.isArray(detail)) {
    const fieldErrors: Record<string, string> = {};
    for (const item of detail as ValidationError[]) {
      const field = item.loc.at(-1);
      if (typeof field === "string") {
        fieldErrors[field] = item.msg;
      }
    }
    return new ApiError(
      "validation_error",
      response.status,
      "Revisa los campos marcados.",
      fieldErrors,
    );
  }

  if (detail && typeof detail === "object" && "code" in detail) {
    const { code, message } = detail as ErrorDetail;
    return new ApiError(
      code,
      response.status,
      messageFor(code, message),
    );
  }

  return new ApiError(
    "unknown_error",
    response.status,
    "Ocurrió un error inesperado. Inténtalo de nuevo.",
  );
}

let refreshInFlight: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  refreshInFlight ??= (async () => {
    let response: Response;
    try {
      response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      throw new ApiError("network_error", 0, messageFor("network_error", ""));
    }

    if (!response.ok) {
      throw new ApiError("session_expired", 401, messageFor("session_expired", ""));
    }

    const pair = (await response.json()) as TokenPair;
    const current = await readClientSession();
    if (current) {
      await writeClientSession({ accessToken: pair.access_token, user: current.user });
    }
    return pair.access_token;
  })().finally(() => {
    refreshInFlight = null;
  });

  return refreshInFlight;
}

type ApiFetchOptions = {
  auth?: boolean;
};

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
  options: ApiFetchOptions = {},
): Promise<T> {
  const { auth = true } = options;
  const session = auth ? await readClientSession() : null;

  const send = async (bearer: string | null): Promise<Response> => {
    const headers = new Headers(init.headers);
    if (init.body !== undefined && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    if (bearer) {
      headers.set("Authorization", `Bearer ${bearer}`);
    }
    try {
      return await fetch(`${API_BASE_URL}${path}`, {
        ...init,
        credentials: "include",
        headers,
      });
    } catch {
      throw new ApiError("network_error", 0, messageFor("network_error", ""));
    }
  };

  let response = await send(session?.accessToken ?? null);

  if (response.status === 401 && auth && session) {
    try {
      const token = await refreshAccessToken();
      response = await send(token);
    } catch (error) {
      clearClientSession();
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError("session_expired", 401, messageFor("session_expired", ""));
    }
  }

  if (!response.ok) {
    throw await parseErrorResponse(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function signup(input: UserCreate): Promise<TokenPair> {
  return apiFetch<TokenPair>(
    "/auth/signup",
    { method: "POST", body: JSON.stringify(input) },
    { auth: false },
  );
}

export function login(input: UserLogin): Promise<TokenPair> {
  return apiFetch<TokenPair>(
    "/auth/login",
    { method: "POST", body: JSON.stringify(input) },
    { auth: false },
  );
}

export function logout(): Promise<void> {
  return apiFetch<void>("/auth/logout", { method: "POST" }, { auth: false });
}

export function getMe(): Promise<UserRead> {
  return apiFetch<UserRead>("/auth/me");
}

export function getScenarios(): Promise<CatalogoRead> {
  return apiFetch<CatalogoRead>("/scenarios");
}

export function createSession(input: SesionCreate): Promise<SesionRead> {
  return apiFetch<SesionRead>("/sessions", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function listSessions(): Promise<SesionListado[]> {
  return apiFetch<SesionListado[]>("/sessions");
}

export function getSession(idSesion: string): Promise<SesionRead> {
  return apiFetch<SesionRead>(`/sessions/${idSesion}`);
}

export function sendTurn(idSesion: string, texto: string): Promise<TurnoRespuesta> {
  return apiFetch<TurnoRespuesta>(`/sessions/${idSesion}/turnos`, {
    method: "POST",
    body: JSON.stringify({ texto }),
  });
}

export function sendAudioTurn(idSesion: string, archivo: Blob): Promise<TurnoRespuesta> {
  const formData = new FormData();
  formData.append("archivo", archivo, "audio.webm");
  return apiFetch<TurnoRespuesta>(`/sessions/${idSesion}/turnos/audio`, {
    method: "POST",
    body: formData,
  });
}

export function pauseSession(idSesion: string): Promise<SesionResumen> {
  return apiFetch<SesionResumen>(`/sessions/${idSesion}/pausar`, { method: "POST" });
}

export function resumeSession(idSesion: string): Promise<SesionResumen> {
  return apiFetch<SesionResumen>(`/sessions/${idSesion}/reanudar`, { method: "POST" });
}

export function closeSession(idSesion: string): Promise<InformeRead> {
  return apiFetch<InformeRead>(`/sessions/${idSesion}/cerrar`, { method: "POST" });
}

export function getFeedback(idSesion: string): Promise<InformeRead> {
  return apiFetch<InformeRead>(`/sessions/${idSesion}/retroalimentacion`);
}

export function submitEvaluation(
  idSesion: string,
  input: EvaluacionCreate,
): Promise<void> {
  return apiFetch<void>(`/sessions/${idSesion}/evaluacion`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

