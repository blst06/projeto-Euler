import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, getStatusLabel, maskCpfCnpj } from "@/lib/utils";
import { Download, FileText, Users, TrendingUp } from "lucide-react";
import type { Cliente, Venda } from "@/lib/types";

export default function Relatorios() {
  const { data: clientes = [], isLoading: loadingClientes } = useQuery<Cliente[]>({ queryKey: ["/api/clientes"] });
  const { data: vendas = [], isLoading: loadingVendas } = useQuery<Venda[]>({ queryKey: ["/api/vendas"] });

  function exportCarteira() {
    const headers = ["ID", "Nome", "Razão Social", "CPF/CNPJ", "Segmento", "Status", "Cidade", "Estado", "Limite Crédito", "Prazo (dias)", "Empresa Atendida", "Origem", "Criado em"];
    const rows = clientes.filter(c => c.ativo).map(c => [
      c.id, c.nome, c.razaoSocial ?? "", maskCpfCnpj(c.cpfCnpj), c.segmento, getStatusLabel(c.status),
      c.cidade ?? "", c.estado ?? "", c.limiteCredito, c.prazo, c.empresaAtendida ?? "", c.origemCliente ?? "", formatDate(c.createdAt)
    ]);
    downloadCSV([headers, ...rows], "carteira-clientes");
  }

  function exportInadimplentes() {
    const inad = clientes.filter(c => c.ativo && (c.status === "inadimplente" || c.status === "risco" || c.status === "bloqueado"));
    const headers = ["ID", "Nome", "CPF/CNPJ", "Status", "Limite Crédito", "Telefone", "Cidade"];
    const rows = inad.map(c => [c.id, c.nome, maskCpfCnpj(c.cpfCnpj), getStatusLabel(c.status), c.limiteCredito, c.telefone ?? "", c.cidade ?? ""]);
    downloadCSV([headers, ...rows], "inadimplentes");
  }

  function exportVendas() {
    const clienteMap = Object.fromEntries(clientes.map(c => [c.id, c.nome]));
    const headers = ["ID", "Cliente", "Valor", "Data", "Vencimento", "Status", "Descrição"];
    const rows = vendas.map(v => [v.id, clienteMap[v.clienteId] ?? v.clienteId, v.valor, formatDate(v.data), formatDate(v.vencimento), getStatusLabel(v.status), v.descricao ?? ""]);
    downloadCSV([headers, ...rows], "historico-vendas");
  }

  function downloadCSV(data: (string | number)[][], name: string) {
    const csv = data.map(r => r.map(c => `"${c}"`).join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${name}-${new Date().toISOString().split("T")[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  const totalAtivos = clientes.filter(c => c.ativo).length;
  const totalLimite = clientes.filter(c => c.ativo).reduce((a, c) => a + c.limiteCredito, 0);
  const totalVendasValor = vendas.reduce((a, v) => a + v.valor, 0);
  const totalPago = vendas.filter(v => v.status === "pago").reduce((a, v) => a + v.valor, 0);
  const taxaAdimplencia = totalAtivos > 0 ? ((clientes.filter(c => c.ativo && c.status === "adimplente").length / totalAtivos) * 100).toFixed(1) : "0";

  const segmentos = clientes.filter(c => c.ativo).reduce<Record<string, number>>((acc, c) => {
    acc[c.segmento] = (acc[c.segmento] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Relatórios</h1>
        <p className="text-sm text-muted-foreground">Exportação e análise da carteira JR FOOD</p>
      </div>

      {/* Exportações */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { icon: Users, title: "Carteira Completa", desc: "Todos os clientes ativos com dados cadastrais e classificação", action: exportCarteira, label: "Exportar Clientes", testId: "btn-export-carteira" },
          { icon: TrendingUp, title: "Inadimplentes / Risco", desc: "Clientes com dívida vencida, em risco ou bloqueados", action: exportInadimplentes, label: "Exportar Inadimplentes", testId: "btn-export-inadimplentes" },
          { icon: FileText, title: "Histórico de Vendas", desc: "Todas as transações registradas com status e vencimento", action: exportVendas, label: "Exportar Vendas", testId: "btn-export-vendas" },
        ].map((item, i) => (
          <Card key={i} className="border-border bg-card">
            <CardContent className="p-5">
              <item.icon className="w-6 h-6 text-primary mb-3" />
              <h3 className="font-semibold text-foreground text-sm mb-1">{item.title}</h3>
              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{item.desc}</p>
              <Button size="sm" variant="outline" className="w-full gap-2 text-xs" onClick={item.action} data-testid={item.testId}>
                <Download className="w-3.5 h-3.5" /> {item.label}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {loadingClientes || loadingVendas ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />) : (
          <>
            <Card className="border-border bg-card"><CardContent className="p-4"><p className="text-2xl font-bold text-foreground">{totalAtivos}</p><p className="text-xs text-muted-foreground mt-0.5">Clientes ativos</p></CardContent></Card>
            <Card className="border-border bg-card"><CardContent className="p-4"><p className="text-2xl font-bold text-foreground">{taxaAdimplencia}%</p><p className="text-xs text-muted-foreground mt-0.5">Taxa de adimplência</p></CardContent></Card>
            <Card className="border-border bg-card"><CardContent className="p-4"><p className="text-lg font-bold text-foreground">{formatCurrency(totalLimite)}</p><p className="text-xs text-muted-foreground mt-0.5">Crédito concedido</p></CardContent></Card>
            <Card className="border-border bg-card"><CardContent className="p-4"><p className="text-lg font-bold text-foreground">{formatCurrency(totalPago)}</p><p className="text-xs text-muted-foreground mt-0.5">Total recebido</p></CardContent></Card>
          </>
        )}
      </div>

      {/* Segmentos */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-foreground">Distribuição por Segmento</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingClientes ? <Skeleton className="h-32 rounded-lg" /> : (
            <div className="space-y-2">
              {Object.entries(segmentos).sort((a, b) => b[1] - a[1]).map(([seg, count]) => {
                const pct = totalAtivos > 0 ? (count / totalAtivos * 100).toFixed(0) : 0;
                return (
                  <div key={seg} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-foreground capitalize">{seg}</span>
                      <span className="text-muted-foreground">{count} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
              {Object.keys(segmentos).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhum cliente cadastrado</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
