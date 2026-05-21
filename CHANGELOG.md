# Changelog — Cartivore

Todas as mudanças notáveis deste projeto são documentadas aqui.  
Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

---

## [1.0.0] — 2026-04-11

### Adicionado
- Módulo de autenticação com JWT (login, roles: admin / gerente / vendedor)
- Gestão de clientes (CRUD completo, soft delete, bloqueio/desbloqueio)
- Gestão de vendas com controle de status (pendente, pago, vencido, cancelado)
- Registro de pagamentos parciais com recalculação automática de status
- Histórico de relacionamento por cliente
- Dashboard com KPIs: total de clientes, adimplentes, inadimplentes, a receber
- Módulo financeiro com visão consolidada
- Mapa de carteira (estrutura base para v2.0)
- Relatórios com exportação CSV e PDF
- Gestão de usuários (admin only)
- Audit log de todas as operações
- Deploy: Backend no Render (SQLite + disco persistente) / Frontend no Vercel
- Scripts `setup.sh` e `start.sh` para ambiente local

### Estrutura
- Repositório separado: `backend/` (Node.js + Express + SQLite + Drizzle)
- Repositório separado: `frontend/` (React 18 + Vite + TypeScript + Tailwind + shadcn/ui)

---

## [2.0.0] — Em desenvolvimento

Ver `docs/ROADMAP-V2.md` para o backlog completo de 16 tarefas (~111h).

Epics planejadas:
- Mapa Interativo com Leaflet.js
- Histórico de Relacionamento avançado
- Gestão de Pagamentos com alertas de vencimento
- Segurança Avançada (2FA, refresh token, audit visual)
- Exportação Avançada (Excel + PDF gerencial)
- Notificações por e-mail via Resend
- UX e Interface (dark mode, responsividade, onboarding)
