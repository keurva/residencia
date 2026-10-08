import { Loader2, Pause } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";

import type { Route } from "./+types/practice-session";
import { Button } from "../components/Button";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { Composer } from "../components/chat/Composer";
import { MessageBubble } from "../components/chat/MessageBubble";
import { ReportView } from "../components/chat/ReportView";
import { SessionHeader } from "../components/chat/SessionHeader";
import { ThinkingIndicator } from "../components/chat/ThinkingIndicator";
import {
  ApiError,
  closeSession,
  getFeedback,
  getScenarios,
  getSession,
  pauseSession,
  resumeSession,
  sendAudioTurn,
  sendTurn,
  submitEvaluation,
} from "../lib/api";
import type {
  Escenario,
  EvaluacionCreate,
  InformeRead,
  TurnoHistorial,
} from "../lib/api.types";
import { redirectOnAuthError, requireClientSession } from "../lib/auth-guard";
import { cancelSpeech, speak, speechSupported } from "../lib/speech";

const MUTE_KEY = "cosa_voz_silenciada";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Práctica | Cosa" },
    {
      name: "description",
      content: "Conversa en inglés con el agente de práctica.",
    },
  ];
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  try {
    const session = await requireClientSession();
    const idSesion = params.idSesion;
    const [sesion, catalogo] = await Promise.all([
      getSession(idSesion),
      getScenarios(),
    ]);
    let informe: InformeRead | null = null;
    if (sesion.estado === "concluida") {
      try {
        informe = await getFeedback(idSesion);
      } catch {
        informe = null;
      }
    }
    return { user: session.user, sesion, catalogo, informe };
  } catch (error) {
    redirectOnAuthError(error);
  }
}

clientLoader.hydrate = true;

export function HydrateFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center text-ink-2">
      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
      Cargando la sesión…
    </div>
  );
}

function messageOf(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  return "Ocurrió un error inesperado. Inténtalo de nuevo.";
}

export default function PracticeSession({ loaderData }: Route.ComponentProps) {
  const { sesion, catalogo, informe } = loaderData;

  const [historial, setHistorial] = useState<TurnoHistorial[]>(sesion.historial);
  const [estado, setEstado] = useState(sesion.estado);
  const [informeActual, setInformeActual] = useState<InformeRead | null>(informe);
  const [evaluacion, setEvaluacion] = useState(sesion.evaluacion_sistema ?? null);
  const [sending, setSending] = useState(false);
  const [pendingLabel, setPendingLabel] = useState<string | undefined>(undefined);
  const [actionPending, setActionPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [muted, setMuted] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return window.localStorage.getItem(MUTE_KEY) === "1";
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const stickRef = useRef(true);
  const lastAgentRef = useRef<string | null>(null);

  useEffect(() => {
    const last = [...historial].reverse().find((turno) => turno.rol === "agente");
    if (!last) {
      return;
    }
    if (lastAgentRef.current === null) {
      lastAgentRef.current = last.fecha;
      return;
    }
    if (last.fecha !== lastAgentRef.current) {
      lastAgentRef.current = last.fecha;
      if (!muted && speechSupported()) {
        speak(last.contenido);
      }
    }
  }, [historial, muted]);

  useEffect(() => {
    const element = scrollRef.current;
    if (element && stickRef.current) {
      element.scrollTop = element.scrollHeight;
    }
  }, [historial, sending]);

  useEffect(() => cancelSpeech, []);

  function handleScroll() {
    const element = scrollRef.current;
    if (!element) {
      return;
    }
    stickRef.current =
      element.scrollHeight - element.scrollTop - element.clientHeight < 80;
  }

  function toggleMute() {
    setMuted((current) => {
      const next = !current;
      if (next) {
        cancelSpeech();
      }
      window.localStorage.setItem(MUTE_KEY, next ? "1" : "0");
      return next;
    });
  }

  async function sendText(texto: string) {
    if (sending || estado !== "activa") {
      return;
    }
    setSending(true);
    setPendingLabel(undefined);
    setError(null);
    const fechaOptimista = new Date().toISOString();
    setHistorial((prev) => [
      ...prev,
      { rol: "estudiante", contenido: texto, fecha: fechaOptimista },
    ]);
    try {
      const respuesta = await sendTurn(sesion.id_sesion, texto);
      setHistorial((prev) => [...prev, respuesta.mensaje]);
    } catch (cause) {
      setHistorial((prev) =>
        prev.filter((turno) => turno.fecha !== fechaOptimista),
      );
      setError(messageOf(cause));
    } finally {
      setSending(false);
    }
  }

  async function sendAudio(blob: Blob) {
    if (sending || estado !== "activa") {
      return;
    }
    setSending(true);
    setPendingLabel("Transcribiendo tu audio…");
    setError(null);
    try {
      const respuesta = await sendAudioTurn(sesion.id_sesion, blob);
      setHistorial((prev) => [
        ...prev,
        {
          rol: "estudiante",
          contenido: respuesta.texto_estudiante,
          fecha: new Date().toISOString(),
        },
        respuesta.mensaje,
      ]);
    } catch (cause) {
      setError(messageOf(cause));
    } finally {
      setSending(false);
      setPendingLabel(undefined);
    }
  }

  async function handlePause() {
    setActionPending(true);
    setError(null);
    try {
      const resumen = await pauseSession(sesion.id_sesion);
      setEstado(resumen.estado);
      cancelSpeech();
    } catch (cause) {
      setError(messageOf(cause));
    } finally {
      setActionPending(false);
    }
  }

  async function handleResume() {
    setActionPending(true);
    setError(null);
    try {
      const resumen = await resumeSession(sesion.id_sesion);
      setEstado(resumen.estado);
    } catch (cause) {
      setError(messageOf(cause));
    } finally {
      setActionPending(false);
    }
  }

  async function handleClose() {
    setClosing(true);
    setError(null);
    try {
      const reporte = await closeSession(sesion.id_sesion);
      setInformeActual(reporte);
      setEstado("concluida");
      setConfirmOpen(false);
      cancelSpeech();
    } catch (cause) {
      setError(messageOf(cause));
      setConfirmOpen(false);
    } finally {
      setClosing(false);
    }
  }

  async function handleEvaluation(input: EvaluacionCreate) {
    await submitEvaluation(sesion.id_sesion, input);
    setEvaluacion({
      calificacion: input.calificacion,
      comentario: input.comentario ?? null,
      fecha: new Date().toISOString(),
    });
  }

  const escenarioNombres = Object.fromEntries(
    catalogo.escenarios.map((item) => [item.clave, item.nombre]),
  ) as Record<Escenario, string>;

  if (estado === "concluida" && informeActual) {
    return (
      <div className="min-h-screen bg-canvas">
        <header className="sticky top-0 z-20 border-b border-line-subtle bg-canvas/90 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-3xl items-center px-6">
            <Link
              to="/practice"
              className="flex items-baseline gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <span className="text-base font-semibold tracking-tight text-ink">
                Cosa
              </span>
              <span className="text-xs text-ink-3">Simulador de inglés</span>
            </Link>
          </div>
        </header>
        <ReportView
          informe={informeActual}
          evaluacion={evaluacion}
          onSubmitEvaluation={handleEvaluation}
        />
      </div>
    );
  }

  if (estado === "concluida") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-sm text-ink-2">
          La sesión está cerrada, pero el informe no está disponible.
        </p>
        <Link
          to="/practice"
          className="rounded-sm text-sm font-medium text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Volver a tus prácticas
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-dvh flex-col bg-canvas">
      <SessionHeader
        escenario={sesion.escenario}
        escenarioNombre={escenarioNombres[sesion.escenario]}
        nivel={sesion.nivel}
        estado={estado}
        muted={muted}
        busy={actionPending || sending || closing}
        onToggleMute={toggleMute}
        onPause={handlePause}
        onResume={handleResume}
        onClose={() => setConfirmOpen(true)}
      />

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="scrollbar-slim flex-1 overflow-y-auto"
      >
        <div
          role="log"
          aria-live="polite"
          aria-relevant="additions"
          className="mx-auto max-w-2xl space-y-5 px-4 py-8"
        >
          {historial.map((turno, index) => (
            <MessageBubble
              key={`${turno.fecha}-${index}`}
              turno={turno}
              canSpeak={!muted && speechSupported()}
              onSpeak={(texto) => speak(texto)}
            />
          ))}
          {sending ? <ThinkingIndicator label={pendingLabel} /> : null}
        </div>
      </div>

      <div className="border-t border-line-subtle bg-canvas">
        <div className="mx-auto max-w-2xl space-y-3 px-4 py-4">
          {estado === "pausada" ? (
            <div className="flex items-center justify-between gap-4 rounded-xl border border-amber-400/40 bg-warning-soft px-4 py-3">
              <p className="flex items-center gap-2 text-sm text-warning">
                <Pause className="h-4 w-4 shrink-0" aria-hidden="true" />
                La sesión está en pausa. Reanúdala para seguir conversando.
              </p>
              <Button size="sm" onClick={handleResume} disabled={actionPending}>
                Reanudar
              </Button>
            </div>
          ) : null}

          {error ? (
            <div
              role="alert"
              className="flex items-start justify-between gap-4 rounded-xl border border-red-400/40 bg-danger-soft px-4 py-3"
            >
              <p className="text-sm text-danger">{error}</p>
              <button
                type="button"
                onClick={() => setError(null)}
                className="rounded-md text-xs font-medium text-danger hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                Descartar
              </button>
            </div>
          ) : null}

          <Composer
            disabled={estado !== "activa" || actionPending || closing}
            sending={sending}
            onSendText={sendText}
            onSendAudio={sendAudio}
          />
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Cerrar la práctica"
        description="Se generará tu informe de retroalimentación y ya no podrás seguir conversando en esta sesión."
        confirmLabel="Cerrar práctica"
        pending={closing}
        onConfirm={handleClose}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
