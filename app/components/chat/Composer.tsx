import { ArrowUp, Loader2, Mic, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useRecorder } from "../../hooks/useRecorder";
import { formatClock } from "../../lib/ui";
import { Button } from "../Button";
import { Waveform } from "../Waveform";

const MAX_SECONDS = 120;
const MAX_CHARS = 2000;

type ComposerProps = {
  disabled: boolean;
  sending: boolean;
  onSendText: (texto: string) => void;
  onSendAudio: (blob: Blob) => void;
};

export function Composer({
  disabled,
  sending,
  onSendText,
  onSendAudio,
}: ComposerProps) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recorder = useRecorder();
  const recording = recorder.status === "recording";
  const requesting = recorder.status === "requesting";
  const busy = disabled || sending;

  useEffect(() => {
    const element = textareaRef.current;
    if (!element) {
      return;
    }
    element.style.height = "0px";
    element.style.height = `${Math.min(element.scrollHeight, 152)}px`;
  }, [text]);

  useEffect(() => {
    if (recording && recorder.duration >= MAX_SECONDS) {
      void submitAudio();
    }
  }, [recorder.duration, recording]);

  function submitText() {
    const value = text.trim();
    if (!value || busy) {
      return;
    }
    setText("");
    onSendText(value);
  }

  async function submitAudio() {
    const blob = await recorder.stop();
    if (blob) {
      onSendAudio(blob);
    }
  }

  if (recording) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-3 rounded-xl border border-accent-soft-strong bg-accent-soft px-3 py-2.5">
          <span
            className="h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-red-600 motion-reduce:animate-none"
            aria-hidden="true"
          />
          <span className="sr-only">Grabando</span>
          <Waveform analyser={recorder.analyser} />
          <span className="shrink-0 text-sm tabular-nums text-ink-2">
            {formatClock(recorder.duration)}
          </span>
          <span className="shrink-0 text-xs text-ink-3">máx. 2:00</span>
          <Button variant="ghost" size="sm" onClick={recorder.cancel}>
            <X className="h-4 w-4" aria-hidden="true" />
            Cancelar
          </Button>
          <Button size="sm" onClick={submitAudio} disabled={sending}>
            Enviar
          </Button>
        </div>
        <p className="text-xs text-ink-3" aria-live="polite">
          Habla con claridad en inglés. Al enviar, transcribimos tu audio y el
          agente responde.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <form
        className="flex items-end gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          submitText();
        }}
      >
        <div className="relative flex-1">
          <label htmlFor="turno-texto" className="sr-only">
            Tu respuesta en inglés
          </label>
          <textarea
            id="turno-texto"
            ref={textareaRef}
            rows={1}
            maxLength={MAX_CHARS}
            value={text}
            disabled={busy}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                !event.shiftKey &&
                !event.nativeEvent.isComposing
              ) {
                event.preventDefault();
                submitText();
              }
            }}
            placeholder="Escribe tu respuesta en inglés…"
            className="scrollbar-slim max-h-40 w-full resize-none rounded-lg border border-line bg-panel px-3.5 py-2.5 text-[15px] text-ink placeholder:text-ink-3 focus:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-60"
          />
          {text.length >= 1800 ? (
            <span className="absolute right-2 bottom-1 text-xs tabular-nums text-ink-3">
              {text.length}/{MAX_CHARS}
            </span>
          ) : null}
        </div>
        <Button
          variant="secondary"
          size="icon"
          onClick={() => void recorder.start()}
          disabled={busy}
          aria-label="Grabar respuesta con el micrófono"
          title="Grabar respuesta"
          className="h-10 w-10 border-accent-soft-strong bg-accent-soft text-accent hover:bg-accent-soft-strong focus-visible:bg-accent-soft-strong"
        >
          {requesting ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Mic className="h-4 w-4" aria-hidden="true" />
          )}
        </Button>
        <Button
          type="submit"
          size="icon"
          disabled={!text.trim() || busy}
          aria-label="Enviar respuesta"
          title="Enviar respuesta"
          className="h-10 w-10"
        >
          <ArrowUp className="h-4 w-4" aria-hidden="true" />
        </Button>
      </form>
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-ink-3">
          Enter para enviar · Shift + Enter para otra línea
        </p>
        {recorder.error ? (
          <p role="alert" className="text-xs text-danger">
            {recorder.error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
