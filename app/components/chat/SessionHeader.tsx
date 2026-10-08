import { ArrowLeft, Pause, Play, Volume2, VolumeX, X } from "lucide-react";
import { Link } from "react-router";

import type { Escenario, EstadoSesion, NivelMCER } from "../../lib/api.types";
import { ESCENARIO_ICON, NIVEL_DESCRIPCION } from "../../lib/ui";
import { Button } from "../Button";
import { StatusBadge } from "../StatusBadge";

type SessionHeaderProps = {
  escenario: Escenario;
  escenarioNombre: string;
  nivel: NivelMCER;
  estado: EstadoSesion;
  muted: boolean;
  busy: boolean;
  onToggleMute: () => void;
  onPause: () => void;
  onResume: () => void;
  onClose: () => void;
};

export function SessionHeader({
  escenario,
  escenarioNombre,
  nivel,
  estado,
  muted,
  busy,
  onToggleMute,
  onPause,
  onResume,
  onClose,
}: SessionHeaderProps) {
  const Icon = ESCENARIO_ICON[escenario];

  return (
    <header className="sticky top-0 z-20 border-b border-line-subtle bg-canvas/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-3xl items-center gap-3 px-4">
        <Link
          to="/practice"
          aria-label="Volver a tus prácticas"
          title="Volver a tus prácticas"
          className="rounded-lg p-2 text-ink-2 transition-colors duration-150 hover:bg-sunken hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </Link>

        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent"
          aria-hidden="true"
        >
          <Icon className="h-4 w-4" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink">
            {escenarioNombre}
          </p>
          <p className="text-xs text-ink-3">
            Nivel {nivel} · {NIVEL_DESCRIPCION[nivel]}
          </p>
        </div>

        <StatusBadge estado={estado} />

        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleMute}
          aria-pressed={!muted}
          aria-label={muted ? "Activar voz del agente" : "Silenciar voz del agente"}
          title={muted ? "Activar voz del agente" : "Silenciar voz del agente"}
        >
          {muted ? (
            <VolumeX className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Volume2 className="h-4 w-4" aria-hidden="true" />
          )}
        </Button>

        {estado === "activa" ? (
          <Button variant="secondary" size="sm" onClick={onPause} disabled={busy}>
            <Pause className="h-3.5 w-3.5" aria-hidden="true" />
            Pausar
          </Button>
        ) : null}

        {estado === "pausada" ? (
          <Button size="sm" onClick={onResume} disabled={busy}>
            <Play className="h-3.5 w-3.5" aria-hidden="true" />
            Reanudar
          </Button>
        ) : null}

        {estado !== "concluida" ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={busy}
            className="text-danger hover:bg-danger-soft hover:text-danger"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            Cerrar
          </Button>
        ) : null}
      </div>
    </header>
  );
}
