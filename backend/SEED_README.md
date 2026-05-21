# 🌱 CARTIVORE — Massa de Dados para Testes
> **CART-032** | Responsáveis: @kauacacula e @erickcsaraiva | Entrega: 09/05/2026

---

## Como carregar os dados de teste

### Pré-requisitos
```bash
node -v   # precisa ser v18+
npm -v    # qualquer versão recente
```

### 1. Instalar dependências
```bash
cd backend
npm install @faker-js/faker bcryptjs
```

### 2. Gerar e importar os dados
```bash
# Gera seed.sql com dados frescos (sempre iguais graças ao seed fixo 42)
node seed.js

# Importa no banco local
sqlite3 cartivore.db < seed.sql
```

### 3. Subir o servidor e verificar
```bash
npx tsx src/index.ts
```

---

## Usuários de teste

| E-mail | Senha | Role |
|--------|-------|------|
| admin@cartivore.dev | Teste@123 | admin |
| wesley@cartivore.dev | Teste@123 | gerente |
| amanda@cartivore.dev | Teste@123 | gerente |
| euler@cartivore.dev | Teste@123 | vendedor |
| kauaca@cartivore.dev | Teste@123 | vendedor |
| erick@cartivore.dev | Teste@123 | vendedor |

> ⚠️ Nunca use esses dados em produção.

---

## Cenários de teste cobertos (CART-032A)

| ID | Cliente | Status | Coordenadas | Para testar |
|----|---------|--------|-------------|-------------|
| 1 | Empresa Adimplente SP Ltda | adimplente | ✅ | Fluxo normal, dashboard |
| 2 | Comércio Pontual Rio Ltda | adimplente | ✅ | Fluxo normal, relatórios |
| 3 | Serviços BH Regulares ME | adimplente | ✅ | Fluxo normal |
| 4 | Distribuidora Atrasada Ltda | inadimplente | ✅ | Status financeiro, bloqueio |
| 5 | Indústria Devedora AM SA | inadimplente | ✅ | Status financeiro, bloqueio |
| 6 | Empresa Bloqueada BA Ltda | bloqueado | ✅ | Cliente bloqueado manualmente |
| 7 | Comércio Em Risco CE Ltda | adimplente | ✅ | Venda pendente vencida — em risco |
| 8 | Atacado Risco RS ME | adimplente | ✅ | Venda pendente vencida — em risco |
| 9 | Empresa Sem GPS Ltda | adimplente | ❌ null | Mapa sem coordenada |
| 10 | Comércio Endereço Inválido ME | adimplente | ❌ null | Mapa sem coordenada |
| 11–90 | Clientes aleatórios | variado | maioria ✅ | Volume, dashboard, relatórios |

---

## Volume gerado

| Tabela | Registros |
|--------|-----------|
| users | 8 |
| clientes | 90 |
| vendas | ~212 |
| pagamentos | ~179 |
| historico | ~178 |
| audit_log | 150 |

---

## Reprodutibilidade

O script usa `faker.seed(42)` — qualquer membro da equipe que rodar `node seed.js` vai gerar **exatamente os mesmos dados**. Não altere o valor do seed sem avisar o time.

Para regenerar do zero (apaga tudo e recarrega):
```bash
rm cartivore.db
node seed.js
sqlite3 cartivore.db < seed.sql
```

---

## Alinhamento com outros cards

| Responsável | Usar estes IDs |
|-------------|----------------|
| @wesleybatista46 — testes financeiros | IDs 4, 5 (inadimplente) e 7, 8 (em risco) |
| @filhoalexsonfilho — dashboard/status | Todos — distribuição variada de status |
| @amandagreice3 — homologação | `sqlite3 cartivore.db < seed.sql` no ambiente de homologação |
