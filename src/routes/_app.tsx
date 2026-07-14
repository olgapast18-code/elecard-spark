import { createFileRoute, Outlet, useNavigate, Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import { LayoutDashboard, Store, BriefcaseBusiness, Users, LogOut, Coins, ShieldCheck, UserCircle, Link2, Menu, Home, Cake, MessageSquare, Sparkles, ShoppingCart, ClipboardList, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { SearchDialog } from "@/components/SearchDialog";
import elecardLogo from "@/assets/elecard-logo.jpg.asset.json";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const { currentUser, logout, isAdmin, unreadCount, cart } = useApp();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!currentUser) navigate({ to: "/auth" });
  }, [currentUser, navigate]);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  if (!currentUser) return null;

  const items = [
    { to: "/home", label: "Главная страница", icon: Home, badge: 0 },
    { to: "/dashboard", label: "Личный кабинет", icon: LayoutDashboard, badge: 0 },
    { to: "/team", label: "Наша команда", icon: Users, badge: 0 },
    { to: "/birthdays", label: "Календарь именинников", icon: Cake, badge: 0 },
    { to: "/messenger", label: "Мессенджер", icon: MessageSquare, badge: unreadCount },
    { to: "/shop", label: "Магазин бонусов", icon: Store, badge: 0 },
    { to: "/cart", label: "Корзина", icon: ShoppingCart, badge: cart.length },
    { to: "/bonuses", label: "Как заработать бонусы", icon: Sparkles, badge: 0 },
    { to: "/jobs", label: "Карта должностей", icon: BriefcaseBusiness, badge: 0 },
    { to: "/polls", label: "Опросы", icon: ClipboardList, badge: 0 },
    { to: "/links", label: "Полезные ссылки", icon: Link2, badge: 0 },
    { to: "/profile", label: "Моя карточка", icon: UserCircle, badge: 0 },
    ...(isAdmin ? [{ to: "/admin", label: "Админ-панель", icon: ShieldCheck, badge: 0 }] : []),
  ] as const;

  const SidebarContent = () => (
    <div className="h-full flex flex-col bg-sidebar text-sidebar-foreground">
      <div className="px-5 py-5 flex items-center gap-3 border-b border-sidebar-border">
        <div className="h-10 w-10 rounded-lg bg-white grid place-items-center overflow-hidden shrink-0 p-1">
          <img src={elecardLogo.url} alt="Elecard" className="max-h-full max-w-full object-contain" />
        </div>
        <div>
          <div className="font-bold leading-tight">ElecardSpace</div>
          <div className="text-[11px] text-sidebar-foreground/60">internal portal</div>
        </div>
      </div>

      <div className="px-3 pt-3">
        <button
          onClick={() => setSearchOpen(true)}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-sidebar-accent/50 hover:bg-sidebar-accent text-sm text-sidebar-foreground/70 transition-colors"
        >
          <Search className="h-4 w-4" />
          <span className="flex-1 text-left">Поиск…</span>
          <kbd className="text-[10px] opacity-60 hidden md:inline">⌘K</kbd>
        </button>
      </div>


      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
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
              <it.icon className="h-4 w-4 shrink-0" />
              <span className="flex-1 truncate">{it.label}</span>
              {it.badge > 0 && <Badge className="bg-brand text-primary-foreground h-5 px-1.5 text-[10px]">{it.badge}</Badge>}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border space-y-3">
        <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent/60 p-2.5">
          <img src={currentUser.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
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
    </div>
  );

  return (
    <div className="min-h-[100dvh] flex bg-background">
      <aside className="hidden md:flex w-64 shrink-0 flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 h-14 bg-sidebar text-sidebar-foreground flex items-center justify-between px-3 border-b border-sidebar-border safe-pt">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-sidebar-foreground hover:bg-sidebar-accent">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72 bg-sidebar border-sidebar-border">
            <SheetTitle className="sr-only">Меню навигации</SheetTitle>
            <SidebarContent />
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-white grid place-items-center overflow-hidden p-0.5">
            <img src={elecardLogo.url} alt="Elecard" className="max-h-full max-w-full object-contain" />
          </div>
          <span className="font-bold text-sm">ElecardSpace</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-sidebar-foreground hover:bg-sidebar-accent" onClick={() => setSearchOpen(true)}>
            <Search className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-1.5 rounded-full bg-sidebar-primary/20 px-2.5 py-1 text-xs">
            <Coins className="h-3.5 w-3.5 text-coin" />
            <span className="font-semibold">{currentUser.balance}</span>
          </div>
        </div>
      </div>

      <main className="flex-1 min-w-0 overflow-x-hidden pt-14 md:pt-0">
        <Outlet />
      </main>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
