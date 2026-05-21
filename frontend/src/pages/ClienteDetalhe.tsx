import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient, useQueries } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency, formatDate, getStatusLabel, maskCpfCnpj } from "@/lib/utils";
import {
  ArrowLeft, Edit2, Save, X, Lock, Unlock, Loader2,
  ShoppingCart, CreditCard, Clock, Phone, Mail, MapPin,
  DollarSign, FileText, CheckCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import type { Cliente, Venda, Pagamento, Historico } from "@/lib/types";

type ClienteEditForm = Pick<Cliente,
  | "nome" | "razaoSocial" | "cpfCnpj" | "segmento" | "telefone"
  | "email" | "endereco" | "cidade" | "estado" | "cep"
  | "origemCliente" | "empresaAtendida" | "limiteCredito" | "prazo" | "observacoes"
>;

const statusColors: Record<string, string> = {
  adimplente: "status-adimplente",
  risco: "status-risco",
  inadimplente: "status-inadimplente",
  bloqueado: "status-bloqueado",
};

const vendaStatusColors: Record<string, string> = {
  pendente: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  pago: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  vencido: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  cancelado: "bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400",
};

const tipoConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  visita:     { label: "Visita",      icon: MapPin,     color: "text-blue-500" },
  ligacao:    { label: "Ligação",     icon: Phone,      color: "text-green-500" },
  email:      { label: "E-mail",      icon: Mail,       color: "text-purple-500" },
  negociacao: { label: "Negociação",  icon: DollarSign, color: "text-amber-500" },
  outros:     { label: "Outros",      icon: FileText,   color: "text-gray-500" },
};

const segmentos = ["mercado", "acougue", "restaurante", "lanchonete", "outros"];
const origens   = ["indicacao", "prospeccao", "midia", "outros"];

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value || "—"}</p>
    </div>
  );
}

export default function ClienteDetalhe() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const clienteId = Number(id);
  const qc = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: cliente, isLoading } = useQuery<Cliente>({
    queryKey: [`/api/clientes/${clienteId}`],
    enabled: !!clienteId,
  });

  const { data: vendas = [] } = useQuery<Venda[]>({
    queryKey: [`/api/clientes/${clienteId}/vendas`],
    enabled: !!clienteId,
  });

  const { data: historico = [] } = useQuery<Historico[]>({
    queryKey: [`/api/clientes/${clienteId}/historico`],
    enabled: !!clienteId,
  });

  const pagamentosResults = useQueries({
    queries: vendas.map(v => ({
      queryKey: [`/api/vendas/${v.id}/pagamentos`],
    })),
  });

  const allPagamentos = pagamentosResults
    .flatMap((r, i) => ((r.data as Pagamento[]) ?? []).map(p => ({ ...p, venda: vendas[i] })))
    .sort((a, b) => b.data.localeCompare(a.data));

  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<ClienteEditForm | null>(null);

  function startEdit() {
    if (!cliente) return;
    setForm({
      nome:            cliente.nome,
      razaoSocial:     cliente.razaoSocial     ?? "",
      cpfCnpj:         cliente.cpfCnpj,
      segmento:        cliente.segmento,
      telefone:        cliente.telefone        ?? "",
      email:           cliente.email           ?? "",
      endereco:        cliente.endereco        ?? "",
      cidade:          cliente.cidade          ?? "",
      estado:          cliente.estado          ?? "",
      cep:             cliente.cep             ?? "",
      origemCliente:   cliente.origemCliente   ?? "prospeccao",
      empresaAtendida: cliente.empresaAtendida ?? "",
      limiteCredito:   cliente.limiteCredito,
      prazo:           cliente.prazo,
      observacoes:     cliente.observacoes     ?? "",
    });
    setEditMode(true);
  }

  const editMutation = useMutation({
    mutationFn: (data: ClienteEditForm) => apiRequest("PUT", `/api/clientes/${clienteId}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [`/api/clientes/${clienteId}`] });
      qc.invalidateQueries({ queryKey: ["/api/clientes"] });
      toast({ title: "Cliente atualizado com sucesso." });
      setEditMode(false);
    },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const bloquearMutation = useMutation({
    mutationFn: () => apiRequest("PATCH", `/api/clientes/${clienteId}/bloquear`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [`/api/clientes/${clienteId}`] });
      qc.invalidateQueries({ queryKey: ["/api/clientes"] });
      toast({ title: "Cliente bloqueado." });
    },
  });

  const desbloquearMutation = useMutation({
    mutationFn: () => apiRequest("PATCH", `/api/clientes/${clienteId}/desbloquear`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [`/api/clientes/${clienteId}`] });
      qc.invalidateQueries({ queryKey: ["/api/clientes"] });
      toast({ title: "Cliente desbloqueado." });
    },
  });

  const today = new Date().toISOString().split("T")[0];
  const [historicoForm, setHistoricoForm] = useState({ tipo: "visita", descricao: "", data: today });

  const historicoMutation = useMutation({
    mutationFn: (data: typeof historicoForm) =>
      apiRequest("POST", "/api/historico", { ...data, clienteId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [`/api/clientes/${clienteId}/historico`] });
      toast({ title: "Entrada adicionada ao histórico." });
      setHistoricoForm({ tipo: "visita", descricao: "", data: today });
    },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const creditoUtilizado = vendas
    .filter(v => v.status !== "pago" && v.status !== "cancelado")
    .reduce((a, v) => a + v.valor, 0);
  const creditoDisponivel = Math.max(0, (cliente?.limiteCredito ?? 0) - creditoUtilizado);
  const utilizacaoPercent = cliente?.limiteCredito
    ? Math.min(100, (creditoUtilizado / cliente.limiteCredito) * 100)
    : 0;

  const isAdmin = user?.role === "admin" || user?.role === "gerente";

  const f = (key: keyof ClienteEditForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(prev => prev ? { ...prev, [key]: e.target.value } : prev);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!cliente) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-sm text-muted-foreground">Cliente não encontrado.</p>
        <Button variant="ghost" size="sm" className="mt-3 gap-1.5" onClick={() => navigate("/clientes")}>
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Voltar */}
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5 -ml-2 text-muted-foreground hover:text-foreground"
        onClick={() => navigate("/clientes")}
        data-testid="btn-voltar-clientes"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar para Clientes
      </Button>

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <h1 className="text-xl font-bold text-foreground truncate">{cliente.nome}</h1>
            <Badge
              className={`text-xs px-2 py-0 flex-shrink-0 ${statusColors[cliente.status] ?? ""}`}
              variant="secondary"
            >
              {getStatusLabel(cliente.status)}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground capitalize">
            {cliente.segmento}
            {cliente.cidade
              ? ` · ${cliente.cidade}${cliente.estado ? `, ${cliente.estado}` : ""}`
              : ""}
          </p>
        </div>
        {isAdmin && (
          <div className="flex-shrink-0">
            {cliente.status === "bloqueado" ? (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => desbloquearMutation.mutate()}
                disabled={desbloquearMutation.isPending}
                data-testid="btn-desbloquear"
              >
                {desbloquearMutation.isPending
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <Unlock className="w-3.5 h-3.5" />}
                Desbloquear
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs text-destructive hover:text-destructive"
                onClick={() => bloquearMutation.mutate()}
                disabled={bloquearMutation.isPending}
                data-testid="btn-bloquear"
              >
                {bloquearMutation.isPending
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <Lock className="w-3.5 h-3.5" />}
                Bloquear
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Card de crédito */}
      <Card className="border-border bg-card">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Crédito</span>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div>
              <p className="text-xs text-muted-foreground">Limite</p>
              <p className="text-sm font-bold text-foreground tabular-nums">
                {formatCurrency(cliente.limiteCredito)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Utilizado</p>
              <p className="text-sm font-bold text-orange-600 dark:text-orange-400 tabular-nums">
                {formatCurrency(creditoUtilizado)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Disponível</p>
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {formatCurrency(creditoDisponivel)}
              </p>
            </div>
          </div>
          <Progress value={utilizacaoPercent} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {utilizacaoPercent.toFixed(0)}% do limite utilizado · Prazo: {cliente.prazo} dias
          </p>
        </CardContent>
      </Card>

      {/* Abas */}
      <Tabs defaultValue="dados" className="space-y-3">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="dados"       className="text-xs">Dados</TabsTrigger>
          <TabsTrigger value="vendas"      className="text-xs">Vendas ({vendas.length})</TabsTrigger>
          <TabsTrigger value="pagamentos"  className="text-xs">Pagamentos</TabsTrigger>
          <TabsTrigger value="historico"   className="text-xs">Histórico ({historico.length})</TabsTrigger>
        </TabsList>

        {/* ── Dados ─────────────────────────────────── */}
        <TabsContent value="dados">
          <Card className="border-border bg-card">
            <CardContent className="p-4">
              {!editMode ? (
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={startEdit} data-testid="btn-editar-dados">
                      <Edit2 className="w-3.5 h-3.5" /> Editar
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                    <InfoRow label="CPF / CNPJ"       value={maskCpfCnpj(cliente.cpfCnpj)} />
                    <InfoRow label="Razão Social"      value={cliente.razaoSocial} />
                    <InfoRow label="Telefone"          value={cliente.telefone} />
                    <InfoRow label="E-mail"            value={cliente.email} />
                    <InfoRow label="Endereço"          value={cliente.endereco} />
                    <InfoRow
                      label="Cidade / Estado"
                      value={
                        cliente.cidade
                          ? `${cliente.cidade}${cliente.estado ? `, ${cliente.estado}` : ""}`
                          : null
                      }
                    />
                    <InfoRow label="CEP"               value={cliente.cep} />
                    <InfoRow
                      label="Segmento"
                      value={cliente.segmento
                        ? cliente.segmento.charAt(0).toUpperCase() + cliente.segmento.slice(1)
                        : null}
                    />
                    <InfoRow label="Origem"            value={cliente.origemCliente} />
                    <InfoRow label="Empresa Atendida"  value={cliente.empresaAtendida} />
                    <InfoRow label="Limite de Crédito" value={formatCurrency(cliente.limiteCredito)} />
                    <InfoRow label="Prazo (dias)"      value={String(cliente.prazo)} />
                    {cliente.observacoes && (
                      <div className="col-span-2">
                        <InfoRow label="Observações" value={cliente.observacoes} />
                      </div>
                    )}
                  </div>
                </div>
              ) : form && (
                <form
                  onSubmit={e => { e.preventDefault(); editMutation.mutate(form); }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2 space-y-1.5">
                      <Label>Nome / Razão Social *</Label>
                      <Input value={form.nome} onChange={f("nome")} required />
                    </div>
                    <div className="space-y-1.5">
                      <Label>CPF / CNPJ *</Label>
                      <Input value={form.cpfCnpj} onChange={f("cpfCnpj")} required />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Segmento</Label>
                      <Select
                        value={form.segmento}
                        onValueChange={v => setForm(p => p ? { ...p, segmento: v } : p)}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {segmentos.map(s => (
                            <SelectItem key={s} value={s}>
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Telefone</Label>
                      <Input value={form.telefone ?? ""} onChange={f("telefone")} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>E-mail</Label>
                      <Input type="email" value={form.email ?? ""} onChange={f("email")} />
                    </div>
                    <div className="col-span-2 space-y-1.5">
                      <Label>Endereço</Label>
                      <Input value={form.endereco ?? ""} onChange={f("endereco")} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Cidade</Label>
                      <Input value={form.cidade ?? ""} onChange={f("cidade")} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Estado</Label>
                      <Input value={form.estado ?? ""} onChange={f("estado")} maxLength={2} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Origem</Label>
                      <Select
                        value={form.origemCliente ?? ""}
                        onValueChange={v => setForm(p => p ? { ...p, origemCliente: v } : p)}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {origens.map(o => (
                            <SelectItem key={o} value={o}>
                              {o.charAt(0).toUpperCase() + o.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Empresa Atendida</Label>
                      <Input value={form.empresaAtendida ?? ""} onChange={f("empresaAtendida")} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Limite de Crédito (R$)</Label>
                      <Input
                        type="number"
                        min={0}
                        value={form.limiteCredito}
                        onChange={e => setForm(p => p ? { ...p, limiteCredito: Number(e.target.value) } : p)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Prazo (dias)</Label>
                      <Input
                        type="number"
                        min={0}
                        value={form.prazo}
                        onChange={e => setForm(p => p ? { ...p, prazo: Number(e.target.value) } : p)}
                      />
                    </div>
                    <div className="col-span-2 space-y-1.5">
                      <Label>Observações</Label>
                      <Textarea value={form.observacoes ?? ""} onChange={f("observacoes")} rows={2} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" size="sm" className="gap-1.5" disabled={editMutation.isPending} data-testid="btn-salvar-edicao">
                      {editMutation.isPending
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <Save className="w-3.5 h-3.5" />}
                      Salvar
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => setEditMode(false)}
                    >
                      <X className="w-3.5 h-3.5" /> Cancelar
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Vendas ─────────────────────────────────── */}
        <TabsContent value="vendas">
          <Card className="border-border bg-card">
            <CardContent className="p-4 space-y-2">
              {vendas.length === 0 ? (
                <div className="flex flex-col items-center py-10 text-center">
                  <ShoppingCart className="w-8 h-8 text-muted-foreground/40 mb-2" />
                  <p className="text-sm text-muted-foreground">Nenhuma venda registrada</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between pb-2 border-b border-border mb-1">
                    <p className="text-xs text-muted-foreground">
                      {vendas.length} venda{vendas.length !== 1 ? "s" : ""}
                    </p>
                    <p className="text-sm font-bold text-foreground">
                      Total: {formatCurrency(vendas.reduce((a, v) => a + v.valor, 0))}
                    </p>
                  </div>
                  {[...vendas].sort((a, b) => b.data.localeCompare(a.data)).map(v => (
                    <div
                      key={v.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/40 border border-border"
                      data-testid={`row-venda-${v.id}`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={`text-xs px-2 py-0 ${vendaStatusColors[v.status] ?? ""}`}
                            variant="secondary"
                          >
                            {getStatusLabel(v.status)}
                          </Badge>
                          {v.descricao && (
                            <span className="text-xs text-muted-foreground truncate max-w-40">
                              {v.descricao}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Venda: {formatDate(v.data)} · Vence: {formatDate(v.vencimento)}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-foreground tabular-nums">
                        {formatCurrency(v.valor)}
                      </p>
                    </div>
                  ))}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Pagamentos ─────────────────────────────── */}
        <TabsContent value="pagamentos">
          <Card className="border-border bg-card">
            <CardContent className="p-4 space-y-2">
              {allPagamentos.length === 0 ? (
                <div className="flex flex-col items-center py-10 text-center">
                  <CheckCircle className="w-8 h-8 text-muted-foreground/40 mb-2" />
                  <p className="text-sm text-muted-foreground">Nenhum pagamento registrado</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between pb-2 border-b border-border mb-1">
                    <p className="text-xs text-muted-foreground">
                      {allPagamentos.length} pagamento{allPagamentos.length !== 1 ? "s" : ""}
                    </p>
                    <p className="text-sm font-bold text-foreground">
                      Total: {formatCurrency(allPagamentos.reduce((a, p) => a + p.valorPago, 0))}
                    </p>
                  </div>
                  {allPagamentos.map(p => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/40 border border-border"
                      data-testid={`row-pagamento-${p.id}`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-sm font-medium text-foreground">{p.formaPagamento}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatDate(p.data)} · Venda de {formatDate(p.venda.data)}
                          {p.observacoes ? ` · ${p.observacoes}` : ""}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {formatCurrency(p.valorPago)}
                      </p>
                    </div>
                  ))}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Histórico ──────────────────────────────── */}
        <TabsContent value="historico">
          <div className="space-y-3">
            <Card className="border-border bg-card">
              <CardContent className="p-4">
                <p className="text-xs font-semibold text-muted-foreground mb-3">Nova Entrada</p>
                <form
                  onSubmit={e => { e.preventDefault(); historicoMutation.mutate(historicoForm); }}
                  className="space-y-3"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Tipo</Label>
                      <Select
                        value={historicoForm.tipo}
                        onValueChange={v => setHistoricoForm(p => ({ ...p, tipo: v }))}
                      >
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(tipoConfig).map(([k, v]) => (
                            <SelectItem key={k} value={k}>{v.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Data</Label>
                      <Input
                        type="date"
                        value={historicoForm.data}
                        onChange={e => setHistoricoForm(p => ({ ...p, data: e.target.value }))}
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Descrição</Label>
                    <Textarea
                      value={historicoForm.descricao}
                      onChange={e => setHistoricoForm(p => ({ ...p, descricao: e.target.value }))}
                      rows={2}
                      className="text-xs resize-none"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    size="sm"
                    className="gap-1.5 text-xs"
                    disabled={historicoMutation.isPending || !historicoForm.descricao}
                    data-testid="btn-add-historico"
                  >
                    {historicoMutation.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                    Adicionar
                  </Button>
                </form>
              </CardContent>
            </Card>

            {historico.length === 0 ? (
              <Card className="border-border bg-card">
                <CardContent className="flex flex-col items-center py-10 text-center">
                  <Clock className="w-8 h-8 text-muted-foreground/40 mb-2" />
                  <p className="text-sm text-muted-foreground">Nenhum histórico registrado</p>
                </CardContent>
              </Card>
            ) : (
              <div className="relative pl-6 space-y-0">
                <div className="absolute left-2.5 top-3 bottom-3 w-px bg-border" />
                {[...historico].sort((a, b) => b.data.localeCompare(a.data)).map(h => {
                  const cfg = tipoConfig[h.tipo] ?? tipoConfig.outros;
                  const Icon = cfg.icon;
                  return (
                    <div key={h.id} className="relative pb-3 last:pb-0">
                      <div className="absolute -left-6 top-1.5 w-5 h-5 rounded-full bg-card border-2 border-border flex items-center justify-center">
                        <Icon className={`w-2.5 h-2.5 ${cfg.color}`} />
                      </div>
                      <div className="bg-card border border-border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</span>
                          <span className="text-xs text-muted-foreground">{formatDate(h.data)}</span>
                        </div>
                        <p className="text-sm text-foreground">{h.descricao}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
