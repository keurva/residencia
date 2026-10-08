import type { NivelMCER } from "../../lib/api.types";
import { NIVEL_DESCRIPCION } from "../../lib/ui";

type LevelPickerProps = {
  niveles: NivelMCER[];
  value: NivelMCER | null;
  onChange: (nivel: NivelMCER) => void;
  disabled?: boolean;
};

export function LevelPicker({
  niveles,
  value,
  onChange,
  disabled = false,
}: LevelPickerProps) {
  return (
    <fieldset disabled={disabled}>
      <legend className="sr-only">Nivel MCER</legend>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {niveles.map((nivel) => {
          const selected = value === nivel;
          return (
            <label
              key={nivel}
              className={`flex cursor-pointer flex-col items-center rounded-lg border px-3 py-2.5 text-center transition-colors duration-150 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-canvas ${
                selected
                  ? "border-accent bg-accent-soft"
                  : "border-line bg-raised hover:border-line-strong"
              } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
            >
              <input
                type="radio"
                name="nivel"
                value={nivel}
                checked={selected}
                onChange={() => onChange(nivel)}
                className="sr-only"
              />
              <span
                className={`text-sm font-semibold ${
                  selected ? "text-accent" : "text-ink"
                }`}
              >
                {nivel}
              </span>
              <span className="mt-0.5 text-xs text-ink-3">
                {NIVEL_DESCRIPCION[nivel]}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
