# ADR 0001 — Monorepo com `frontend/` e `backend/` no mesmo repositório

- **Data:** 2026-04-30
- **Autor(es):** Euler Azevedo
- **Status:** Aceita

---

## Contexto

O projeto Cartivore precisa hospedar simultaneamente:

- uma **API REST** em Node.js/Express/TypeScript com SQLite + Drizzle ORM, que será publicada no **Render**;
- uma **interface web** em React 18 + Vite + TypeScript + Tailwind, publicada no **Vercel**;
- documentação técnica e acadêmica destinada a estagiários (PT-BR);
- scripts compartilhados (`setup.sh`, `start.sh`) e arquivos de deploy (`render.yaml`, `vercel.json`).

A equipe é composta majoritariamente por **estagiários iniciantes**, com curva de aprendizado de Git e ferramentas web. Há restrição prática de tempo: cada semestre tem entregas curtas, com correções rápidas em ambas as camadas. Dois repositórios separados implicariam, para cada feature ponta-a-ponta, dois clones, duas branches sincronizadas, dois PRs e dois deploys.

A questão a decidir: **manter um único repositório com `frontend/` e `backend/` ou dividir em dois repositórios independentes?**

---

## Decisão

Adotar um **monorepo** com a estrutura:

```
cartivore/
├── backend/         # API Node.js + Express + SQLite
├── frontend/        # SPA React + Vite
├── docs/            # Documentação técnica
├── scripts/         # setup.sh, start.sh
├── render.yaml      # deploy do backend (Root Directory: backend)
└── frontend/vercel.json  # deploy do frontend (Root Directory: frontend)
```

Cada lado mantém o seu `package.json` e seu `tsconfig.json` independentes — **não é** um monorepo com workspace npm/pnpm. Os deploys usam o recurso de **"Root Directory"** do Render e Vercel para tratar cada subpasta como um projeto isolado.

---

## Consequências

### Positivas

- **Onboarding único:** o estagiário clona um único repositório e roda `bash scripts/setup.sh` para subir tudo.
- **PRs ponta-a-ponta:** uma feature que toca backend e frontend pode ser revisada em um único PR, evitando dessincronização.
- **Documentação centralizada:** `docs/`, `CONTRIBUTING.md` e `README.md` cobrem o sistema inteiro em um só lugar.
- **Histórico de mudanças unificado:** `git log` mostra a evolução conjunta da plataforma.
- **Configuração de deploy mais simples** que o esperado: Render e Vercel suportam "Root Directory" nativamente, sem ferramentas extras (Turborepo, Nx, etc.).

### Negativas / riscos

- **PRs podem ficar grandes** se a feature mexer fortemente nos dois lados — mitigado pelo `CONTRIBUTING.md` (regra "uma branch = um card").
- **Triggers de deploy** disparam em qualquer push, mesmo quando só `docs/` mudou — aceitável porque o build é rápido (~1 min) e os planos do Render/Vercel suportam.
- **Tooling compartilhado é manual:** não há `package.json` raiz que rode `lint` em ambos. Decidimos que isso é aceitável dado o escopo acadêmico — pode ser revisitado se a base crescer.
- Não há, hoje, **versionamento independente** de backend e frontend; ambos sobem juntos. É consistente com o tamanho do time.

---

## Alternativas consideradas

### A. Dois repositórios separados (`cartivore-backend` e `cartivore-frontend`)

- **Prós:** isolamento total, deploys independentes "out of the box", repositórios menores.
- **Contras:** dobra o overhead de Git para o estagiário, exige dois PRs sincronizados em qualquer feature ponta-a-ponta, fragmenta a documentação. **Rejeitada** pelo público-alvo iniciante.

### B. Monorepo "de verdade" com pnpm workspaces ou Turborepo

- **Prós:** scripts unificados, dependências compartilhadas, cache de build inteligente.
- **Contras:** introduz uma camada extra (pnpm, Turborepo) que estagiários não conhecem; configuração não-trivial no Render/Vercel; benefício marginal num projeto desse porte. **Rejeitada** por aumentar a barreira de entrada sem ganho proporcional.

### C. Repositório único com tudo no mesmo `package.json` (sem subpastas)

- **Prós:** ainda mais simples para iniciantes.
- **Contras:** mistura dependências de servidor (Express, better-sqlite3) com dependências de browser (React, Vite); torna o tree-shaking e os tipos confusos; Render e Vercel não conseguem distinguir o que cada um deve fazer build. **Rejeitada** por inviabilizar o deploy.

---

## Revisão

Esta ADR deve ser **reavaliada** se algum dos seguintes acontecer:

- O time crescer para **mais de 6 desenvolvedores ativos simultâneos** com necessidade de releases independentes.
- Surgir uma **terceira aplicação** (ex.: app mobile) que justifique workspace npm/pnpm.
- O backend ou o frontend forem **substituídos** (ex.: backend migrar para outra linguagem).
