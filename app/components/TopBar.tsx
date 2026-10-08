import { LogOut } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";

import { logout } from "../lib/api";
import type { UserRead } from "../lib/api.types";
import { clearClientSession } from "../lib/session";
import { Button } from "./Button";

export function TopBar({ user }: { user: UserRead }) {
  const navigate = useNavigate();
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
          to="/practice"
          className="flex items-baseline gap-2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <span className="text-base font-semibold tracking-tight text-ink">
            Cosa
          </span>
          <span className="text-xs text-ink-3">Simulador de inglés</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-sm text-ink-2">{user.username}</span>
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
