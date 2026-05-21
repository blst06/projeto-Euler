# ADR 0002 — Banco SQLite com disco persistente no Render

- **Data:** 2026-04-30
- **Autor(es):** Euler Azevedo
- **Status:** Aceita

---

## Contexto

O Cartivore é um sistema de gestão de carteira de clientes para a JR FOOD, desenvolvido como **projeto acadêmico de estágio**. Os requisitos práticos são:

- **Volume de dados estimado pequeno**: dezenas de usuários, centenas a alguns milhares de clientes, dezenas de milhares de vendas no horizonte de 1–2 anos.
- **Custo operacional próximo de zero** — o projeto não tem orçamento mensal recorrente para infraestrutura.
- **Simplicidade de operação**: estagiários iniciantes precisam ser capazes de subir o backend localmente sem configurar um banco externo.
- **Persistência confiável** em produção, com possibilidade de **backup manual**.
- **Migrations versionadas** com Drizzle ORM.

A questão a decidir: **qual banco de dados usar e como hospedá-lo em produção?**

---

## Decisão

Adotar **SQLite** com a biblioteca **better-sqlite3** e o ORM **Drizzle**, hospedando o arquivo `cartivore.db` em um **disco persistente** do Render (1 GB, montado em `/var/data`).

- Em **desenvolvimento local**: arquivo `backend/cartivore.db` criado automaticamente, ignorado pelo `.gitignore`.
- Em **produção**: variável `DB_PATH=/var/data/cartivore.db`. Disco provisionado via `render.yaml`.
- **Backups**: feitos manualmente baixando o arquivo `.db` do Render antes de qualquer migração de schema ou alteração crítica.
- **Migrations**: aplicadas com `npm run db:push` (driver Drizzle Kit).

---

## Consequências

### Positivas

- **Custo zero**: não exige um serviço de banco gerenciado (Postgres no Neon/Supabase, MySQL no PlanetScale, etc.).
- **Setup local trivial**: nenhuma instalação prévia (Postgres, Docker) é necessária para o estagiário começar.
- **Velocidade**: better-sqlite3 é síncrono e extremamente rápido para o volume previsto.
- **Backup e restauração simples**: basta copiar/colar um arquivo.
- **Drizzle ORM** entrega tipagem ponta-a-ponta e migrations declarativas, mesmo com SQLite.

### Negativas / riscos

- **Single-writer**: SQLite serializa escritas. Não escala para múltiplas instâncias do backend rodando em paralelo.
  - **Mitigação:** uma única instância no Render, suficiente para o volume previsto.
- **Acoplamento ao disco do Render**: o banco vive no disco do servidor. Se o serviço for migrado para uma plataforma sem disco persistente (ex.: Vercel Functions, Cloud Run), o modelo precisa mudar.
  - **Mitigação:** se essa migração ocorrer, este ADR é **revisitado** (ver "Revisão").
- **Sem replica para leitura**: queries pesadas concorrem com escritas. Aceitável dado o volume.
- **Backups manuais**: não há rotina automática. Estagiários precisam ser disciplinados em **fazer backup antes de migrations** (regra reforçada em `CONTRIBUTING.md` e `docs/CONFIG.md`).
- **Cold start no Render free tier**: o serviço hiberna após inatividade; a primeira requisição pode demorar alguns segundos. Independente da escolha do banco, mas vale destacar.

### Operacionais

- O disco do Render foi dimensionado em **1 GB**. Suficiente para vários anos no volume atual.
- Em caso de corrupção, o procedimento é: parar o serviço, fazer upload do backup mais recente, reiniciar.
- Migrations devem ser **aditivas e reversíveis sempre que possível**; Drizzle facilita esse padrão.

---

## Alternativas consideradas

### A. PostgreSQL gerenciado (Neon, Supabase ou Render Postgres)

- **Prós:** escalabilidade horizontal, replicação, backups automáticos, ferramentas profissionais.
- **Contras:** custo recorrente (mesmo o tier gratuito do Neon/Supabase tem limites e pode pausar projetos), setup local mais pesado (string de conexão, credenciais), dependência de rede em desenvolvimento.
- **Rejeitada** porque o volume não justifica a complexidade extra para uma equipe de estagiários.

### B. MongoDB Atlas (free tier)

- **Prós:** schema flexível, free tier generoso.
- **Contras:** modelo de dados relacional do Cartivore (clientes ↔ vendas ↔ pagamentos ↔ histórico) se beneficia de relações fortes; migrações em Mongo são mais "manuais"; estagiários teriam que aprender uma sintaxe extra. **Rejeitada.**

### C. SQLite em memória ou efêmero

- **Prós:** zero configuração, máxima simplicidade.
- **Contras:** perda total de dados ao reiniciar — inaceitável em produção. **Rejeitada.**

### D. Render Postgres no plano gratuito

- **Prós:** integrado ao Render, fácil de provisionar.
- **Contras:** o plano gratuito do Render para Postgres tem limites e expirações; no momento da decisão não havia garantia de continuidade do tier gratuito a longo prazo. **Rejeitada por previsibilidade de custo.**

---

## Revisão

Reavaliar esta decisão se:

- O sistema passar a precisar de **múltiplas instâncias do backend** (ex.: para alta disponibilidade).
- O volume crescer para **dezenas de milhões de registros** ou **centenas de gravações por segundo**.
- Houver **migração de plataforma** para serviços sem disco persistente.
- Aparecer **financiamento** estável que justifique um Postgres gerenciado e o ganho operacional compense o custo de migração.

A migração para Postgres, se necessária, é viável: o Drizzle ORM tem suporte nativo, e a maior parte do código de queries permaneceria igual.
