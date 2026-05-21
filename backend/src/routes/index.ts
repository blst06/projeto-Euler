import { Express, Request, Response } from "express";
import { storage } from "../db/storage.js";
import { authenticate, generateToken, requireRole } from "../middleware/auth.js";
import {
  insertClienteSchema, insertVendaSchema,
  insertPagamentoSchema, insertHistoricoSchema, insertUserSchema
} from "../db/schema.js";
import bcrypt from "bcryptjs";
// CART-002B: importar serviço de geocodificação
import { geocodeEndereco, enderecoMudou } from "../services/geocodingService.js";

export function registerRoutes(app: Express) {
  // ─── Health ────────────────────────────────────────────────────────────────
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", version: "1.0.0", timestamp: new Date().toISOString() });
  });

  // ─── Auth ──────────────────────────────────────────────────────────────────
  app.post("/api/auth/login", (req: Request, res: Response) => {
    const { email, senha } = req.body;
    if (!email || !senha) return res.status(400).json({ error: "Email e senha obrigatórios" });

    const user = storage.getUserByEmail(email);
    if (!user || !user.ativo) return res.status(401).json({ error: "Credenciais inválidas" });

    const valid = bcrypt.compareSync(senha, user.senha);
    if (!valid) return res.status(401).json({ error: "Credenciais inválidas" });

    storage.logAudit({ usuarioId: user.id, acao: "LOGIN", entidade: "users", entidadeId: user.id, ip: req.ip });
    const token = generateToken(user.id, user.role);
    res.json({ token, user: { id: user.id, nome: user.nome, email: user.email, role: user.role } });
  });

  app.get("/api/auth/me", authenticate, (req: Request, res: Response) => {
    const { userId } = (req as any).user;
    const user = storage.getUserById(userId);
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
    res.json({ id: user.id, nome: user.nome, email: user.email, role: user.role });
  });

  // ─── Dashboard ─────────────────────────────────────────────────────────────
  app.get("/api/dashboard", authenticate, (_req, res) => {
    res.json(storage.getDashboardStats());
  });

  // ─── Clientes ──────────────────────────────────────────────────────────────
  app.get("/api/clientes", authenticate, (_req, res) => {
    res.json(storage.getAllClientes());
  });

  app.get("/api/clientes/:id", authenticate, (req, res) => {
    const cliente = storage.getClienteById(Number(req.params.id));
    if (!cliente) return res.status(404).json({ error: "Cliente não encontrado" });
    res.json(cliente);
  });

  // CART-002B: POST agora é async para aguardar geocodificação
  app.post("/api/clientes", authenticate, async (req: Request, res: Response) => {
    const parsed = insertClienteSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    // Geocodifica antes de persistir — null se falhar (sem bloquear cadastro)
    const coords = await geocodeEndereco({
      endereco: parsed.data.endereco,
      cidade:   parsed.data.cidade,
      estado:   parsed.data.estado,
      cep:      parsed.data.cep,
    });

    const cliente = storage.createCliente({
      ...parsed.data,
      lat: coords?.lat ?? null,
      lng: coords?.lng ?? null,
    });

    storage.logAudit({
      usuarioId: (req as any).user.userId,
      acao:      "CREATE",
      entidade:  "clientes",
      entidadeId: cliente.id,
      ip:         req.ip,
    });

    res.status(201).json(cliente);
  });

  // CART-002D: PUT re-geocodifica se endereço mudou
 app.put("/api/clientes/:id", authenticate, async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  // ✅ Validação aqui dentro, logo no início
  const parsed = insertClienteSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const atual = storage.getClienteById(id);
if (!atual) return res.status(404).json({ error: "Cliente não encontrado" });

// Preserva coordenadas existentes como ponto de partida
let lat = atual.lat;
let lng = atual.lng;

// Bug fix 1: compara apenas campos de endereço presentes no payload (não undefined).
// Campos ausentes não são considerados alteração — evita re-geocodificação
// desnecessária em updates parciais (ex: só atualizar telefone).
const camposEndereco = ['endereco', 'cidade', 'estado', 'cep'] as const;
const enderecoAlterado = camposEndereco.some(campo => {
  if (!(campo in parsed.data)) return false;
  return (parsed.data[campo] ?? '') !== (atual[campo] ?? '');
});

if (enderecoAlterado) {
  console.info(`[CART-002D] Endereco do cliente ${id} alterado — re-geocodificando...`);
  const coords = await geocodeEndereco({
    endereco: parsed.data.endereco ?? atual.endereco,
    cidade:   parsed.data.cidade   ?? atual.cidade,
    estado:   parsed.data.estado   ?? atual.estado,
    cep:      parsed.data.cep      ?? atual.cep,
  });
  // Bug fix 2: só sobrescreve se geocodificação retornou resultado.
  // Se falhar (null), mantém coordenadas anteriores intactas.
  if (coords) {
    lat = coords.lat;
    lng = coords.lng;
  } else {
    console.warn(`[CART-002D] Geocodificacao falhou — coordenadas anteriores preservadas`);
  }
}
  const cliente = storage.updateCliente(id, { ...parsed.data, lat, lng }); // ✅ parsed.data
  if (!cliente) return res.status(404).json({ error: "Cliente não encontrado" });

  storage.logAudit({
    usuarioId:  (req as any).user.userId,
    acao:       "UPDATE",
    entidade:   "clientes",
    entidadeId: id,
    ip:         req.ip,
  });

  res.json(cliente);
});

  app.patch("/api/clientes/:id/bloquear", authenticate, requireRole("admin", "gerente"), (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const cliente = storage.updateCliente(id, { status: "bloqueado" });
    if (!cliente) return res.status(404).json({ error: "Cliente não encontrado" });
    storage.logAudit({ usuarioId: (req as any).user.userId, acao: "BLOQUEAR", entidade: "clientes", entidadeId: id, ip: req.ip });
    res.json(cliente);
  });

  app.patch("/api/clientes/:id/desbloquear", authenticate, requireRole("admin", "gerente"), (req: Request, res: Response) => {
    const id = Number(req.params.id);
    storage.updateCliente(id, { status: "adimplente" });
    storage.recalcularStatusCliente(id);
    const cliente = storage.getClienteById(id);
    storage.logAudit({ usuarioId: (req as any).user.userId, acao: "DESBLOQUEAR", entidade: "clientes", entidadeId: id, ip: req.ip });
    res.json(cliente);
  });

  app.delete("/api/clientes/:id", authenticate, requireRole("admin"), (req: Request, res: Response) => {
    const id = Number(req.params.id);
    storage.deleteCliente(id);
    storage.logAudit({ usuarioId: (req as any).user.userId, acao: "DELETE", entidade: "clientes", entidadeId: id, ip: req.ip });
    res.json({ ok: true });
  });

  app.get("/api/clientes/export/json", authenticate, (_req, res) => {
    res.json(storage.getAllClientes());
  });

  // ─── Vendas ────────────────────────────────────────────────────────────────
  app.get("/api/vendas", authenticate, (_req, res) => {
    res.json(storage.getAllVendas());
  });

  app.get("/api/clientes/:id/vendas", authenticate, (req, res) => {
    res.json(storage.getVendasByCliente(Number(req.params.id)));
  });

  app.post("/api/vendas", authenticate, (req: Request, res: Response) => {
    const parsed = insertVendaSchema.safeParse({ ...req.body, usuarioId: (req as any).user.userId });
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const venda = storage.createVenda(parsed.data);
    storage.logAudit({ usuarioId: (req as any).user.userId, acao: "CREATE", entidade: "vendas", entidadeId: venda.id, ip: req.ip });
    res.status(201).json(venda);
  });

  app.patch("/api/vendas/:id/status", authenticate, (req: Request, res: Response) => {
    const venda = storage.updateVendaStatus(Number(req.params.id), req.body.status);
    if (!venda) return res.status(404).json({ error: "Venda não encontrada" });
    res.json(venda);
  });

  // ─── Pagamentos ────────────────────────────────────────────────────────────
  app.get("/api/vendas/:id/pagamentos", authenticate, (req, res) => {
    res.json(storage.getPagamentosByVenda(Number(req.params.id)));
  });

  app.post("/api/pagamentos", authenticate, (req: Request, res: Response) => {
    const parsed = insertPagamentoSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const pag = storage.createPagamento(parsed.data);
    storage.logAudit({ usuarioId: (req as any).user.userId, acao: "CREATE", entidade: "pagamentos", entidadeId: pag.id, ip: req.ip });
    res.status(201).json(pag);
  });

  // ─── Histórico ─────────────────────────────────────────────────────────────
  app.get("/api/clientes/:id/historico", authenticate, (req, res) => {
    res.json(storage.getHistoricoByCliente(Number(req.params.id)));
  });

  app.post("/api/historico", authenticate, (req: Request, res: Response) => {
    const parsed = insertHistoricoSchema.safeParse({ ...req.body, usuarioId: (req as any).user.userId });
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    res.status(201).json(storage.createHistorico(parsed.data));
  });

  // ─── Usuários (admin only) ──────────────────────────────────────────────────
  app.get("/api/usuarios", authenticate, requireRole("admin"), (_req, res) => {
    res.json(storage.getAllUsers().map(u => ({ ...u, senha: undefined })));
  });

  app.post("/api/usuarios", authenticate, requireRole("admin"), (req: Request, res: Response) => {
    const parsed = insertUserSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const user = storage.createUser(parsed.data);
    res.status(201).json({ ...user, senha: undefined });
  });

  app.put("/api/usuarios/:id", authenticate, requireRole("admin"), (req: Request, res: Response) => {
    const user = storage.updateUser(Number(req.params.id), req.body);
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
    res.json({ ...user, senha: undefined });
  });
}