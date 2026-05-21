import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, TrendingUp, AlertTriangle, XCircle, ShoppingCart, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardStats {
  totalClientes: number;
  adimplentes: number;
  inadimplentes: number;
  risco: number;
  bloqueados: number;
  totalVendas: number;
  totalReceber: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useQuery<DashboardStats>({ queryKey: ["/api/dashboard"] });

  const cards = stats ? [
    { label: "Total de Clientes", value: stats.totalClientes, icon: Users, color: "text-primary", bg: "bg-primary/10" },
    { label: "Adimplentes", value: stats.adimplentes, icon: TrendingUp, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/20" },
    { label: "Em Risco", value: stats.risco, icon: AlertTriangle, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/20" },
    { label: "Inadimplentes", value: stats.inadimplentes, icon: XCircle, color: "text-red-600 dark:text-red-400", bg: "bg-red-100 dark:bg-red-900/20" },
    { label: "Total de Vendas", value: stats.totalVendas, icon: ShoppingCart, color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-100 dark:bg-violet-900/20" },
    { label: "A Receber", value: formatCurrency(stats.totalReceber), icon: DollarSign, color: "text-cyan-600 dark:text-cyan-400", bg: "bg-cyan-100 dark:bg-cyan-900/20", isText: true },
  ] : [];

  const pctAdimplente = stats && stats.totalClientes > 0 ? ((stats.adimplentes / stats.totalClientes) * 100).toFixed(1) : "0";
  const pctInadimplente = stats && stats.totalClientes > 0 ? ((stats.inadimplentes / stats.totalClientes) * 100).toFixed(1) : "0";
  const pctRisco = stats && stats.totalClientes > 0 ? ((stats.risco / stats.totalClientes) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Olá, <span className="text-foreground font-medium">{user?.nome}</span> — visão geral da carteira JR FOOD
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
          : cards.map((card, i) => (
            <Card key={i} className="border-border bg-card hover:shadow-sm transition-shadow duration-200" data-testid={`card-kpi-${i}`}>
              <CardContent className="p-4">
                <div className={`inline-flex p-2 rounded-lg ${card.bg} mb-3`}>
                  <card.icon className={`w-4 h-4 ${card.color}`} />
                </div>
                <p className="text-xl font-bold text-foreground tabular-nums">
                  {card.isText ? card.value : card.value.toLocaleString("pt-BR")}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{card.label}</p>
              </CardContent>
            </Card>
          ))
        }
      </div>

      {/* Distribuição de Status */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground">Distribuição da Carteira</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-8 rounded-lg" />)}
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-foreground font-medium">Adimplentes</span>
                    <span className="text-muted-foreground">{stats?.adimplentes} ({pctAdimplente}%)</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${pctAdimplente}%` }} />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-foreground font-medium">Em Risco</span>
                    <span className="text-muted-foreground">{stats?.risco} ({pctRisco}%)</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${pctRisco}%` }} />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-foreground font-medium">Inadimplentes</span>
                    <span className="text-muted-foreground">{stats?.inadimplentes} ({pctInadimplente}%)</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 rounded-full transition-all duration-500" style={{ width: `${pctInadimplente}%` }} />
                  </div>
                </div>
                {/* Bloqueados */}
                {(stats?.bloqueados ?? 0) > 0 && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-foreground font-medium">Bloqueados</span>
                      <span className="text-muted-foreground">{stats?.bloqueados}</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-gray-400 rounded-full" style={{ width: `${stats && stats.totalClientes > 0 ? (stats.bloqueados / stats.totalClientes * 100).toFixed(1) : 0}%` }} />
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground">Resumo Financeiro</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}</div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div>
                    <p className="text-xs text-muted-foreground">Total a Receber</p>
                    <p className="text-base font-bold text-foreground">{formatCurrency(stats?.totalReceber ?? 0)}</p>
                  </div>
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div>
                    <p className="text-xs text-muted-foreground">Clientes Ativos</p>
                    <p className="text-base font-bold text-foreground">{stats?.totalClientes ?? 0}</p>
                  </div>
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div>
                    <p className="text-xs text-muted-foreground">Total de Transações</p>
                    <p className="text-base font-bold text-foreground">{stats?.totalVendas ?? 0}</p>
                  </div>
                  <ShoppingCart className="w-5 h-5 text-primary" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
