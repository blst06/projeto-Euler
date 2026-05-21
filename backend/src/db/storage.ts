import BetterSqlite3, { Database } from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { eq, desc, and, lt } from "drizzle-orm";
import {
  users, clientes, vendas, pagamentos, historico, auditLog,
  type User, type InsertUser,
  type Cliente, type InsertCliente,
  type Venda, type InsertVenda,
  type Pagamento, type InsertPagamento,
  type Historico, type InsertHistorico,
} from "./schema.js";
import bcrypt from "bcryptjs";

// Caminho do banco — usa variável de ambiente para Render (disco persistente)
const DB_PATH = process.env.DB_PATH || "cartivore.db";
const sqlite: Database = new BetterSqlite3(DB_PATH);
export const db = drizzle(sqlite);

// ─── Inicializar tabelas ───────────────────────────────────────────────────────
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    senha TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'vendedor',
    ativo INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    razao_social TEXT,
    cpf_cnpj TEXT NOT NULL UNIQUE,
    segmento TEXT NOT NULL,
    telefone TEXT,
    email TEXT,
    endereco TEXT,
    cidade TEXT,
    estado TEXT,
    cep TEXT,
    lat REAL,
    lng REAL,
    origem_cliente TEXT,
    empresa_atendida TEXT,
    limite_credito REAL NOT NULL DEFAULT 0,
    prazo INTEGER NOT NULL DEFAULT 30,
    status TEXT NOT NULL DEFAULT 'adimplente',
    observacoes TEXT,
    ativo INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS vendas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id INTEGER NOT NULL,
    usuario_id INTEGER NOT NULL,
    valor REAL NOT NULL,
    data TEXT NOT NULL,
    vencimento TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pendente',
    descricao TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS pagamentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    venda_id INTEGER NOT NULL,
    valor_pago REAL NOT NULL,
    data TEXT NOT NULL,
    forma_pagamento TEXT NOT NULL DEFAULT 'dinheiro',
    observacoes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS historico (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id INTEGER NOT NULL,
    usuario_id INTEGER NOT NULL,
    tipo TEXT NOT NULL,
    descricao TEXT NOT NULL,
    data TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER,
    acao TEXT NOT NULL,
    entidade TEXT NOT NULL,
    entidade_id INTEGER,
    detalhes TEXT,
    ip TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// Seed admin se não existir
const adminExists = sqlite.prepare("SELECT id FROM users WHERE email = ?").get("admin@cartivore.com");
if (!adminExists) {
  const hash = bcrypt.hashSync("admin123", 10);
  sqlite.prepare("INSERT INTO users (nome, email, senha, role) VALUES (?, ?, ?, ?)").run("Administrador", "admin@cartivore.com", hash, "admin");
  console.log("[cartivore] Admin seed criado: admin@cartivore.com / admin123");
}

// ─── Implementação da Storage ──────────────────────────────────────────────────
class Storage {
  getUserByEmail(email: string): User | undefined {
    return db.select().from(users).where(eq(users.email, email)).get();
  }

  getUserById(id: number): User | undefined {
    return db.select().from(users).where(eq(users.id, id)).get();
  }

  getAllUsers(): User[] {
    return db.select().from(users).all();
  }

  createUser(data: InsertUser): User {
    const hash = bcrypt.hashSync(data.senha, 10);
    return db.insert(users).values({ ...data, senha: hash }).returning().get();
  }

  updateUser(id: number, data: Partial<InsertUser>): User | undefined {
    if (data.senha) data.senha = bcrypt.hashSync(data.senha, 10);
    return db.update(users).set(data).where(eq(users.id, id)).returning().get();
  }

  getAllClientes(): Cliente[] {
    return db.select().from(clientes).orderBy(desc(clientes.createdAt)).all();
  }

  getClienteById(id: number): Cliente | undefined {
    return db.select().from(clientes).where(eq(clientes.id, id)).get();
  }

  createCliente(data: InsertCliente): Cliente {
    const now = new Date().toISOString();
    return db.insert(clientes).values({ ...data, createdAt: now, updatedAt: now }).returning().get();
  }

  updateCliente(id: number, data: Partial<InsertCliente> & { status?: string }): Cliente | undefined {
    return db.update(clientes).set({ ...data, updatedAt: new Date().toISOString() }).where(eq(clientes.id, id)).returning().get();
  }

  deleteCliente(id: number): void {
    db.update(clientes).set({ ativo: false }).where(eq(clientes.id, id)).run();
  }

  recalcularStatusCliente(clienteId: number): void {
    const hoje = new Date().toISOString().split("T")[0];
    const vendasVencidas = db.select().from(vendas)
      .where(and(eq(vendas.clienteId, clienteId), eq(vendas.status, "vencido"))).all();
    const vendasPendentesVencidas = db.select().from(vendas)
      .where(and(eq(vendas.clienteId, clienteId), eq(vendas.status, "pendente"), lt(vendas.vencimento, hoje))).all();

    vendasPendentesVencidas.forEach(v => {
      db.update(vendas).set({ status: "vencido" }).where(eq(vendas.id, v.id)).run();
    });

    const totalVencidas = vendasVencidas.length + vendasPendentesVencidas.length;
    const cliente = this.getClienteById(clienteId);
    if (!cliente || cliente.status === "bloqueado") return;

    const novoStatus = totalVencidas > 0 ? "inadimplente" : "adimplente";
    db.update(clientes).set({ status: novoStatus, updatedAt: new Date().toISOString() }).where(eq(clientes.id, clienteId)).run();
  }

  getAllVendas(): Venda[] {
    return db.select().from(vendas).orderBy(desc(vendas.createdAt)).all();
  }

  getVendasByCliente(clienteId: number): Venda[] {
    return db.select().from(vendas).where(eq(vendas.clienteId, clienteId)).orderBy(desc(vendas.createdAt)).all();
  }

  createVenda(data: InsertVenda): Venda {
    const venda = db.insert(vendas).values({ ...data, createdAt: new Date().toISOString() }).returning().get();
    this.recalcularStatusCliente(data.clienteId);
    return venda;
  }

  updateVendaStatus(id: number, status: string): Venda | undefined {
    const venda = db.update(vendas).set({ status }).where(eq(vendas.id, id)).returning().get();
    if (venda) this.recalcularStatusCliente(venda.clienteId);
    return venda;
  }

  getPagamentosByVenda(vendaId: number): Pagamento[] {
    return db.select().from(pagamentos).where(eq(pagamentos.vendaId, vendaId)).orderBy(desc(pagamentos.createdAt)).all();
  }

  createPagamento(data: InsertPagamento): Pagamento {
    const pag = db.insert(pagamentos).values({ ...data, createdAt: new Date().toISOString() }).returning().get();
    const venda = db.select().from(vendas).where(eq(vendas.id, data.vendaId)).get();
    if (venda) {
      const totalPago = db.select().from(pagamentos).where(eq(pagamentos.vendaId, data.vendaId)).all()
        .reduce((acc, p) => acc + p.valorPago, 0);
      if (totalPago >= venda.valor) this.updateVendaStatus(venda.id, "pago");
    }
    return pag;
  }

  getHistoricoByCliente(clienteId: number): Historico[] {
    return db.select().from(historico).where(eq(historico.clienteId, clienteId)).orderBy(desc(historico.createdAt)).all();
  }

  createHistorico(data: InsertHistorico): Historico {
    return db.insert(historico).values({ ...data, createdAt: new Date().toISOString() }).returning().get();
  }

  getDashboardStats() {
    const todos = db.select().from(clientes).where(eq(clientes.ativo, true)).all();
    const todasVendas = db.select().from(vendas).all();
    const pendentes = todasVendas.filter(v => v.status === "pendente" || v.status === "vencido");
    const totalReceber = pendentes.reduce((acc, v) => acc + v.valor, 0);
    return {
      totalClientes: todos.length,
      adimplentes: todos.filter(c => c.status === "adimplente").length,
      inadimplentes: todos.filter(c => c.status === "inadimplente").length,
      risco: todos.filter(c => c.status === "risco").length,
      bloqueados: todos.filter(c => c.status === "bloqueado").length,
      totalVendas: todasVendas.length,
      totalReceber,
    };
  }

  logAudit(data: { usuarioId?: number; acao: string; entidade: string; entidadeId?: number; detalhes?: string; ip?: string }): void {
    db.insert(auditLog).values({ ...data, createdAt: new Date().toISOString() }).run();
  }
}

export const storage = new Storage();
