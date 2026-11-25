import { useState, type FormEvent } from "react";
import { useOutletContext, useRevalidator } from "react-router";

import type { Route } from "./+types/profile-data";
import type { ProfileContext } from "./profile";
import { Button } from "../components/Button";
import { ApiError, updateEmail, updatePassword } from "../lib/api";
import { readClientSession, writeClientSession } from "../lib/session";
import { formatDate } from "../lib/ui";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Datos | Cosa" }];
}

type FormFeedback = {
  pending: boolean;
  errors: Record<string, string>;
  formError: string | null;
  success: string | null;
};

const EMPTY_FEEDBACK: FormFeedback = {
  pending: false,
  errors: {},
  formError: null,
  success: null,
};

function feedbackFromError(error: unknown): FormFeedback {
  if (error instanceof ApiError) {
    if (error.code === "invalid_password") {
      return {
        ...EMPTY_FEEDBACK,
        errors: {
          current_password: "La contraseña actual es incorrecta.",
        },
      };
    }
    if (error.code === "user_already_exists") {
      return {
        ...EMPTY_FEEDBACK,
        errors: { email: "Ese correo ya está registrado." },
      };
    }
    if (Object.keys(error.fieldErrors).length > 0) {
      return { ...EMPTY_FEEDBACK, errors: error.fieldErrors };
    }
    return { ...EMPTY_FEEDBACK, formError: error.message };
  }
  return {
    ...EMPTY_FEEDBACK,
    formError: "Ocurrió un error inesperado. Inténtalo de nuevo.",
  };
}

function Feedback({ feedback }: { feedback: FormFeedback }) {
  if (feedback.formError) {
    return (
      <p
        role="alert"
        className="rounded-lg border border-red-400/40 bg-danger-soft px-3 py-2 text-sm text-danger"
      >
        {feedback.formError}
      </p>
    );
  }
  if (feedback.success) {
    return (
      <p
        role="status"
        className="rounded-lg border border-green-600/30 bg-green-600/10 px-3 py-2 text-sm text-green-700 dark:text-green-400"
      >
        {feedback.success}
      </p>
    );
  }
  return null;
}

type FieldProps = {
  label: string;
  name: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  error?: string;
  id?: string;
};

function Field({
  label,
  name,
  type,
  value,
  onChange,
  autoComplete,
  error,
  id,
}: FieldProps) {
  const fieldId = id ?? name;
  const errorId = `${fieldId}-error`;
  return (
    <div className="space-y-1.5">
      <label htmlFor={fieldId} className="block text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={fieldId}
        name={name}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
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

export default function ProfileData() {
  const { user } = useOutletContext<ProfileContext>();
  const revalidator = useRevalidator();

  const [email, setEmail] = useState(user.email);
  const [emailPassword, setEmailPassword] = useState("");
  const [emailFeedback, setEmailFeedback] = useState(EMPTY_FEEDBACK);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordFeedback, setPasswordFeedback] = useState(EMPTY_FEEDBACK);

  async function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (emailFeedback.pending) {
      return;
    }
    if (!email.trim()) {
      setEmailFeedback({
        ...EMPTY_FEEDBACK,
        errors: { email: "Ingresa tu correo electrónico." },
      });
      return;
    }
    if (!emailPassword) {
      setEmailFeedback({
        ...EMPTY_FEEDBACK,
        errors: { current_password: "Ingresa tu contraseña actual." },
      });
      return;
    }

    setEmailFeedback({ ...EMPTY_FEEDBACK, pending: true });
    try {
      const updated = await updateEmail({
        email: email.trim(),
        current_password: emailPassword,
      });
      const current = await readClientSession();
      if (current) {
        await writeClientSession({
          accessToken: current.accessToken,
          user: updated,
        });
      }
      setEmail(updated.email);
      setEmailPassword("");
      setEmailFeedback({
        ...EMPTY_FEEDBACK,
        success: "Correo actualizado.",
      });
      revalidator.revalidate();
    } catch (error) {
      setEmailFeedback(feedbackFromError(error));
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (passwordFeedback.pending) {
      return;
    }
    if (!currentPassword) {
      setPasswordFeedback({
        ...EMPTY_FEEDBACK,
        errors: { current_password: "Ingresa tu contraseña actual." },
      });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordFeedback({
        ...EMPTY_FEEDBACK,
        errors: {
          new_password: "La nueva contraseña debe tener al menos 8 caracteres.",
        },
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordFeedback({
        ...EMPTY_FEEDBACK,
        errors: { confirm_password: "Las contraseñas no coinciden." },
      });
      return;
    }

    setPasswordFeedback({ ...EMPTY_FEEDBACK, pending: true });
    try {
      await updatePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordFeedback({
        ...EMPTY_FEEDBACK,
        success: "Contraseña actualizada.",
      });
    } catch (error) {
      setPasswordFeedback(feedbackFromError(error));
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Datos</h1>
        <p className="mt-1 text-sm text-ink-2">
          Consulta tu cuenta y actualiza cómo accedes a Cosa.
        </p>
      </header>

      <section className="rounded-xl border border-line-subtle bg-raised p-6 shadow-raised">
        <h2 className="text-sm font-medium text-ink">Información de la cuenta</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs tracking-wide text-ink-3 uppercase">
              Usuario
            </dt>
            <dd className="mt-1 text-sm text-ink">{user.username}</dd>
          </div>
          <div>
            <dt className="text-xs tracking-wide text-ink-3 uppercase">
              Correo
            </dt>
            <dd className="mt-1 truncate text-sm text-ink">{user.email}</dd>
          </div>
          <div>
            <dt className="text-xs tracking-wide text-ink-3 uppercase">
              Miembro desde
            </dt>
            <dd className="mt-1 text-sm text-ink">
              {formatDate(user.created_at)}
            </dd>
          </div>
          <div>
            <dt className="text-xs tracking-wide text-ink-3 uppercase">
              Estado
            </dt>
            <dd className="mt-1 text-sm text-ink">
              {user.is_active ? "Activa" : "Desactivada"}
            </dd>
          </div>
        </dl>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <form
          onSubmit={handleEmailSubmit}
          noValidate
          className="space-y-4 rounded-xl border border-line-subtle bg-raised p-6 shadow-raised"
        >
          <div>
            <h2 className="text-sm font-medium text-ink">
              Cambiar correo electrónico
            </h2>
            <p className="mt-1 text-sm text-ink-2">
              Usa tu contraseña actual para confirmar el cambio.
            </p>
          </div>

          <Field
            label="Correo electrónico"
            name="email"
            type="email"
            value={email}
            onChange={setEmail}
            autoComplete="email"
            error={emailFeedback.errors.email}
          />
          <Field
            label="Contraseña actual"
            name="current_password"
            id="email_current_password"
            type="password"
            value={emailPassword}
            onChange={setEmailPassword}
            autoComplete="current-password"
            error={emailFeedback.errors.current_password}
          />

          <Feedback feedback={emailFeedback} />

          <Button type="submit" disabled={emailFeedback.pending}>
            {emailFeedback.pending ? "Guardando…" : "Guardar correo"}
          </Button>
        </form>

        <form
          onSubmit={handlePasswordSubmit}
          noValidate
          className="space-y-4 rounded-xl border border-line-subtle bg-raised p-6 shadow-raised"
        >
          <div>
            <h2 className="text-sm font-medium text-ink">Cambiar contraseña</h2>
            <p className="mt-1 text-sm text-ink-2">
              Mínimo 8 caracteres. Tu sesión actual se mantiene abierta.
            </p>
          </div>

          <Field
            label="Contraseña actual"
            name="current_password"
            type="password"
            value={currentPassword}
            onChange={setCurrentPassword}
            autoComplete="current-password"
            error={passwordFeedback.errors.current_password}
          />
          <Field
            label="Nueva contraseña"
            name="new_password"
            type="password"
            value={newPassword}
            onChange={setNewPassword}
            autoComplete="new-password"
            error={passwordFeedback.errors.new_password}
          />
          <Field
            label="Confirmar nueva contraseña"
            name="confirm_password"
            type="password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            autoComplete="new-password"
            error={passwordFeedback.errors.confirm_password}
          />

          <Feedback feedback={passwordFeedback} />

          <Button type="submit" disabled={passwordFeedback.pending}>
            {passwordFeedback.pending ? "Guardando…" : "Guardar contraseña"}
          </Button>
        </form>
      </div>
    </div>
  );
}
