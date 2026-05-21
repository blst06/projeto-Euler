import { sqliteTable, text, real, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ─── Usuários / Auth ───────────────────────────────────────────────────────────
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nome: text("nome").notNull(),
  email: text("email").notNull().unique(),
  senha: text("senha").notNull(),
  role: text("role").notNull().default("vendedor"), // 'admin' | 'gerente' | 'vendedor'
  ativo: integer("ativo", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// ─── Clientes ─────────────────────────────────────────────────────────────────
export const clientes = sqliteTable("clientes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nome: text("nome").notNull(),
  razaoSocial: text("razao_social"),
  cpfCnpj: text("cpf_cnpj").notNull().unique(),
  segmento: text("segmento").notNull(),
  telefone: text("telefone"),
  email: text("email"),
  endereco: text("endereco"),
  cidade: text("cidade"),
  estado: text("estado"),
  cep: text("cep"),
  lat: real("lat"),
  lng: real("lng"),
  origemCliente: text("origem_cliente"),
  empresaAtendida: text("empresa_atendida"),
  limiteCredito: real("limite_credito").notNull().default(0),
  prazo: integer("prazo").notNull().default(30),
  status: text("status").notNull().default("adimplente"),
  observacoes: text("observacoes"),
  ativo: integer("ativo", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
  updatedAt: text("updated_at").notNull().default(new Date().toISOString()),
});

export const insertClienteSchema = createInsertSchema(clientes).omit({ id: true, createdAt: true, updatedAt: true, status: true });
export type InsertCliente = z.infer<typeof insertClienteSchema>;
export type Cliente = typeof clientes.$inferSelect;

// ─── Vendas ────────────────────────────────────────────────────────────────────
export const vendas = sqliteTable("vendas", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  clienteId: integer("cliente_id").notNull(),
  usuarioId: integer("usuario_id").notNull(),
  valor: real("valor").notNull(),
  data: text("data").notNull(),
  vencimento: text("vencimento").notNull(),
  status: text("status").notNull().default("pendente"),
  descricao: text("descricao"),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export const insertVendaSchema = createInsertSchema(vendas).omit({ id: true, createdAt: true, status: true });
export type InsertVenda = z.infer<typeof insertVendaSchema>;
export type Venda = typeof vendas.$inferSelect;

// ─── Pagamentos ────────────────────────────────────────────────────────────────
export const pagamentos = sqliteTable("pagamentos", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  vendaId: integer("venda_id").notNull(),
  valorPago: real("valor_pago").notNull(),
  data: text("data").notNull(),
  formaPagamento: text("forma_pagamento").notNull().default("dinheiro"),
  observacoes: text("observacoes"),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export const insertPagamentoSchema = createInsertSchema(pagamentos).omit({ id: true, createdAt: true });
export type InsertPagamento = z.infer<typeof insertPagamentoSchema>;
export type Pagamento = typeof pagamentos.$inferSelect;

// ─── Histórico de Relacionamento ───────────────────────────────────────────────
export const historico = sqliteTable("historico", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  clienteId: integer("cliente_id").notNull(),
  usuarioId: integer("usuario_id").notNull(),
  tipo: text("tipo").notNull(),
  descricao: text("descricao").notNull(),
  data: text("data").notNull(),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export const insertHistoricoSchema = createInsertSchema(historico).omit({ id: true, createdAt: true });
export type InsertHistorico = z.infer<typeof insertHistoricoSchema>;
export type Historico = typeof historico.$inferSelect;

// ─── Log de Auditoria ──────────────────────────────────────────────────────────
export const auditLog = sqliteTable("audit_log", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  usuarioId: integer("usuario_id"),
  acao: text("acao").notNull(),
  entidade: text("entidade").notNull(),
  entidadeId: integer("entidade_id"),
  detalhes: text("detalhes"),
  ip: text("ip"),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});
