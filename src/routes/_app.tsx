import { createFileRoute, Outlet, useNavigate, Link, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { LayoutDashboard, Store, BriefcaseBusiness, Users, LogOut, Rocket, Coins, ShieldCheck } from "lucide-react";
// keep Users import referenced
void Users;
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const { currentUser, logout, isAdmin } = useApp();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!currentUser) navigate({ to: "/auth" });
  }, [currentUser, navigate]);

  if (!currentUser) return null;

  const items = [
    { to: "/dashboard", label: "Личный кабинет", icon: LayoutDashboard },
    { to: "/team", label: "Наша команда", icon: Users },
    { to: "/shop", label: "Магазин бонусов", icon: Store },
    { to: "/jobs", label: "Карта должностей", icon: BriefcaseBusiness },
    ...(isAdmin ? [{ to: "/admin", label: "Админ-панель", icon: ShieldCheck }] : []),
  ] as const;

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-64 shrink-0 bg-sidebar text-sidebar-foreground flex flex-col">
        <div className="px-5 py-5 flex items-center gap-3 border-b border-sidebar-border">
          <div className="h-9 w-9 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground grid place-items-center">
            <Rocket className="h-5 w-5" />
          </div>
          <div>
            <div className="font-bold leading-tight">ElecardSpace</div>
            <div className="text-[11px] text-sidebar-foreground/60">internal portal</div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {items.map((it) => {
            const active = pathname === it.to || pathname.startsWith(it.to + "/");
            return (
              <Link
                key={it.to}
                to={it.to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <it.icon className="h-4 w-4" />
                {it.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-sidebar-border space-y-3">
          <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent/60 p-2.5">
            <img src={currentUser.avatar} alt="" className="h-9 w-9 rounded-full" />
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{currentUser.name}</div>
              <div className="text-[11px] text-sidebar-foreground/60 truncate">{currentUser.position}</div>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-sidebar-primary/15 px-3 py-2">
            <div className="flex items-center gap-2 text-sm">
              <Coins className="h-4 w-4 text-coin" />
              <span className="font-semibold">{currentUser.balance}</span>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-sidebar-foreground/60">bonus</span>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={() => { logout(); navigate({ to: "/auth" }); }}
          >
            <LogOut className="h-4 w-4 mr-2" /> Выйти
          </Button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}

