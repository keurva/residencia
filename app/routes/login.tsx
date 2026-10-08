import { data, Form, Link, redirect, useNavigation } from "react-router";
import { Loader2 } from "lucide-react";

import type { Route } from "./+types/login";
import { Button } from "../components/Button";
import { FormField } from "../components/FormField";
import { ApiError, login } from "../lib/api";
import { readClientSession, writeClientSession } from "../lib/session";

type ActionData = {
  errors: Partial<Record<"email" | "password" | "form", string>>;
  values: { email: string };
};

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Iniciar sesión | Cosa" },
    {
      name: "description",
      content: "Entra para practicar inglés conversacional con IA.",
    },
  ];
}

export async function clientLoader() {
  const session = await readClientSession();
  if (session) {
    return redirect("/practice");
  }
  return null;
}

clientLoader.hydrate = true;

export function HydrateFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center text-ink-2">
      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
      Cargando…
    </div>
  );
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const values = { email };

  const errors: ActionData["errors"] = {};

  if (!email) {
    errors.email = "Ingresa tu correo electrónico.";
  }
  if (!password) {
    errors.password = "Ingresa tu contraseña.";
  }

  if (Object.keys(errors).length > 0) {
    return data<ActionData>({ errors, values }, { status: 400 });
  }

  try {
    const pair = await login({ email, password });
    await writeClientSession({ accessToken: pair.access_token, user: pair.user });
    return redirect("/practice");
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 401) {
        return data<ActionData>(
          {
            errors: { form: "Correo o contraseña incorrectos." },
            values,
          },
          { status: 401 },
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

export default function Login({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const errors = actionData?.errors ?? {};
  const values = actionData?.values ?? { email: "" };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <header className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-ink">
            Inicia sesión
          </h1>
          <p className="text-ink-2">
            Continúa tu práctica de inglés donde la dejaste.
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
            label="Contraseña"
            name="password"
            type="password"
            autoComplete="current-password"
            error={errors.password}
          />

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Entrando…" : "Entrar"}
          </Button>
        </Form>

        <p className="text-center text-sm text-ink-2">
          ¿Aún no tienes cuenta?{" "}
          <Link
            to="/signup"
            className="rounded-sm font-medium text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Crea una
          </Link>
        </p>
      </div>
    </main>
  );
}
