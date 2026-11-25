import { Mic, PenLine } from "lucide-react";
import { Link, useLocation } from "react-router";

const TABS = [
  { to: "/practice/speaking", label: "Speaking", icon: Mic },
  { to: "/practice/writing", label: "Writing", icon: PenLine },
] as const;

export function PracticeTabs() {
  const { pathname } = useLocation();

  return (
    <nav
      aria-label="Modalidad de práctica"
      className="inline-flex items-center gap-1 rounded-xl border border-line-subtle bg-sunken p-1"
    >
      {TABS.map(({ to, label, icon: Icon }) => {
        const active = pathname === to;
        return (
          <Link
            key={to}
            to={to}
            aria-current={active ? "page" : undefined}
            className={`inline-flex h-9 items-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas ${
              active
                ? "bg-accent text-accent-ink shadow-raised"
                : "text-ink-2 hover:bg-raised hover:text-ink"
            }`}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
