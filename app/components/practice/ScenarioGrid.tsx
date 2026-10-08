import { Check } from "lucide-react";

import type { Escenario, EscenarioRead } from "../../lib/api.types";
import { ESCENARIO_ICON } from "../../lib/ui";

type ScenarioGridProps = {
  escenarios: EscenarioRead[];
  value: Escenario | null;
  onChange: (escenario: Escenario) => void;
  disabled?: boolean;
};

export function ScenarioGrid({
  escenarios,
  value,
  onChange,
  disabled = false,
}: ScenarioGridProps) {
  return (
    <fieldset disabled={disabled}>
      <legend className="sr-only">Escenario</legend>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {escenarios.map((escenario) => {
          const Icon = ESCENARIO_ICON[escenario.clave];
          const selected = value === escenario.clave;

          return (
            <label
              key={escenario.clave}
              className={`group relative flex cursor-pointer flex-col gap-3 rounded-lg border p-4 transition-colors duration-150 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-canvas ${
                selected
                  ? "border-accent bg-accent-soft"
                  : "border-line bg-raised hover:border-line-strong"
              } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
            >
              <input
                type="radio"
                name="escenario"
                value={escenario.clave}
                checked={selected}
                onChange={() => onChange(escenario.clave)}
                className="sr-only"
              />
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                  selected
                    ? "bg-accent text-accent-ink"
                    : "bg-sunken text-ink-2 group-hover:text-ink"
                }`}
                aria-hidden="true"
              >
                <Icon className="h-4 w-4" />
              </span>
              <span>
                <span className="block text-sm font-medium text-ink">
                  {escenario.nombre}
                </span>
                <span className="mt-1 block text-sm leading-relaxed text-ink-2">
                  {escenario.descripcion}
                </span>
              </span>
              {selected ? (
                <Check
                  className="absolute top-4 right-4 h-4 w-4 text-accent"
                  aria-hidden="true"
                />
              ) : null}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
