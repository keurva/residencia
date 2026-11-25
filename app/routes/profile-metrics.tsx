import { ArrowRight, Loader2 } from "lucide-react";
import { Link } from "react-router";

import type { Route } from "./+types/profile-metrics";
import type { TipoError } from "../lib/api.types";
import { getMetrics } from "../lib/api";
import { redirectOnAuthError, requireClientSession } from "../lib/auth-guard";
import {
  TIPO_LABEL,
  formatDateTime,
  formatDuration,
} from "../lib/ui";

const TIPO_ORDER: TipoError[] = ["gramatica", "vocabulario", "orden", "otro"];

const TIPO_DOT: Record<TipoError, string> = {
  gramatica: "bg-accent",
  vocabulario: "bg-amber-500",
  orden: "bg-green-600",
  otro: "bg-ink-3",
};

export function meta({}: Route.MetaArgs) {
  return [{ title: "Métricas | Cosa" }];
}

export async function clientLoader() {
  try {
    await requireClientSession();
    const metricas = await getMetrics();
    return { metricas };
  } catch (error) {
    redirectOnAuthError(error);
  }
}

clientLoader.hydrate = true;

export function HydrateFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-ink-2">
      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
      Cargando tus métricas…
    </div>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-3 rounded-lg border border-dashed border-line-subtle px-4 py-6 text-center text-sm text-ink-3">
      {children}
    </p>
  );
}

export default function ProfileMetrics({ loaderData }: Route.ComponentProps) {
  const { metricas } = loaderData;
  const totalErrores = TIPO_ORDER.reduce(
    (total, tipo) => total + metricas.errores_por_tipo[tipo],
    0,
  );

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Métricas
        </h1>
        <p className="mt-1 text-sm text-ink-2">
          Un resumen de cómo avanzas en tus prácticas de inglés.
        </p>
      </header>

      <section aria-label="Resumen de prácticas">
        <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-xl border border-line-subtle bg-raised p-5 shadow-raised">
            <dt className="text-xs tracking-wide text-ink-3 uppercase">
              Total de prácticas
            </dt>
            <dd className="mt-2 text-2xl font-semibold tabular-nums text-ink">
              {metricas.total_sesiones}
            </dd>
          </div>
          <div className="rounded-xl border border-line-subtle bg-raised p-5 shadow-raised">
            <dt className="text-xs tracking-wide text-ink-3 uppercase">
              Concluidas
            </dt>
            <dd className="mt-2 text-2xl font-semibold tabular-nums text-ink">
              {metricas.sesiones_concluidas}
            </dd>
          </div>
          <div className="rounded-xl border border-line-subtle bg-raised p-5 shadow-raised">
            <dt className="text-xs tracking-wide text-ink-3 uppercase">
              En curso
            </dt>
            <dd className="mt-2 text-2xl font-semibold tabular-nums text-ink">
              {metricas.sesiones_en_curso}
            </dd>
          </div>
          <div className="rounded-xl border border-line-subtle bg-raised p-5 shadow-raised">
            <dt className="text-xs tracking-wide text-ink-3 uppercase">
              Última práctica
            </dt>
            <dd className="mt-2 text-sm text-ink">
              {metricas.ultima_practica
                ? formatDateTime(metricas.ultima_practica)
                : "Aún sin prácticas"}
            </dd>
          </div>
          <div className="rounded-xl border border-line-subtle bg-raised p-5 shadow-raised sm:col-span-2 xl:col-span-2">
            <dt className="text-xs tracking-wide text-ink-3 uppercase">
              Tiempo practicado
            </dt>
            <dd className="mt-2 text-2xl font-semibold tabular-nums text-ink">
              {formatDuration(metricas.tiempo_total_segundos)}
            </dd>
            <p className="mt-1 text-xs text-ink-3">
              Suma de tus prácticas concluidas.
            </p>
          </div>
        </dl>
      </section>

      <section className="rounded-xl border border-line-subtle bg-raised p-6 shadow-raised">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-sm font-medium text-ink">Errores recurrentes</h2>
          <p className="text-xs text-ink-3">
            {totalErrores} {totalErrores === 1 ? "error" : "errores"} en total
          </p>
        </div>

        {totalErrores > 0 ? (
          <ul className="mt-4 space-y-3">
            {TIPO_ORDER.map((tipo) => {
              const cantidad = metricas.errores_por_tipo[tipo];
              const porcentaje =
                totalErrores > 0 ? (cantidad / totalErrores) * 100 : 0;
              return (
                <li key={tipo}>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="flex items-center gap-2 text-ink-2">
                      <span
                        className={`h-2 w-2 rounded-full ${TIPO_DOT[tipo]}`}
                        aria-hidden="true"
                      />
                      {TIPO_LABEL[tipo]}
                    </span>
                    <span className="font-medium tabular-nums text-ink">
                      {cantidad}
                    </span>
                  </div>
                  <div
                    className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-sunken"
                    aria-hidden="true"
                  >
                    <div
                      className={`h-full rounded-full ${TIPO_DOT[tipo]}`}
                      style={{ width: `${porcentaje}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState>
            Todavía no hay errores registrados. Cierra una práctica con
            correcciones para verlos aquí.
          </EmptyState>
        )}
      </section>

      <section className="rounded-xl border border-line-subtle bg-raised p-6 shadow-raised">
        <h2 className="text-sm font-medium text-ink">
          Errores gramaticales más comunes
        </h2>

        {metricas.errores_gramaticales.length > 0 ? (
          <ul className="mt-4 space-y-3">
            {metricas.errores_gramaticales.map((error) => (
              <li
                key={`${error.original}-${error.correccion}`}
                className="rounded-lg border border-line-subtle p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[15px]">
                    <span className="text-ink-2 line-through decoration-line-strong">
                      {error.original}
                    </span>
                    <ArrowRight
                      className="h-3.5 w-3.5 self-center text-ink-3"
                      aria-hidden="true"
                    />
                    <span className="font-medium text-ink">
                      {error.correccion}
                    </span>
                  </div>
                  <span className="shrink-0 rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium tabular-nums text-accent">
                    {error.veces}×
                  </span>
                </div>
                {error.explicacion ? (
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-2">
                    {error.explicacion}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState>
            Aún no hay correcciones de gramática registradas.{" "}
            {metricas.sesiones_concluidas === 0 ? (
              <Link
                to="/practice/speaking"
                className="font-medium text-accent hover:underline"
              >
                Comienza una práctica
              </Link>
            ) : null}
          </EmptyState>
        )}

        <p className="mt-4 text-xs leading-relaxed text-ink-3">
          Los errores gramaticales se calculan con las correcciones registradas.
          El tiempo y los tipos de error se conservan de forma agregada.
        </p>
      </section>
    </div>
  );
}
