import type {
  ErrorDetail,
  TokenPair,
  UserCreate,
  ValidationError,
} from "./api.types";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000"
).replace(/\/$/, "");

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
    return new ApiError(code, response.status, message);
  }

  return new ApiError(
    "unknown_error",
    response.status,
    "Ocurrió un error inesperado. Inténtalo de nuevo.",
  );
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...init.headers,
      },
    });
  } catch {
    throw new ApiError(
      "network_error",
      0,
      "No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.",
    );
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
  return apiFetch<TokenPair>("/auth/signup", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
