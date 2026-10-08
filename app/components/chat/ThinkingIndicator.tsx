import { useEffect, useState } from "react";

const DOT_DELAYS = ["0ms", "160ms", "320ms"];

export function ThinkingIndicator({ label }: { label?: string }) {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setSlow(true), 2000);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="flex justify-start" aria-live="polite">
      <div className="flex items-center gap-3 rounded-2xl rounded-tl-md border border-line-subtle bg-raised px-4 py-3">
        <span className="flex items-center gap-1" aria-hidden="true">
          {DOT_DELAYS.map((delay) => (
            <span
              key={delay}
              className="thinking-dot h-1.5 w-1.5 rounded-full bg-ink-3"
              style={{ animationDelay: delay }}
            />
          ))}
        </span>
        <span className="text-sm text-ink-2">
          {label ?? (slow ? "Esto puede tardar unos segundos…" : "El agente está pensando…")}
        </span>
      </div>
    </div>
  );
}
