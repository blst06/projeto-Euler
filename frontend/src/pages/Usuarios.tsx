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
import { Plus, Settings, Loader2 } from "lucide-react";
import type { User } from "@/lib/types";

const roleColors: Record<string, string> = {
  admin: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400",
  gerente: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  vendedor: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300",
};

function UsuarioForm({ onSuccess }: { onSuccess: () => void }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState({ nome: "", email: "", senha: "", role: "vendedor" });

  const mutation = useMutation({
    mutationFn: (data: typeof form) => apiRequest("POST", "/api/usuarios", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/usuarios"] });
      toast({ title: "Usuário criado com sucesso." });
      onSuccess();
    },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const f = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [key]: e.target.value }));

  return (
    <form onSubmit={e => { e.preventDefault(); mutation.mutate(form); }} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Nome completo *</Label>
        <Input value={form.nome} onChange={f("nome")} required data-testid="input-usuario-nome" />
      </div>
      <div className="space-y-1.5">
        <Label>E-mail *</Label>
        <Input type="email" value={form.email} onChange={f("email")} required data-testid="input-usuario-email" />
      </div>
      <div className="space-y-1.5">
        <Label>Senha *</Label>
        <Input type="password" value={form.senha} onChange={f("senha")} required minLength={6} data-testid="input-usuario-senha" />
      </div>
      <div className="space-y-1.5">
        <Label>Perfil de Acesso</Label>
        <Select value={form.role} onValueChange={v => setForm(p => ({ ...p, role: v }))}>
          <SelectTrigger data-testid="select-role"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="vendedor">Vendedor</SelectItem>
            <SelectItem value="gerente">Gerente</SelectItem>
            <SelectItem value="admin">Administrador</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="w-full" disabled={mutation.isPending} data-testid="btn-salvar-usuario">
        {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Criar Usuário"}
      </Button>
    </form>
  );
}

export default function Usuarios() {
  const [openNew, setOpenNew] = useState(false);
  const { data: usuarios = [], isLoading } = useQuery<User[]>({ queryKey: ["/api/usuarios"] });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Usuários</h1>
          <p className="text-sm text-muted-foreground">Controle de acesso ao sistema</p>
        </div>
        <Dialog open={openNew} onOpenChange={setOpenNew}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5" data-testid="btn-novo-usuario">
              <Plus className="w-4 h-4" /> Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Criar Usuário</DialogTitle></DialogHeader>
            <UsuarioForm onSuccess={() => setOpenNew(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : (
        <div className="space-y-2">
          {usuarios.map(u => (
            <Card key={u.id} className="border-border bg-card" data-testid={`card-usuario-${u.id}`}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary">{u.nome.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm">{u.nome}</p>
                  <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`text-xs px-2 py-0 ${roleColors[u.role] ?? ""}`} variant="secondary">
                    {u.role}
                  </Badge>
                  {!u.ativo && <Badge variant="secondary" className="text-xs px-2 py-0 bg-gray-100 text-gray-500">Inativo</Badge>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="p-4 rounded-xl bg-secondary/50 border border-border">
        <div className="flex items-start gap-2">
          <Settings className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-foreground mb-1">Níveis de acesso</p>
            <ul className="text-xs text-muted-foreground space-y-0.5">
              <li><span className="font-medium text-foreground">Admin</span> — acesso total: usuários, bloqueios, exclusões</li>
              <li><span className="font-medium text-foreground">Gerente</span> — bloquear/desbloquear clientes, ver relatórios</li>
              <li><span className="font-medium text-foreground">Vendedor</span> — cadastro de clientes e vendas</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
