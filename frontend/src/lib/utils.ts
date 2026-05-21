import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return "-";
  const date = new Date(dateStr + (dateStr.length === 10 ? "T00:00:00" : ""));
  return new Intl.DateTimeFormat("pt-BR").format(date);
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    adimplente: "Adimplente",
    risco: "Em Risco",
    inadimplente: "Inadimplente",
    bloqueado: "Bloqueado",
    pendente: "Pendente",
    pago: "Pago",
    vencido: "Vencido",
    cancelado: "Cancelado",
  };
  return map[status] ?? status;
}

export function maskCpfCnpj(value: string): string {
  const nums = value.replace(/\D/g, "");
  if (nums.length <= 11) {
    return nums.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }
  return nums.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
}
