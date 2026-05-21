// Tipos compartilhados com o backend — espelham o schema do Drizzle
// Não importar do backend diretamente; aqui ficam apenas as interfaces TypeScript.

export interface User {
  id: number;
  nome: string;
  email: string;
  senha: string;
  role: string;
  ativo: boolean;
  createdAt: string;
}

export interface Cliente {
  id: number;
  nome: string;
  razaoSocial: string | null;
  cpfCnpj: string;
  segmento: string;
  telefone: string | null;
  email: string | null;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
  lat: number | null;
  lng: number | null;
  origemCliente: string | null;
  empresaAtendida: string | null;
  limiteCredito: number;
  prazo: number;
  status: string;
  observacoes: string | null;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Venda {
  id: number;
  clienteId: number;
  usuarioId: number;
  valor: number;
  data: string;
  vencimento: string;
  status: string;
  descricao: string | null;
  createdAt: string;
}

export interface Pagamento {
  id: number;
  vendaId: number;
  valorPago: number;
  data: string;
  formaPagamento: string;
  observacoes: string | null;
  createdAt: string;
}

export interface Historico {
  id: number;
  clienteId: number;
  usuarioId: number;
  tipo: string;
  descricao: string;
  data: string;
  createdAt: string;
}
