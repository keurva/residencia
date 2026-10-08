import { motion } from "motion/react";
import { Volume2 } from "lucide-react";

import type { TurnoHistorial } from "../../lib/api.types";
import { formatTime } from "../../lib/ui";

type MessageBubbleProps = {
  turno: TurnoHistorial;
  canSpeak: boolean;
  onSpeak: (texto: string) => void;
};

export function MessageBubble({ turno, canSpeak, onSpeak }: MessageBubbleProps) {
  const esAgente = turno.rol === "agente";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: [0.25, 1, 0.5, 1] }}
      className={`group flex ${esAgente ? "justify-start" : "justify-end"}`}
    >
      <div
        className={`flex max-w-[85%] items-end gap-1.5 ${
          esAgente ? "" : "flex-row-reverse"
        }`}
      >
        <div
          className={`rounded-2xl px-4 py-3 text-[15px] leading-relaxed ${
            esAgente
              ? "rounded-tl-md border border-line-subtle bg-raised text-ink"
              : "rounded-br-md bg-accent-soft text-ink"
          }`}
        >
          <p className="whitespace-pre-wrap">{turno.contenido}</p>
          <time
            dateTime={turno.fecha}
            title={formatTime(turno.fecha)}
            className="sr-only"
          >
            {formatTime(turno.fecha)}
          </time>
        </div>
        {esAgente && canSpeak ? (
          <button
            type="button"
            onClick={() => onSpeak(turno.contenido)}
            aria-label="Reproducir mensaje del agente"
            title="Reproducir"
            className="mb-1 rounded-md p-1 text-ink-3 opacity-0 transition-opacity duration-150 hover:bg-sunken hover:text-ink-2 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent group-hover:opacity-100"
          >
            <Volume2 className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </motion.div>
  );
}
