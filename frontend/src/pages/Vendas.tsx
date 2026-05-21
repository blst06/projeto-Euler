import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency, formatDate, getStatusLabel } from "@/lib/utils";
import { Plus, Search, ShoppingCart, Loader2, CheckCircle } from "lucide-react";
import type { Venda, Cliente } from "@/lib/types";

const statusColors: Record<string, string> = {
  pendente: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  pago: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  vencido: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  cancelado: "bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400",
};

function NovaVendaForm({ onSuccess }: { onSuccess: () => void }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({
    clienteId: "",
    valor: "",
    data: today,
    vencimento: "",
    descricao: "",
  });

  const { data: clientes = [] } = useQuery<Cliente[]>({ queryKey: ["/api/clientes"] });

  const mutation = useMutation({
    mutationFn: (data: typeof form) => apiRequest("POST", "/api/vendas", {
      ...data,
      clienteId: Number(data.clienteId),
      valor: Number(data.valor),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/vendas"] });
      qc.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({ title: "Venda registrada com sucesso." });
      onSuccess();
    },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const f = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  return (
    <form onSubmit={e => { e.preventDefault(); mutation.mutate(form); }} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Cliente *</Label>
        <Select value={form.clienteId} onValueChange={v => setForm(p => ({ ...p, clienteId: v }))}>
          <SelectTrigger data-testid="select-cliente-venda"><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
          <SelectContent>
            {clientes.filter(c => c.ativo && c.status !== "bloqueado").map(c => (
              <SelectItem key={c.id} value={String(c.id)}>{c.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Valor (R$) *</Label>
          <Input type="number" min="0.01" step="0.01" value={form.valor} onChange={f("valor")} required data-testid="input-valor-venda" />
        </div>
        <div className="space-y-1.5">
          <Label>Data da Venda *</Label>
          <Input type="date" value={form.data} onChange={f("data")} required />
        </div>
        <div className="space-y-1.5">
          <Label>Vencimento *</Label>
          <Input type="date" value={form.vencimento} onChange={f("vencimento")} required data-testid="input-vencimento" />
        </div>
        <div className="space-y-1.5">
          <Label>Descrição</Label>
          <Input value={form.descricao} onChange={f("descricao")} placeholder="Opcional" />
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={mutation.isPending || !form.clienteId} data-testid="btn-salvar-venda">
        {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Registrar Venda"}
      </Button>
    </form>
  );
}

export default function Vendas() {
  const [search, setSearch] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [openNew, setOpenNew] = useState(false);
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: vendas = [], isLoading } = useQuery<Venda[]>({ queryKey: ["/api/vendas"] });
  const { data: clientes = [] } = useQuery<Cliente[]>({ queryKey: ["/api/clientes"] });

  const clienteMap = Object.fromEntries(clientes.map(c => [c.id, c.nome]));

  const marcarPagoMutation = useMutation({
    mutationFn: (id: number) => apiRequest("PATCH", `/api/vendas/${id}/status`, { status: "pago" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/vendas"] });
      qc.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({ title: "Venda marcada como paga" });
    },
  });

  const filtered = vendas.filter(v => {
    const clienteNome = clienteMap[v.clienteId] ?? "";
    const matchSearch = !search || clienteNome.toLowerCase().includes(search.toLowerCase()) || v.descricao?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filtroStatus === "todos" || v.status === filtroStatus;
    return matchSearch && matchStatus;
  });

  const totalFiltrado = filtered.reduce((acc, v) => acc + v.valor, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Vendas</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} transaç{filtered.length !== 1 ? "ões" : "ão"} · Total: {formatCurrency(totalFiltrado)}</p>
        </div>
        <Dialog open={openNew} onOpenChange={setOpenNew}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5" data-testid="btn-nova-venda">
              <Plus className="w-4 h-4" /> Nova Venda
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Registrar Venda</DialogTitle></DialogHeader>
            <NovaVendaForm onSuccess={() => setOpenNew(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar por cliente ou descrição..." className="pl-9 h-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
          <SelectTrigger className="w-full sm:w-36 h-9"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="pago">Pago</SelectItem>
            <SelectItem value="vencido">Vencido</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ShoppingCart className="w-10 h-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">Nenhuma venda encontrada</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(venda => (
            <Card key={venda.id} className="border-border bg-card hover:shadow-sm transition-all" data-testid={`card-venda-${venda.id}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-semibold text-foreground text-sm truncate">{clienteMap[venda.clienteId] ?? "Cliente #" + venda.clienteId}</p>
                      <Badge className={`text-xs px-2 py-0 ${statusColors[venda.status] ?? ""}`} variant="secondary">
                        {getStatusLabel(venda.status)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>Venda: {formatDate(venda.data)}</span>
                      <span>·</span>
                      <span>Vence: {formatDate(venda.vencimento)}</span>
                      {venda.descricao && <><span>·</span><span className="truncate max-w-32">{venda.descricao}</span></>}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-base font-bold text-foreground">{formatCurrency(venda.valor)}</p>
                  </div>
                  {venda.status === "pendente" || venda.status === "vencido" ? (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-emerald-600" onClick={() => marcarPagoMutation.mutate(venda.id)} title="Marcar como pago" data-testid={`btn-marcar-pago-${venda.id}`}>
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                  ) : <div className="w-8" />}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
