import { Link } from "react-router";

import type { Route } from "./+types/home";
import { buttonClassName } from "../components/Button";
import { parseSession } from "../lib/session";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Cosa | Simulador conversacional de inglés" },
    {
      name: "description",
      content:
        "Practica inglés conversacional con un agente de IA y recibe un informe al cerrar la sesión.",
    },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const session = await parseSession(request);
  return { user: session?.user ?? null };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="border-b border-line-subtle">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <span className="text-base font-semibold tracking-tight text-ink">
            Cosa
          </span>
          {loaderData.user ? (
            <span className="text-sm text-ink-2">
              Hola, {loaderData.user.username}
            </span>
          ) : null}
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-xl">
          <h1 className="text-4xl font-semibold tracking-tight text-balance text-ink">
            Practica inglés hablando, no memorizando.
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-2">
            Conversa por voz con un agente de IA en escenarios cotidianos.
            Elige tu nivel, practica a tu ritmo y recibe un informe al cerrar
            la sesión.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {loaderData.user ? (
              <Link to="/practice" className={buttonClassName("primary")}>
                Ir a practicar
              </Link>
            ) : (
              <>
                <Link to="/login" className={buttonClassName("primary")}>
                  Iniciar sesión
                </Link>
                <Link to="/signup" className={buttonClassName("secondary")}>
                  Crear cuenta
                </Link>
              </>
            )}
          </div>

          <ul className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-2">
            <li>6 escenarios cotidianos</li>
            <li className="text-ink-3" aria-hidden="true">
              ·
            </li>
            <li>Niveles A1 a C1</li>
            <li className="text-ink-3" aria-hidden="true">
              ·
            </li>
            <li>Informe orientativo al cerrar</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
