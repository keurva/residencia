import { data, Form, Link, redirect, useNavigation } from "react-router";

import type { Route } from "./+types/signup";
import { Button } from "../components/Button";
import { FormField } from "../components/FormField";
import { ApiError, signup } from "../lib/api";
import { writeClientSession } from "../lib/session";

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
    await writeClientSession({ accessToken: pair.access_token, user: pair.user });
    return redirect("/practice");
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
      {
        errors: { form: "Ocurrió un error inesperado. Inténtalo de nuevo." },
        values,
      },
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
          <h1 className="text-3xl font-semibold tracking-tight text-ink">
            Crea tu cuenta
          </h1>
          <p className="text-ink-2">
            Practica inglés conversacional con IA.
          </p>
        </header>

        {errors.form ? (
          <p
            role="alert"
            className="rounded-xl border border-red-400/40 bg-danger-soft p-3 text-sm text-danger"
          >
            {errors.form}
          </p>
        ) : null}

        <Form method="post" noValidate className="space-y-5">
          <FormField
            label="Correo electrónico"
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={values.email}
            error={errors.email}
          />
          <FormField
            label="Nombre de usuario"
            name="username"
            type="text"
            autoComplete="username"
            defaultValue={values.username}
            error={errors.username}
          />
          <FormField
            label="Contraseña"
            name="password"
            type="password"
            autoComplete="new-password"
            error={errors.password}
          />
          <FormField
            label="Confirmar contraseña"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            error={errors.confirmPassword}
          />

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Creando cuenta…" : "Crear cuenta"}
          </Button>
        </Form>

        <p className="text-center text-sm text-ink-2">
          ¿Ya tienes cuenta?{" "}
          <Link
            to="/login"
            className="rounded-sm font-medium text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Inicia sesión
          </Link>
        </p>
      </div>
    </main>
  );
}
