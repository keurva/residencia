import { LogOut } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";

import { logout } from "../lib/api";
import type { UserRead } from "../lib/api.types";
import { modoDesdeRuta, rutaPractica } from "../lib/practice-mode";
import { clearClientSession } from "../lib/session";
import { Button } from "./Button";

export function TopBar({ user }: { user: UserRead }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [leaving, setLeaving] = useState(false);

  async function handleLogout() {
    setLeaving(true);
    try {
      await logout();
    } catch {
      setLeaving(false);
    }
    clearClientSession();
    navigate("/login", { replace: true });
  }

  return (
    <header className="sticky top-0 z-20 border-b border-line-subtle bg-canvas/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <Link
          to={rutaPractica(modoDesdeRuta(pathname))}
          className="flex items-baseline gap-2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <span className="text-base font-semibold tracking-tight text-ink">
            Inglés
          </span>
          <span className="text-xs text-ink-3">Simulador</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            to="/profile"
            aria-label={`Abrir el perfil de ${user.username}`}
            className="truncate rounded-md px-2 py-1 text-sm text-ink-2 transition-colors duration-150 hover:bg-sunken hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {user.username}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            disabled={leaving}
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </header>
  );
}
