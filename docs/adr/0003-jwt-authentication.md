# ADR 0003 — Autenticação por JWT (assinatura HS256, token em memória do front)

- **Data:** 2026-04-30
- **Autor(es):** Euler Azevedo
- **Status:** Aceita

---

## Contexto

O Cartivore precisa autenticar usuários (admin, gerente, vendedor) e proteger as rotas REST do backend. Os requisitos:

- **Sem dependência de serviço externo** de identidade (ex.: Auth0, Cognito), por restrição de custo do projeto acadêmico.
- **Multi-perfil** (`admin`, `gerente`, `vendedor`) com autorização baseada em role.
- **Stateless no backend** sempre que possível, para simplificar a operação no Render.
- **SPA (Vite + React)** consumindo a API através de `Authorization: Bearer <token>`.
- **Senha armazenada com hash forte** no banco — usuários **nunca** veem senhas em texto puro.
- **Tempo de sessão razoável** para o uso interno (algumas horas), com possibilidade de re-login.

A questão a decidir: **qual mecanismo de autenticação usar?**

---

## Decisão

Adotar **JWT (JSON Web Token)** com **assinatura simétrica HS256** usando a biblioteca `jsonwebtoken`.

- Hash de senha via **bcryptjs** (custo configurável, padrão 10).
- Token JWT contém `userId`, `email` e `role`; expira em **8 horas**.
- Segredo de assinatura na variável de ambiente **`JWT_SECRET`**.
- No frontend, o token é mantido **em memória** (`window.__cartivore_token`) — **não** em `localStorage` nem cookie.
- Todas as rotas protegidas passam pelo middleware `authenticate` (e por `requireAdmin` quando aplicável).
- Login via `POST /api/auth/login` retorna `{ token, user }`.
- Logout no frontend simplesmente descarta o token em memória.

---

## Consequências

### Positivas

- **Stateless**: o backend não precisa manter sessões em memória/Redis. Encaixa no plano simples do Render.
- **Compatível com SPA + API REST**: o padrão `Authorization: Bearer <token>` é amplamente conhecido.
- **Roles embutidas no token**: o middleware decide acesso sem ida extra ao banco.
- **bcryptjs** é considerado adequado para hashing de senhas em Node.js puro.
- Token em **memória do frontend** mitiga o risco de XSS conseguir persistir um token roubado entre sessões.

### Negativas / riscos

- **Revogação imediata é difícil**: JWTs assinados são válidos até expirar. Se um token vazar, a única ação imediata possível é **rotacionar o `JWT_SECRET`** (invalida **todos** os tokens, exigindo re-login geral). Para o porte do sistema, é aceitável.
- **Token em memória se perde ao recarregar a página**: o usuário precisa fazer login novamente. UX aceitável para uso interno, mas registrado como dívida (ver "Revisão" — refresh token).
- **`JWT_SECRET` é o único segredo crítico**: se vazar, autenticação está comprometida. Cuidados:
  - Variável **nunca** comitada (ver `.env.example` e `docs/CONFIG.md`).
  - Em produção, gerada via "Generate" do Render, com 64+ caracteres aleatórios.
  - Documentado o procedimento de **rotação** caso haja suspeita de vazamento.
- **HS256** assume confiança total nos servidores que assinam — não há separação entre quem emite e quem valida. Aceitável porque há um único backend.
- **Não há 2FA** no escopo da v1.0. Listado no `ROADMAP-V2.md` como evolução.
- **Senha padrão `admin@cartivore.com / admin123`** existe na primeira inicialização para facilitar o setup. **Deve ser trocada imediatamente em produção** — alerta repetido em `README.md`, `DEPLOY.md`, `docs/CONFIG.md` e `CONTRIBUTING.md`.

### Avisos de operação

- **Antes de mudar `JWT_SECRET` em produção**: avisar todos os usuários, porque o login vai cair.
- **Toda rota nova deve passar por `authenticate`** salvo as públicas explicitamente listadas (`/api/auth/login`, `/api/health`).
- **Inputs de senha** devem usar `zod` para validar comprimento mínimo razoável (ex.: ≥ 8) — listar em `ROADMAP-V2.md` se ainda não estiver implementado.

---

## Alternativas consideradas

### A. Sessões server-side com cookies

- **Prós:** revogação imediata (basta apagar a sessão), proteção via `HttpOnly` e `Secure` cookies, padrão maduro.
- **Contras:** exige um store de sessão (Redis, Postgres) — incompatível com a decisão do ADR 0002 (banco SQLite simples) e adiciona custo.
- **Rejeitada** por aumentar complexidade operacional desproporcional ao porte.

### B. OAuth2/OIDC com provider externo (Auth0, Cognito)

- **Prós:** terceiriza segurança crítica, suporta SSO, 2FA, etc.
- **Contras:** custo recorrente, complexidade de configuração para estagiários, dependência externa.
- **Rejeitada** pelo escopo acadêmico.

### C. Token JWT armazenado em `localStorage`

- **Prós:** persistência entre recarregamentos, UX melhor.
- **Contras:** mais exposto a ataques XSS — qualquer script malicioso na página pode ler o token e enviar para fora.
- **Rejeitada para a v1.0**. Pode ser revisitada com **refresh token em cookie HttpOnly** (item do roadmap).

### D. Cookies HttpOnly assinados (sem JWT)

- **Prós:** segurança contra XSS, padrão tradicional de webapps.
- **Contras:** exige preocupação extra com **CSRF**, e o frontend SPA já interage bem com o padrão `Bearer`.
- **Rejeitada** por ser um caminho menos familiar para a equipe de estagiários no curto prazo.

---

## Revisão

Reavaliar esta decisão se:

- For necessário **revogar tokens individualmente** (caso de comprometimento sem rotação total).
- For introduzido **2FA** (item já no `ROADMAP-V2.md`).
- O frontend passar a exigir **persistência de sessão** entre recargas — então avaliar o padrão **refresh token em cookie HttpOnly + access token em memória**.
- Houver **integração SSO** com a universidade ou com a JR FOOD.

Itens já mapeados no roadmap que poderão alterar este ADR:

- Refresh token / sessão prolongada.
- 2FA via TOTP ou e-mail.
- Audit log visual de logins suspeitos.
