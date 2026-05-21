import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate, getStatusLabel } from "@/lib/utils";
import { AlertTriangle, CheckCircle, Clock, TrendingDown } from "lucide-react";
import type { Venda, Cliente } from "@/lib/types";

export default function Financeiro() {
  const { data: vendas = [], isLoading } = useQuery<Venda[]>({ queryKey: ["/api/vendas"] });
  const { data: clientes = [] } = useQuery<Cliente[]>({ queryKey: ["/api/clientes"] });

  const clienteMap = Object.fromEntries(clientes.map(c => [c.id, c.nome]));

  const hoje = new Date().toISOString().split("T")[0];
  const pendentes = vendas.filter(v => v.status === "pendente");
  const vencidas = vendas.filter(v => v.status === "vencido" || (v.status === "pendente" && v.vencimento < hoje));
  const pagas = vendas.filter(v => v.status === "pago");

  const totalPendente = pendentes.reduce((a, v) => a + v.valor, 0);
  const totalVencido = vencidas.reduce((a, v) => a + v.valor, 0);
  const totalPago = pagas.reduce((a, v) => a + v.valor, 0);

  const summaryCards = [
    { label: "Pendente", value: totalPendente, count: pendentes.length, icon: Clock, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/20" },
    { label: "Vencido", value: totalVencido, count: vencidas.length, icon: AlertTriangle, color: "text-red-600 dark:text-red-400", bg: "bg-red-100 dark:bg-red-900/20" },
    { label: "Pago", value: totalPago, count: pagas.length, icon: CheckCircle, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/20" },
    { label: "Inadimplência", value: totalVencido, count: null, icon: TrendingDown, color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-100 dark:bg-orange-900/20" },
  ];

  const vencidasOrdenadas = [...vencidas].sort((a, b) => a.vencimento.localeCompare(b.vencimento));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Financeiro</h1>
        <p className="text-sm text-muted-foreground">Visão de crédito, inadimplência e pagamentos</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
          : summaryCards.map((card, i) => (
            <Card key={i} className="border-border bg-card">
              <CardContent className="p-4">
                <div className={`inline-flex p-2 rounded-lg ${card.bg} mb-3`}>
                  <card.icon className={`w-4 h-4 ${card.color}`} />
                </div>
                <p className="text-lg font-bold text-foreground tabular-nums">{formatCurrency(card.value)}</p>
                <p className="text-xs text-muted-foreground">{card.label}{card.count !== null ? ` · ${card.count} lançamentos` : ""}</p>
              </CardContent>
            </Card>
          ))}
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            Títulos Vencidos / Em Atraso
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}</div>
          ) : vencidasOrdenadas.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <CheckCircle className="w-8 h-8 text-emerald-500/50 mb-2" />
              <p className="text-sm text-muted-foreground">Nenhum título vencido. Carteira saudável.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {vencidasOrdenadas.map(v => {
                const diasAtraso = Math.floor((new Date().getTime() - new Date(v.vencimento).getTime()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={v.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border" data-testid={`row-vencida-${v.id}`}>
                    <div>
                      <p className="text-sm font-medium text-foreground">{clienteMap[v.clienteId] ?? "Cliente #" + v.clienteId}</p>
                      <p className="text-xs text-muted-foreground">Venceu {formatDate(v.vencimento)} · {diasAtraso > 0 ? `${diasAtraso} dia${diasAtraso > 1 ? "s" : ""} em atraso` : "Vence hoje"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-red-600 dark:text-red-400">{formatCurrency(v.valor)}</p>
                      <Badge className="text-xs px-2 py-0 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" variant="secondary">
                        {getStatusLabel(v.status)}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-foreground">Clientes com Maior Exposição de Crédito</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 rounded-lg" />)}</div>
          ) : (
            <div className="space-y-2">
              {clientes
                .filter(c => c.ativo)
                .sort((a, b) => b.limiteCredito - a.limiteCredito)
                .slice(0, 10)
                .map(c => (
                  <div key={c.id} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        c.status === "adimplente" ? "bg-emerald-500" :
                        c.status === "risco" ? "bg-amber-500" :
                        c.status === "inadimplente" ? "bg-red-500" : "bg-gray-400"
                      }`} />
                      <span className="text-sm text-foreground font-medium">{c.nome}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">{formatCurrency(c.limiteCredito)}</p>
                      <p className="text-xs text-muted-foreground">Prazo: {c.prazo}d</p>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
