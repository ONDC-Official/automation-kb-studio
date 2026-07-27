import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";

import ThemeToggle from "@/components/ThemeToggle";
import { useIdentity } from "@/hooks/useIdentity";
import { cn } from "@/lib/utils";
import { NAV } from "./constants";

/** App chrome: a top bar (title + role-filtered nav tabs + theme + identity chip) over the page outlet. */
const Layout = ({ children }: { children: ReactNode }) => {
  const { data: identity } = useIdentity();
  const isAdmin = identity?.role === "admin";

  return (
    <div className="flex h-full flex-col">
      <header className="flex h-12 shrink-0 items-center gap-4 border-b border-border bg-surface px-4">
        <span className="font-semibold tracking-tight">KB Studio</span>
        <nav className="flex items-center gap-1">
          {NAV.filter((n) => !n.adminOnly || isAdmin).map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors",
                  isActive ? "bg-accent-100 text-accent-700" : "text-neutral-600 hover:bg-neutral-200 hover:text-foreground",
                )
              }
            >
              <Icon className="size-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          {identity && (
            <span
              className="flex items-center gap-1.5 rounded-md bg-neutral-200 px-2 py-1 text-xs text-neutral-700"
              title={`${identity.actor.email} · ${identity.role}`}
            >
              <span className="font-medium">{identity.actor.name || identity.actor.email}</span>
              <span className="text-neutral-500">· {identity.role}</span>
            </span>
          )}
        </div>
      </header>
      <main className="min-h-0 flex-1 overflow-hidden">{children}</main>
    </div>
  );
};

export default Layout;
