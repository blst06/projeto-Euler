import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, Users, ShoppingCart, CreditCard, MapPin,
  LogOut, Menu, X, Sun, Moon, ChevronRight, FileText, Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles?: string[];
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Clientes", href: "/clientes", icon: Users },
  { label: "Vendas", href: "/vendas", icon: ShoppingCart },
  { label: "Financeiro", href: "/financeiro", icon: CreditCard },
  { label: "Mapa", href: "/mapa", icon: MapPin },
  { label: "Relatórios", href: "/relatorios", icon: FileText },
  { label: "Usuários", href: "/usuarios", icon: Settings, roles: ["admin"] },
];

interface LayoutProps {
  children: React.ReactNode;
  theme: "light" | "dark";
  toggleTheme: () => void;
}

export default function Layout({ children, theme, toggleTheme }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const visibleItems = navItems.filter(
    item => !item.roles || (user && item.roles.includes(user.role))
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-border">
        <div className="flex items-center gap-3">
          <svg viewBox="0 0 36 36" fill="none" aria-label="Cartivore" className="w-8 h-8 flex-shrink-0">
            <rect width="36" height="36" rx="8" fill="hsl(var(--primary))"/>
            <path d="M8 18C8 12.477 12.477 8 18 8s10 4.477 10 10-4.477 10-10 10" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="18" cy="18" r="3.5" fill="white"/>
            <path d="M18 14.5V12M21.5 18H24M18 21.5V24M14.5 18H12" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <div>
            <h1 className="font-bold text-base text-foreground tracking-tight">Cartivore</h1>
            <p className="text-xs text-muted-foreground">Gestão de Carteira</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {visibleItems.map((item) => {
          const active = location === item.href || (item.href !== "/" && location.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}>
              <a
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1">{item.label}</span>
                {active && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
              </a>
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-border space-y-1">
        <div className="px-3 py-2 rounded-lg bg-secondary/50">
          <p className="text-xs font-semibold text-foreground truncate">{user?.nome}</p>
          <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" className="flex-1 justify-start gap-2 text-muted-foreground hover:text-foreground" onClick={toggleTheme}>
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span className="text-xs">{theme === "dark" ? "Claro" : "Escuro"}</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-destructive" onClick={logout} data-testid="btn-logout">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 flex-col border-r border-border bg-card flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-card border-r border-border z-50 animate-slide-in">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </Button>
          <span className="font-semibold text-sm text-foreground">Cartivore</span>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
