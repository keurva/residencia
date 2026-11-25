import { ChartColumn, Loader2, UserRound } from "lucide-react";
import { NavLink, Outlet } from "react-router";

import type { Route } from "./+types/profile";
import { TopBar } from "../components/TopBar";
import { getMe } from "../lib/api";
import type { UserRead } from "../lib/api.types";
import { redirectOnAuthError, requireClientSession } from "../lib/auth-guard";

export type ProfileContext = {
  user: UserRead;
};

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Tu perfil | Cosa" },
    {
      name: "description",
      content: "Consulta tus datos y tus métricas de práctica.",
    },
  ];
}

export async function clientLoader() {
  try {
    await requireClientSession();
    const user = await getMe();
    return { user };
  } catch (error) {
    redirectOnAuthError(error);
  }
}

clientLoader.hydrate = true;

export function HydrateFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center text-ink-2">
      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
      Cargando tu perfil…
    </div>
  );
}

const NAV_ITEMS = [
  { to: "/profile", label: "Datos", icon: UserRound, end: true },
  {
    to: "/profile/metrics",
    label: "Métricas",
    icon: ChartColumn,
    end: false,
  },
] as const;

export default function Profile({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData;
  const initials = user.username.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-canvas">
      <TopBar user={user} />

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex flex-wrap items-start gap-8">
          <aside className="w-full shrink-0 lg:sticky lg:top-20 lg:w-56">
            <div className="rounded-xl border border-line-subtle bg-raised p-4 shadow-raised">
              <div className="flex items-center gap-3">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent"
                  aria-hidden="true"
                >
                  {initials}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">
                    {user.username}
                  </p>
                  <p className="truncate text-xs text-ink-3">{user.email}</p>
                </div>
              </div>
            </div>

            <nav aria-label="Secciones del perfil" className="mt-4 space-y-1">
              {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                      isActive
                        ? "bg-accent-soft text-accent"
                        : "text-ink-2 hover:bg-sunken hover:text-ink"
                    }`
                  }
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {label}
                </NavLink>
              ))}
            </nav>
          </aside>

          <div className="min-w-0 flex-1">
            <Outlet context={{ user } satisfies ProfileContext} />
          </div>
        </div>
      </main>
    </div>
  );
}
