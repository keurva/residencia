import { ArrowLeft, ArrowRight, Info } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

import type {
  EvaluacionCreate,
  EvaluacionSistema,
  InformeRead,
} from "../../lib/api.types";
import { TIPO_LABEL, formatDateTime } from "../../lib/ui";
import { EvaluationForm } from "./EvaluationForm";

type ReportViewProps = {
  informe: InformeRead;
  evaluacion: EvaluacionSistema | null;
  onSubmitEvaluation: (input: EvaluacionCreate) => Promise<void>;
};

export function ReportView({
  informe,
  evaluacion,
  onSubmitEvaluation,
}: ReportViewProps) {
  const [evaluationError, setEvaluationError] = useState<string | null>(null);

  async function handleEvaluation(input: EvaluacionCreate) {
    setEvaluationError(null);
    try {
      await onSubmitEvaluation(input);
    } catch {
      setEvaluationError(
        "No pudimos guardar tu evaluación. Inténtalo de nuevo.",
      );
      throw new Error("evaluation_failed");
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/practice"
          className="inline-flex items-center gap-1.5 rounded-md text-sm text-ink-2 transition-colors duration-150 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Tus prácticas
        </Link>
        <p className="text-xs text-ink-3">
          Generado el {formatDateTime(informe.generado_en)}
        </p>
      </div>

      <header className="mt-6">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Informe de práctica
        </h1>
        <p className="mt-1 text-sm text-ink-2">
          Nivel {informe.nivel} ·{" "}
          {informe.errores.length > 0
            ? `${informe.errores.length} ${
                informe.errores.length === 1
                  ? "corrección"
                  : "correcciones"
              }`
            : "Sin correcciones registradas"}
        </p>
      </header>

      <section className="mt-8 rounded-xl border border-line-subtle bg-raised p-6 shadow-raised">
        <h2 className="text-sm font-medium text-ink">Resumen</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-2">
          {informe.resumen}
        </p>
      </section>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <ListSection
          title="Fortalezas"
          items={informe.fortalezas}
          dotClass="bg-green-600"
          emptyText="Aún sin fortalezas registradas."
        />
        <ListSection
          title="Áreas de mejora"
          items={informe.areas_mejora}
          dotClass="bg-amber-600"
          emptyText="Sin áreas de mejora destacadas."
        />
        <ListSection
          title="Gramática"
          items={informe.gramatica}
          dotClass="bg-ink-3"
          emptyText="Sin observaciones de gramática."
        />
        <ListSection
          title="Vocabulario"
          items={informe.vocabulario}
          dotClass="bg-ink-3"
          emptyText="Sin observaciones de vocabulario."
        />
      </div>

      <section className="mt-10">
        <h2 className="text-sm font-medium text-ink">Correcciones</h2>
        {informe.errores.length > 0 ? (
          <ul className="mt-4 space-y-3">
            {informe.errores.map((error, index) => (
              <li
                key={`${error.original}-${index}`}
                className="rounded-lg border border-line-subtle bg-raised p-4"
              >
                <span className="text-[11px] font-medium tracking-wider text-ink-3 uppercase">
                  {TIPO_LABEL[error.tipo]}
                </span>
                <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[15px]">
                  <span className="text-ink-2 line-through decoration-line-strong">
                    {error.original}
                  </span>
                  <ArrowRight
                    className="h-3.5 w-3.5 self-center text-ink-3"
                    aria-hidden="true"
                  />
                  <span className="font-medium text-ink">{error.correccion}</span>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-2">
                  {error.explicacion}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-ink-2">
            No se registraron correcciones durante esta conversación.
          </p>
        )}
      </section>

      <p className="mt-8 flex items-start gap-2 text-xs leading-relaxed text-ink-3">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        {informe.aviso}
      </p>

      <section className="mt-10 rounded-xl border border-line-subtle bg-raised p-6 shadow-raised">
        <h2 className="text-sm font-medium text-ink">
          ¿Cómo te pareció la práctica?
        </h2>
        <p className="mt-1 text-sm text-ink-2">
          Tu opinión sobre el sistema es opcional y no afecta tu informe.
        </p>
        <div className="mt-4">
          <EvaluationForm
            existing={evaluacion}
            onSubmit={handleEvaluation}
          />
        </div>
        {evaluationError ? (
          <p role="alert" className="mt-3 text-sm text-danger">
            {evaluationError}
          </p>
        ) : null}
      </section>
    </div>
  );
}

type ListSectionProps = {
  title: string;
  items: string[];
  dotClass: string;
  emptyText: string;
};

function ListSection({ title, items, dotClass, emptyText }: ListSectionProps) {
  return (
    <section className="rounded-xl border border-line-subtle bg-raised p-6 shadow-raised">
      <h2 className="text-sm font-medium text-ink">{title}</h2>
      {items.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {items.map((item) => (
            <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-ink-2">
              <span
                className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${dotClass}`}
                aria-hidden="true"
              />
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-ink-3">{emptyText}</p>
      )}
    </section>
  );
}
