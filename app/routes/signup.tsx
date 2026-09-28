import { data, Form, Link, redirect, useNavigation } from "react-router";

import type { Route } from "./+types/signup";
import { ApiError, signup } from "../lib/api";
import { sessionCookie } from "../lib/session";

const USERNAME_PATTERN = /^[A-Za-z0-9_-]+$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FieldName = "email" | "username" | "password" | "confirmPassword";

type ActionData = {
  errors: Partial<Record<FieldName | "form", string>>;
  values: { email: string; username: string };
};

const SERVER_FIELD_MESSAGES: Partial<Record<string, string>> = {
  email: "Ingresa un correo electrónico válido.",
  username:
    "El usuario solo puede tener letras, números, guiones y guiones bajos (máx. 128).",
  password: "La contraseña debe tener entre 8 y 128 caracteres.",
};

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Crear cuenta | Cosa" },
    {
      name: "description",
      content: "Regístrate para practicar inglés conversacional con IA.",
    },
  ];
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  const values = { email, username };
  const errors: ActionData["errors"] = {};

  if (!email) {
    errors.email = "Ingresa tu correo electrónico.";
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = "Ingresa un correo electrónico válido.";
  }

  if (!username) {
    errors.username = "Ingresa un nombre de usuario.";
  } else if (!USERNAME_PATTERN.test(username)) {
    errors.username =
      "Solo se permiten letras, números, guiones y guiones bajos.";
  } else if (username.length > 128) {
    errors.username = "El usuario no puede exceder 128 caracteres.";
  }

  if (password.length < 8) {
    errors.password = "La contraseña debe tener al menos 8 caracteres.";
  } else if (password.length > 128) {
    errors.password = "La contraseña no puede exceder 128 caracteres.";
  }

  if (password !== confirmPassword) {
    errors.confirmPassword = "Las contraseñas no coinciden.";
  }

  if (Object.keys(errors).length > 0) {
    return data<ActionData>({ errors, values }, { status: 400 });
  }

  try {
    const pair = await signup({ email, username, password });
    document.cookie = await sessionCookie.serialize({
      accessToken: pair.access_token,
      user: pair.user,
    });
    return redirect("/");
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 409) {
        return data<ActionData>(
          {
            errors: {
              form: "Ese correo o nombre de usuario ya está registrado.",
            },
            values,
          },
          { status: 409 },
        );
      }

      if (error.status === 422) {
        const fieldErrors: ActionData["errors"] = {};
        for (const [field, message] of Object.entries(error.fieldErrors)) {
          if (field === "email" || field === "username" || field === "password") {
            fieldErrors[field] = SERVER_FIELD_MESSAGES[field] ?? message;
          }
        }
        return data<ActionData>(
          {
            errors:
              Object.keys(fieldErrors).length > 0
                ? fieldErrors
                : { form: error.message },
            values,
          },
          { status: 422 },
        );
      }

      return data<ActionData>(
        { errors: { form: error.message }, values },
        { status: error.status || 500 },
      );
    }

    return data<ActionData>(
      { errors: { form: "Ocurrió un error inesperado. Inténtalo de nuevo." }, values },
      { status: 500 },
    );
  }
}

export default function Signup({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const errors = actionData?.errors ?? {};
  const values = actionData?.values ?? { email: "", username: "" };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <header className="space-y-2 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Crea tu cuenta
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Practica inglés conversacional con IA.
          </p>
        </header>

        {errors.form ? (
          <p
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
          >
            {errors.form}
          </p>
        ) : null}

        <Form method="post" noValidate className="space-y-5">
          <Field
            label="Correo electrónico"
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={values.email}
            error={errors.email}
          />
          <Field
            label="Nombre de usuario"
            name="username"
            type="text"
            autoComplete="username"
            defaultValue={values.username}
            error={errors.username}
          />
          <Field
            label="Contraseña"
            name="password"
            type="password"
            autoComplete="new-password"
            error={errors.password}
          />
          <Field
            label="Confirmar contraseña"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            error={errors.confirmPassword}
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-blue-600 px-4 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Creando cuenta…" : "Crear cuenta"}
          </button>
        </Form>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          <Link
            to="/"
            className="font-medium text-blue-700 hover:underline dark:text-blue-500"
          >
            Volver al inicio
          </Link>
        </p>
      </div>
    </main>
  );
}

type FieldProps = {
  label: string;
  name: string;
  type: string;
  error?: string;
  autoComplete?: string;
  defaultValue?: string;
};

function Field({
  label,
  name,
  type,
  error,
  autoComplete,
  defaultValue,
}: FieldProps) {
  const errorId = `${name}-error`;

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-900 dark:text-gray-100"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`block w-full rounded-xl border px-3 py-2 text-gray-900 shadow-sm outline-none focus:ring-2 dark:bg-gray-900 dark:text-gray-100 ${
          error
            ? "border-red-400 focus:ring-red-300 dark:border-red-700"
            : "border-gray-300 focus:border-blue-500 focus:ring-blue-200 dark:border-gray-700"
        }`}
      />
      {error ? (
        <p id={errorId} className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}
