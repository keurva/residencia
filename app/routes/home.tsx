import { Link } from "react-router";

import type { Route } from "./+types/home";
import { parseSession } from "../lib/session";
import { Welcome } from "../welcome/welcome";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Cosa" },
    {
      name: "description",
      content: "Simulador conversacional de inglés con IA.",
    },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const session = await parseSession(request);
  return { user: session?.user ?? null };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <header className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
        <span className="font-semibold text-gray-900 dark:text-gray-100">
          Cosa
        </span>
        {loaderData.user ? (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Hola,{" "}
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {loaderData.user.username}
            </span>
          </span>
        ) : (
          <Link
            to="/signup"
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Crear cuenta
          </Link>
        )}
      </header>
      <Welcome />
    </>
  );
}
