import { useState, useEffect } from "react";
import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Clientes from "@/pages/Clientes";
import Vendas from "@/pages/Vendas";
import Financeiro from "@/pages/Financeiro";
import Mapa from "@/pages/Mapa";
import Relatorios from "@/pages/Relatorios";
import Usuarios from "@/pages/Usuarios";
import ClienteDetalhe from "@/pages/ClienteDetalhe";

function AppRoutes({ theme, toggleTheme }: { theme: "light" | "dark"; toggleTheme: () => void }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg viewBox="0 0 36 36" fill="none" className="w-10 h-10 animate-pulse">
            <rect width="36" height="36" rx="8" fill="hsl(var(--primary))"/>
            <path d="M8 18C8 12.477 12.477 8 18 8s10 4.477 10 10-4.477 10-10 10" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="18" cy="18" r="3.5" fill="white"/>
          </svg>
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Login />;

  return (
    <Router hook={useHashLocation}>
      <Layout theme={theme} toggleTheme={toggleTheme}>
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/clientes" component={Clientes} />
          <Route path="/clientes/:id" component={ClienteDetalhe} />
          <Route path="/vendas" component={Vendas} />
          <Route path="/financeiro" component={Financeiro} />
          <Route path="/mapa" component={Mapa} />
          <Route path="/relatorios" component={Relatorios} />
          <Route path="/usuarios" component={Usuarios} />
        </Switch>
      </Layout>
    </Router>
  );
}

export default function App() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
    return "light";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  function toggleTheme() {
    setTheme(t => t === "dark" ? "light" : "dark");
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRoutes theme={theme} toggleTheme={toggleTheme} />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}
