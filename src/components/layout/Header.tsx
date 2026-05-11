import { Link, useLocation } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Overview" },
  { to: "/wizard", label: "Pre-Flight" },
  { to: "/dashboard", label: "Decision Ledger" },
  { to: "/audit", label: "Audit Trail" },
] as const;

export function Header() {
  const loc = useLocation();
  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <span
            className="grid h-8 w-8 place-items-center rounded-md text-primary-foreground"
            style={{ backgroundImage: "var(--gradient-primary)" }}
          >
            <ShieldCheck className="h-4 w-4" />
          </span>
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight">PayGuard AI</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Smart Payroll Trust
            </div>
          </div>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => {
            const active = loc.pathname === n.to || (n.to !== "/" && loc.pathname.startsWith(n.to));
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                )}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="hidden items-center gap-2 text-xs text-muted-foreground md:flex">
          <span className="inline-block h-2 w-2 rounded-full bg-[color:var(--squad-released)]" />
          Squad API · Live
        </div>
      </div>
    </header>
  );
}
