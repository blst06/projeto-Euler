# Cartivore — Arquitetura do Sistema

## Visão Geral

```
┌─────────────────┐     HTTPS      ┌────────────────────────┐
│   Usuário       │ ──────────────► │  Vercel (Frontend)     │
│   (Navegador)   │                 │  React + Vite          │
└─────────────────┘                 │  dist/public/          │
                                    └────────────┬───────────┘
                                                 │ /api/* (proxy)
                                                 ▼
                                    ┌────────────────────────┐
                                    │  Render (Backend)      │
                                    │  Node.js + Express     │
                                    │  Port: 3000 (prod)     │
                                    └────────────┬───────────┘
                                                 │
                                    ┌────────────▼───────────┐
                                    │  SQLite (Render Disk)  │
                                    │  cartivore.db          │
                                    └────────────────────────┘
```

## Banco de Dados

```
users ─────────────────────────────────────────────────────────
  id, nome, email, senha (hash), role, ativo, created_at

clientes ──────────────────────────────────────────────────────
  id, nome, razao_social, cpf_cnpj*, segmento, telefone,
  email, endereco, cidade, estado, cep, lat, lng,
  origem_cliente, empresa_atendida, limite_credito,
  prazo, status (calculado), observacoes, ativo,
  created_at, updated_at

vendas ─────────────────────────────────────────────────────────
  id, cliente_id → clientes.id, usuario_id → users.id,
  valor, data, vencimento, status, descricao, created_at

pagamentos ─────────────────────────────────────────────────────
  id, venda_id → vendas.id, valor_pago, data,
  forma_pagamento, observacoes, created_at

historico ──────────────────────────────────────────────────────
  id, cliente_id → clientes.id, usuario_id → users.id,
  tipo, descricao, data, created_at

audit_log ──────────────────────────────────────────────────────
  id, usuario_id, acao, entidade, entidade_id, detalhes, ip,
  created_at
```

## Fluxo de Autenticação

```
1. POST /api/auth/login { email, senha }
2. Backend valida credenciais + bcrypt
3. Retorna JWT (8h) + dados do usuário
4. Frontend armazena token em memória (window.__cartivore_token)
5. Todas as requisições incluem: Authorization: Bearer <token>
6. Middleware authenticate() valida o JWT em cada rota protegida
```

## Classificação Automática de Clientes

```
Gatilho: criação de venda OU atualização de status de venda

Algoritmo:
  1. Busca vendas do cliente com status "pendente" E vencimento < hoje
  2. Marca essas vendas como "vencido"
  3. Conta total de vendas com status "vencido" do cliente
  4. Se total > 0 → status do cliente = "inadimplente"
  5. Se total = 0 → status do cliente = "adimplente"
  6. Exceção: se cliente está "bloqueado", não recalcula automaticamente
```
