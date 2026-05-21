import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("admin@cartivore.com");
  const [senha, setSenha] = useState("admin123");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, senha);
    } catch (err: any) {
      toast({ title: "Erro ao entrar", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full border-2 border-white" />
          <div className="absolute bottom-40 right-10 w-96 h-96 rounded-full border border-white" />
          <div className="absolute top-1/2 left-1/3 w-32 h-32 rounded-full border-2 border-white" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <svg viewBox="0 0 36 36" fill="none" className="w-10 h-10">
              <rect width="36" height="36" rx="8" fill="white" fillOpacity="0.2"/>
              <path d="M8 18C8 12.477 12.477 8 18 8s10 4.477 10 10-4.477 10-10 10" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="18" cy="18" r="3.5" fill="white"/>
              <path d="M18 14.5V12M21.5 18H24M18 21.5V24M14.5 18H12" stroke="hsl(195 80% 28%)" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span className="text-white font-bold text-2xl tracking-tight">Cartivore</span>
          </div>
          <p className="text-primary-foreground/70 text-sm">Gestão Estratégica de Carteira</p>
        </div>
        <div className="relative z-10">
          <blockquote className="text-white/90 text-xl font-medium leading-relaxed mb-4">
            "A carteira de clientes é o maior ativo de um representante comercial."
          </blockquote>
          <p className="text-white/60 text-sm">JR FOOD — Sistema de Gestão v1.0</p>
        </div>
        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[
            { label: "Clientes", desc: "Centralizados" },
            { label: "Crédito", desc: "Controlado" },
            { label: "Carteira", desc: "Portável" },
          ].map(item => (
            <div key={item.label} className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-white font-semibold text-sm">{item.label}</p>
              <p className="text-white/60 text-xs">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <svg viewBox="0 0 36 36" fill="none" className="w-8 h-8">
              <rect width="36" height="36" rx="8" fill="hsl(var(--primary))"/>
              <path d="M8 18C8 12.477 12.477 8 18 8s10 4.477 10 10-4.477 10-10 10" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="18" cy="18" r="3.5" fill="white"/>
            </svg>
            <span className="font-bold text-lg text-foreground">Cartivore</span>
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-1">Bem-vindo de volta</h2>
          <p className="text-muted-foreground text-sm mb-8">Entre com suas credenciais para acessar</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                data-testid="input-email"
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="senha" className="text-sm font-medium">Senha</Label>
              <div className="relative">
                <Input
                  id="senha"
                  type={showPwd ? "text" : "password"}
                  placeholder="••••••••"
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  required
                  data-testid="input-senha"
                  className="h-10 pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPwd(!showPwd)}
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full h-10" disabled={loading} data-testid="btn-login">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Entrar"}
            </Button>
          </form>

          <div className="mt-8 p-4 rounded-lg bg-muted/60 border border-border">
            <p className="text-xs text-muted-foreground font-medium mb-1">Acesso padrão (beta):</p>
            <p className="text-xs text-foreground font-mono">admin@cartivore.com / admin123</p>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            © {new Date().getFullYear()} Cartivore · Euler Azevedo & Dioneide Sales
          </p>
        </div>
      </div>
    </div>
  );
}
