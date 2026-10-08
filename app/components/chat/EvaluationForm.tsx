import { Star } from "lucide-react";
import { useState } from "react";

import type { EvaluacionCreate, EvaluacionSistema } from "../../lib/api.types";
import { Button } from "../Button";

const RATINGS = [1, 2, 3, 4, 5];

type EvaluationFormProps = {
  existing: EvaluacionSistema | null;
  onSubmit: (input: EvaluacionCreate) => Promise<void>;
};

export function EvaluationForm({ existing, onSubmit }: EvaluationFormProps) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const done = submitted || Boolean(existing);
  const shownRating = existing?.calificacion ?? rating;

  if (done) {
    return (
      <div>
        <div className="flex items-center gap-1" aria-hidden="true">
          {RATINGS.map((value) => (
            <Star
              key={value}
              className={`h-5 w-5 ${
                value <= shownRating
                  ? "fill-amber-400 text-amber-400"
                  : "text-line-strong"
              }`}
            />
          ))}
        </div>
        <p className="mt-2 text-sm text-ink-2">
          {submitted ? "Gracias por tu evaluación." : "Ya evaluaste esta práctica."}
        </p>
        {existing?.comentario ? (
          <p className="mt-1 text-sm text-ink-3">“{existing.comentario}”</p>
        ) : null}
      </div>
    );
  }

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        if (rating === 0 || submitting) {
          return;
        }
        setSubmitting(true);
        try {
          await onSubmit({
            calificacion: rating,
            comentario: comment.trim() ? comment.trim() : null,
          });
          setSubmitted(true);
        } catch {
          setSubmitting(false);
        }
      }}
    >
      <div
        role="radiogroup"
        aria-label="Calificación del sistema"
        className="flex items-center gap-1"
      >
        {RATINGS.map((value) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={rating === value}
            aria-label={`${value} de 5`}
            onClick={() => setRating(value)}
            onMouseEnter={() => setHover(value)}
            onMouseLeave={() => setHover(0)}
            className="rounded-md p-1 transition-transform duration-100 hover:scale-[1.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent active:scale-[0.98]"
          >
            <Star
              className={`h-5 w-5 ${
                value <= (hover || rating)
                  ? "fill-amber-400 text-amber-400"
                  : "text-line-strong"
              }`}
              aria-hidden="true"
            />
          </button>
        ))}
      </div>

      <label htmlFor="evaluacion-comentario" className="sr-only">
        Comentario opcional
      </label>
      <textarea
        id="evaluacion-comentario"
        rows={3}
        maxLength={1000}
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        placeholder="Comentario (opcional)"
        className="scrollbar-slim mt-4 w-full resize-none rounded-lg border border-line bg-panel px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-3 focus:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
      />

      <div className="mt-4 flex items-center gap-3">
        <Button type="submit" size="sm" disabled={rating === 0 || submitting}>
          {submitting ? "Enviando…" : "Enviar evaluación"}
        </Button>
        {rating === 0 ? (
          <span className="text-xs text-ink-3">
            Elige una calificación de 1 a 5.
          </span>
        ) : null}
      </div>
    </form>
  );
}
