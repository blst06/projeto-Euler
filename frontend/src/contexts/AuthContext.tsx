import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { setToken, clearToken } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";

interface AuthUser {
  id: number;
  nome: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Tenta recuperar sessão via token salvo em memória (não persiste)
    setLoading(false);
  }, []);

  async function login(email: string, senha: string) {
    const data = await apiRequest("POST", "/api/auth/login", { email, senha });
    setToken(data.token);
    setUser(data.user);
  }

  function logout() {
    clearToken();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
