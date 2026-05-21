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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency, formatDate, getStatusLabel, maskCpfCnpj } from "@/lib/utils";
import { Plus, Search, Users, ChevronRight, Lock, Unlock, Loader2, Download } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import type { Cliente } from "@/lib/types";

const segmentos = ["mercado", "acougue", "restaurante", "lanchonete", "outros"];
const origens = ["indicacao", "prospeccao", "midia", "outros"];
const statusColors: Record<string, string> = {
  adimplente: "status-adimplente",
  risco: "status-risco",
  inadimplente: "status-inadimplente",
  bloqueado: "status-bloqueado",
};

function ClienteForm({ onSuccess, initial }: { onSuccess: () => void; initial?: Cliente }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState({
    nome: initial?.nome ?? "",
    razaoSocial: initial?.razaoSocial ?? "",
    cpfCnpj: initial?.cpfCnpj ?? "",
    segmento: initial?.segmento ?? "mercado",
    telefone: initial?.telefone ?? "",
    email: initial?.email ?? "",
    endereco: initial?.endereco ?? "",
    cidade: initial?.cidade ?? "",
    estado: initial?.estado ?? "",
    cep: initial?.cep ?? "",
    origemCliente: initial?.origemCliente ?? "prospeccao",
    empresaAtendida: initial?.empresaAtendida ?? "",
    limiteCredito: initial?.limiteCredito ?? 0,
    prazo: initial?.prazo ?? 30,
    observacoes: initial?.observacoes ?? "",
  });

  const mutation = useMutation({
    mutationFn: (data: typeof form) => initial
      ? apiRequest("PUT", `/api/clientes/${initial.id}`, data)
      : apiRequest("POST", "/api/clientes", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/clientes"] });
      qc.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({ title: initial ? "Cliente atualizado" : "Cliente cadastrado", description: "Operação realizada com sucesso." });
      onSuccess();
    },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const f = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  return (
    <form onSubmit={e => { e.preventDefault(); mutation.mutate(form); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 space-y-1.5">
          <Label>Nome / Razão Social *</Label>
          <Input value={form.nome} onChange={f("nome")} required data-testid="input-nome" />
        </div>
        <div className="space-y-1.5">
          <Label>CPF / CNPJ *</Label>
          <Input value={form.cpfCnpj} onChange={f("cpfCnpj")} required data-testid="input-cpfcnpj" />
        </div>
        <div className="space-y-1.5">
          <Label>Segmento *</Label>
          <Select value={form.segmento} onValueChange={v => setForm(p => ({ ...p, segmento: v }))}>
            <SelectTrigger data-testid="select-segmento"><SelectValue /></SelectTrigger>
            <SelectContent>
              {segmentos.map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Telefone</Label>
          <Input value={form.telefone} onChange={f("telefone")} data-testid="input-telefone" />
        </div>
        <div className="space-y-1.5">
          <Label>E-mail</Label>
          <Input type="email" value={form.email} onChange={f("email")} data-testid="input-email-cliente" />
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label>Endereço</Label>
          <Input value={form.endereco} onChange={f("endereco")} data-testid="input-endereco" />
        </div>
        <div className="space-y-1.5">
          <Label>Cidade</Label>
          <Input value={form.cidade} onChange={f("cidade")} />
        </div>
        <div className="space-y-1.5">
          <Label>Estado</Label>
          <Input value={form.estado} onChange={f("estado")} maxLength={2} />
        </div>
        <div className="space-y-1.5">
          <Label>Origem do Cliente</Label>
          <Select value={form.origemCliente} onValueChange={v => setForm(p => ({ ...p, origemCliente: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {origens.map(o => <SelectItem key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Empresa Atendida Atualmente</Label>
          <Input value={form.empresaAtendida} onChange={f("empresaAtendida")} />
        </div>
        <div className="space-y-1.5">
          <Label>Limite de Crédito (R$)</Label>
          <Input type="number" min={0} value={form.limiteCredito} onChange={e => setForm(p => ({ ...p, limiteCredito: Number(e.target.value) }))} data-testid="input-limite" />
        </div>
        <div className="space-y-1.5">
          <Label>Prazo de Pagamento (dias)</Label>
          <Input type="number" min={0} value={form.prazo} onChange={e => setForm(p => ({ ...p, prazo: Number(e.target.value) }))} data-testid="input-prazo" />
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label>Observações</Label>
          <Textarea value={form.observacoes} onChange={f("observacoes")} rows={2} />
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={mutation.isPending} data-testid="btn-salvar-cliente">
        {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : initial ? "Salvar alterações" : "Cadastrar cliente"}
      </Button>
    </form>
  );
}

export default function Clientes() {
  const [search, setSearch] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [openNew, setOpenNew] = useState(false);
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: clientes = [], isLoading } = useQuery<Cliente[]>({ queryKey: ["/api/clientes"] });

  const bloquearMutation = useMutation({
    mutationFn: (id: number) => apiRequest("PATCH", `/api/clientes/${id}/bloquear`, {}),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/clientes"] }); toast({ title: "Cliente bloqueado" }); },
  });

  const desbloquearMutation = useMutation({
    mutationFn: (id: number) => apiRequest("PATCH", `/api/clientes/${id}/desbloquear`, {}),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/clientes"] }); toast({ title: "Cliente desbloqueado" }); },
  });

  const filtered = clientes.filter(c => {
    const matchSearch = !search ||
      c.nome.toLowerCase().includes(search.toLowerCase()) ||
      c.cpfCnpj.includes(search) ||
      c.cidade?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filtroStatus === "todos" || c.status === filtroStatus;
    return matchSearch && matchStatus && c.ativo;
  });

  function exportarCSV() {
    const headers = ["ID", "Nome", "CPF/CNPJ", "Segmento", "Status", "Cidade", "Estado", "Limite Crédito", "Prazo", "Criado em"];
    const rows = filtered.map(c => [c.id, c.nome, c.cpfCnpj, c.segmento, c.status, c.cidade ?? "", c.estado ?? "", c.limiteCredito, c.prazo, formatDate(c.createdAt)]);
    const csv = [headers, ...rows].map(r => r.join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "carteira-cartivore.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Clientes</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} cliente{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportarCSV} className="gap-1.5 text-xs" data-testid="btn-exportar">
            <Download className="w-3.5 h-3.5" /> Exportar
          </Button>
          <Dialog open={openNew} onOpenChange={setOpenNew}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5" data-testid="btn-novo-cliente">
                <Plus className="w-4 h-4" /> Novo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Cadastrar Cliente</DialogTitle></DialogHeader>
              <ClienteForm onSuccess={() => setOpenNew(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome, CPF/CNPJ ou cidade..." className="pl-9 h-9" value={search} onChange={e => setSearch(e.target.value)} data-testid="input-busca" />
        </div>
        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
          <SelectTrigger className="w-full sm:w-40 h-9" data-testid="select-status-filtro"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="adimplente">Adimplente</SelectItem>
            <SelectItem value="risco">Em Risco</SelectItem>
            <SelectItem value="inadimplente">Inadimplente</SelectItem>
            <SelectItem value="bloqueado">Bloqueado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Users className="w-10 h-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">Nenhum cliente encontrado</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Cadastre um novo cliente para começar</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(cliente => (
            <Card key={cliente.id} className="border-border bg-card hover:shadow-sm transition-all duration-150 cursor-pointer group" data-testid={`card-cliente-${cliente.id}`} onClick={() => navigate(`/clientes/${cliente.id}`)}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-semibold text-foreground text-sm truncate">{cliente.nome}</p>
                      <Badge className={`text-xs px-2 py-0 ${statusColors[cliente.status] ?? ""}`} variant="secondary">
                        {getStatusLabel(cliente.status)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{maskCpfCnpj(cliente.cpfCnpj)}</span>
                      <span>·</span>
                      <span className="capitalize">{cliente.segmento}</span>
                      {cliente.cidade && <><span>·</span><span>{cliente.cidade}{cliente.estado ? `, ${cliente.estado}` : ""}</span></>}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-muted-foreground">Limite</p>
                    <p className="text-sm font-semibold text-foreground">{formatCurrency(cliente.limiteCredito)}</p>
                  </div>
                  {(user?.role === "admin" || user?.role === "gerente") && (
                    <div onClick={e => e.stopPropagation()}>
                      {cliente.status === "bloqueado" ? (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => desbloquearMutation.mutate(cliente.id)} data-testid={`btn-desbloquear-${cliente.id}`}>
                          <Unlock className="w-3.5 h-3.5" />
                        </Button>
                      ) : (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => bloquearMutation.mutate(cliente.id)} data-testid={`btn-bloquear-${cliente.id}`}>
                          <Lock className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  )}
                  <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

    </div>
  );
}
