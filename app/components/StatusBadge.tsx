import type { EstadoSesion } from "../lib/api.types";
import { ESTADO_LABEL } from "../lib/ui";

const DOT: Record<EstadoSesion, string> = {
  activa: "bg-green-600",
  pausada: "bg-amber-600",
  concluida: "bg-gray-400",
};

export function StatusBadge({ estado }: { estado: EstadoSesion }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-ink-2">
      <span
        className={`h-1.5 w-1.5 rounded-full ${DOT[estado]}`}
        aria-hidden="true"
      />
      {ESTADO_LABEL[estado]}
    </span>
  );
}
