import { Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

import type { Route } from "./+types/practice";
import { Button } from "../components/Button";
import { TopBar } from "../components/TopBar";
import { LevelPicker } from "../components/practice/LevelPicker";
import { ScenarioGrid } from "../components/practice/ScenarioGrid";
import { SessionList } from "../components/practice/SessionList";
import { ApiError, createSession, getScenarios, listSessions } from "../lib/api";
import type { Escenario, NivelMCER } from "../lib/api.types";
import { redirectOnAuthError, requireClientSession } from "../lib/auth-guard";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Practicar | Cosa" },
    {
      name: "description",
      content: "Elige escenario y nivel para practicar inglés conversacional.",
    },
  ];
}

export async function clientLoader() {
  try {
    const session = await requireClientSession();
    const [catalogo, sesiones] = await Promise.all([
      getScenarios(),
      listSessions(),
    ]);
    return { user: session.user, catalogo, sesiones };
  } catch (error) {
    redirectOnAuthError(error);
  }
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

export default function Practice({ loaderData }: Route.ComponentProps) {
  const { user, catalogo, sesiones } = loaderData;
  const navigate = useNavigate();
  const [escenario, setEscenario] = useState<Escenario | null>(null);
  const [nivel, setNivel] = useState<NivelMCER | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const escenarioNombres = Object.fromEntries(
    catalogo.escenarios.map((item) => [item.clave, item.nombre]),
  ) as Record<Escenario, string>;

  async function handleStart() {
    if (!escenario || !nivel || creating) {
      return;
    }
    setCreating(true);
    setError(null);
    try {
      const sesion = await createSession({ escenario, nivel });
      navigate(`/practice/${sesion.id_sesion}`);
    } catch (cause) {
      if (cause instanceof ApiError) {
        if (cause.status === 401) {
          navigate("/login");
          return;
        }
        setError(cause.message);
      } else {
        setError("Ocurrió un error inesperado. Inténtalo de nuevo.");
      }
      setCreating(false);
    }
  }

  function scrollToSelection() {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document
      .getElementById("nueva-practica")
      ?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  }

  return (
    <div className="min-h-screen bg-canvas">
      <TopBar user={user} />

      <main className="mx-auto max-w-5xl px-6 py-10">
        <section id="nueva-practica" className="scroll-mt-20">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            Nueva práctica
          </h1>
          <p className="mt-1 text-sm text-ink-2">
            Elige un escenario y tu nivel. El agente abrirá la conversación en
            inglés.
          </p>

          <div className="mt-8 space-y-8">
            <div>
              <h2 className="text-sm font-medium text-ink">Escenario</h2>
              <div className="mt-3">
                <ScenarioGrid
                  escenarios={catalogo.escenarios}
                  value={escenario}
                  onChange={setEscenario}
                  disabled={creating}
                />
              </div>
            </div>

            <div>
              <h2 className="text-sm font-medium text-ink">Nivel</h2>
              <div className="mt-3 max-w-2xl">
                <LevelPicker
                  niveles={catalogo.niveles}
                  value={nivel}
                  onChange={setNivel}
                  disabled={creating}
                />
              </div>
            </div>

            {error ? (
              <p
                role="alert"
                className="rounded-xl border border-red-400/40 bg-danger-soft px-4 py-3 text-sm text-danger"
              >
                {error}
              </p>
            ) : null}

            <div className="flex items-center gap-4">
              <Button
                onClick={handleStart}
                disabled={!escenario || !nivel || creating}
              >
                {creating ? (
                  <>
                    <Loader2
                      className="h-4 w-4 animate-spin"
                      aria-hidden="true"
                    />
                    Preparando la conversación…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" aria-hidden="true" />
                    Comenzar práctica
                  </>
                )}
              </Button>
              {!escenario || !nivel ? (
                <span className="text-xs text-ink-3">
                  Selecciona escenario y nivel para comenzar.
                </span>
              ) : null}
            </div>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-sm font-medium text-ink">Tus sesiones</h2>
          <div className="mt-3">
            {sesiones.length > 0 ? (
              <SessionList
                sesiones={sesiones}
                escenarioNombres={escenarioNombres}
              />
            ) : (
              <div className="flex flex-col items-center rounded-xl border border-line-subtle bg-raised px-6 py-10 text-center shadow-raised">
                <svg
                  viewBox="0 0 48 48"
                  fill="none"
                  className="h-12 w-12 text-ink-3"
                  aria-hidden="true"
                >
                  <path
                    d="M10 9h20a4 4 0 0 1 4 4v12a4 4 0 0 1-4 4H20l-7 6v-6h-3a4 4 0 0 1-4-4V13a4 4 0 0 1 4-4Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M17 17v6M22 14v12M27 18v4M32 16v8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <p className="mt-4 text-sm font-medium text-ink">
                  Aún no tienes prácticas
                </p>
                <p className="mt-1 max-w-sm text-sm text-ink-2">
                  Cuando termines tu primera conversación, aquí verás su informe
                  y podrás retomarla.
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-5"
                  onClick={scrollToSelection}
                >
                  Elegir escenario
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
