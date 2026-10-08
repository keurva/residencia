import { Link } from "react-router";

import type { Escenario, SesionListado } from "../../lib/api.types";
import { formatDateTime } from "../../lib/ui";
import { buttonClassName } from "../Button";
import { StatusBadge } from "../StatusBadge";

type SessionListProps = {
  sesiones: SesionListado[];
  escenarioNombres: Record<Escenario, string>;
};

export function SessionList({ sesiones, escenarioNombres }: SessionListProps) {
  return (
    <ul className="divide-y divide-line-subtle rounded-xl border border-line-subtle bg-raised shadow-raised">
      {sesiones.map((sesion) => {
        const disponible =
          sesion.estado === "concluida" || sesion.puede_reanudarse;
        return (
          <li
            key={sesion.id_sesion}
            className="flex items-center gap-4 px-4 py-3.5 first:rounded-t-xl last:rounded-b-xl"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">
                {escenarioNombres[sesion.escenario]} · Nivel {sesion.nivel}
              </p>
              <p className="mt-0.5 text-xs text-ink-3">
                Inició {formatDateTime(sesion.fecha_inicio)}
              </p>
            </div>
            <StatusBadge estado={sesion.estado} />
            {sesion.estado === "concluida" ? (
              <Link
                to={`/practice/${sesion.id_sesion}`}
                className={buttonClassName("secondary", "sm")}
              >
                Ver informe
              </Link>
            ) : disponible ? (
              <Link
                to={`/practice/${sesion.id_sesion}`}
                className={buttonClassName("secondary", "sm")}
              >
                {sesion.estado === "pausada" ? "Reanudar" : "Continuar"}
              </Link>
            ) : (
              <span className="text-xs text-ink-3">Expirada</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
