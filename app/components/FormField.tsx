type FormFieldProps = {
  label: string;
  name: string;
  type: string;
  error?: string;
  autoComplete?: string;
  defaultValue?: string;
  placeholder?: string;
};

export function FormField({
  label,
  name,
  type,
  error,
  autoComplete,
  defaultValue,
  placeholder,
}: FormFieldProps) {
  const errorId = `${name}-error`;

  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="block text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`block w-full rounded-sm border bg-panel px-3 py-2 text-ink shadow-raised outline-none transition-colors duration-150 placeholder:text-ink-3 focus:border-accent focus-visible:ring-2 ${
          error
            ? "border-red-400 focus-visible:ring-red-200 dark:focus-visible:ring-red-900"
            : "border-line focus-visible:ring-accent/30"
        }`}
      />
      {error ? (
        <p id={errorId} className="text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
