# Guia do Aluno — Cartivore

Este guia conduz você, **estudante de estágio**, do zero até abrir seu primeiro Pull Request no Cartivore. Leia tudo antes de começar — leva ~30 minutos.

> Se este é seu **primeiro contato com o projeto**, leia também o [`CONTRIBUTING.md`](../CONTRIBUTING.md) na raiz e, em seguida, o [`TUTORIAL-PRIMEIRA-TASK.md`](./TUTORIAL-PRIMEIRA-TASK.md).

---

## 1. Pré-requisitos

### 1.1 Conhecimentos esperados

- HTML, CSS e JavaScript básicos.
- Noções de Git (commit, branch, merge, push).
- Familiaridade com terminal/linha de comando.
- (Desejável) noções de TypeScript e React.

### 1.2 Ferramentas que você precisa instalar

| Ferramenta             | Versão recomendada | Onde baixar                                   |
| ---------------------- | ------------------ | --------------------------------------------- |
| Node.js                | 20.x ou superior   | https://nodejs.org                            |
| Git                    | 2.40+              | https://git-scm.com                           |
| VS Code (recomendado)  | Atual              | https://code.visualstudio.com                 |
| Conta no GitHub        | —                  | https://github.com                            |
| Conta no Trello        | —                  | https://trello.com                            |

### 1.3 Extensões VS Code recomendadas

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- GitLens
- SQLite Viewer (para inspecionar o banco local)

### 1.4 Acesso

Solicite ao **Euler Azevedo** ou **Dioneide Sales**:

- Convite ao repositório no GitHub (`eulerazevedo/cartivore`).
- Convite ao quadro no Trello.
- (Se aplicável) acesso ao painel do Render e Vercel para acompanhar deploys.

---

## 2. Clonando e configurando o projeto

```bash
# 1. Vá para o diretório onde você guarda projetos
cd ~/projetos    # ou onde preferir

# 2. Clone o repositório
git clone https://github.com/eulerazevedo/cartivore.git
cd cartivore

# 3. Configure sua identidade Git (use seu e-mail acadêmico ou pessoal)
git config user.name "Seu Nome Completo"
git config user.email "seuemail@exemplo.com"

# 4. Rode o setup automático (instala backend + frontend)
bash scripts/setup.sh

# 5. Inicie os dois serviços
bash scripts/start.sh
```

Depois disso:

| Serviço  | URL                         |
| -------- | --------------------------- |
| Frontend | http://localhost:5173       |
| Backend  | http://localhost:3000/api   |

**Login padrão (apenas em ambiente local):**

```
admin@cartivore.com / admin123
```

> ⚠️ **Nunca** use essa senha em produção. Em produção ela é alterada no primeiro deploy.

---

## 3. Organização do repositório

```
cartivore/
├── backend/        ← API Node.js + Express + SQLite + Drizzle ORM
│   ├── src/
│   │   ├── db/         ← Schema e conexão com o banco
│   │   ├── middleware/ ← authenticate, requireAdmin etc.
│   │   ├── routes/     ← Rotas REST (auth, clientes, vendas, ...)
│   │   └── index.ts    ← Bootstrap do servidor
│   └── package.json
│
├── frontend/       ← React 18 + Vite + TypeScript + Tailwind + shadcn/ui
│   ├── src/
│   │   ├── pages/      ← Telas (Login, Dashboard, Clientes, Vendas...)
│   │   ├── components/ ← Layout + componentes shadcn/ui
│   │   ├── contexts/   ← AuthContext
│   │   ├── hooks/      ← Hooks compartilhados
│   │   └── lib/        ← queryClient, auth, utils
│   └── package.json
│
├── docs/           ← Documentação técnica (este arquivo!)
├── scripts/        ← setup.sh e start.sh
├── .env.example    ← Template de variáveis de ambiente
├── render.yaml     ← Configuração de deploy do backend (Render)
└── README.md
```

### 3.1 Frontend em detalhe

- **React 18 + Vite** — bundler rápido, hot reload em milissegundos.
- **TypeScript** — todo código é tipado. Erros aparecem no editor.
- **Tailwind CSS + shadcn/ui** — componentes prontos e estilizáveis.
- **TanStack Query** — gerencia chamadas à API e cache.
- **Wouter** — roteador SPA leve.

### 3.2 Backend em detalhe

- **Express 5** — servidor HTTP minimalista.
- **TypeScript** — tipagem forte ponta a ponta.
- **Drizzle ORM** — queries tipadas para o SQLite.
- **better-sqlite3** — driver SQLite síncrono e rápido.
- **JWT + bcryptjs** — autenticação por token + hash de senhas.

---

## 4. Como pegar uma tarefa do Trello

1. Abra o quadro do Trello.
2. Vá à coluna **A fazer**.
3. Filtre cards com label da sua **especialidade** (frontend, backend, fullstack).
4. Escolha um card **não atribuído** e compatível com seu nível (procure pela tag 🟢 Fácil se for sua primeira tarefa).
5. **Atribua-se** ao card e mova-o para **Em desenvolvimento**.
6. Leia a descrição com atenção. Em caso de dúvida, comente no card antes de começar.

> Cards seguem a nomenclatura `CART-XXX`. Esse ID **deve aparecer** no nome da branch e nos commits.

---

## 5. Criando sua branch

A partir da `main` atualizada:

```bash
git checkout main
git pull origin main
git checkout -b feat/CART-001-mapa-leaflet
```

(Veja convenção completa em [`CONTRIBUTING.md`](../CONTRIBUTING.md#3-convenção-de-branches).)

---

## 6. Rodando o projeto localmente

### 6.1 Subindo tudo de uma vez

```bash
bash scripts/start.sh
```

### 6.2 Subindo separado (recomendado para debug)

**Backend:**

```bash
cd backend
npm run dev
```

**Frontend (em outro terminal):**

```bash
cd frontend
npm run dev
```

### 6.3 Banco de dados local

- Arquivo: `backend/cartivore.db` (criado automaticamente).
- Para resetar: pare o servidor, **faça backup** do `.db`, apague-o e reinicie. Um admin padrão é recriado.
- Para inspecionar: use a extensão **SQLite Viewer** do VS Code.

> ⚠️ **Sempre faça backup do `.db` antes de mexer em migrations** ou rodar `drizzle-kit push`.

### 6.4 Migrations (mudanças de schema)

Quando o card pedir para adicionar/alterar tabelas:

```bash
cd backend
# 1. Edite src/db/schema.ts
# 2. Gere e aplica a migration
npm run db:push
```

Confirme as mudanças no banco antes de comitar.

---

## 7. Implementando a tarefa

### 7.1 Backend — adicionar uma rota

1. Crie/edite o arquivo em `backend/src/routes/<entidade>.ts`.
2. Use **Zod** para validar inputs.
3. Use **Drizzle** para todas as queries.
4. Proteja a rota com o middleware `authenticate` (e `requireAdmin` se for área admin).
5. Registre a rota em `backend/src/index.ts`.

### 7.2 Frontend — adicionar uma tela

1. Crie um arquivo em `frontend/src/pages/<Tela>.tsx`.
2. Use **componentes shadcn/ui** já presentes em `src/components/ui/` antes de criar do zero.
3. Use **TanStack Query** (`useQuery`, `useMutation`) para chamadas à API.
4. Adicione a rota em `App.tsx` e o item de menu em `components/Layout.tsx`, se aplicável.

### 7.3 Padrões de qualidade

- Variáveis e funções com **nomes claros**, em português ou inglês consistente.
- Trate **estados de loading, erro e vazio** em componentes que carregam dados.
- Nada de `any` injustificado em TypeScript.
- Nada de `console.log` de debug no commit final.

---

## 8. Testando antes do PR

### 8.1 Testes manuais obrigatórios

- Rodar `npm run check` no `frontend/` (type-check sem erros).
- Rodar `npm run build` no `backend/` (compila sem erros).
- Subir o servidor (`bash scripts/start.sh`) e clicar na funcionalidade que você implementou.
- Testar o **caminho feliz** e ao menos **um caminho de erro** (ex.: input inválido, sem rede).
- Verificar que **funcionalidades existentes não regrediram**.

### 8.2 Capture evidências

Para o PR, salve:

- **Print da tela** funcionando.
- **Print do terminal** se for funcionalidade backend (response do endpoint).
- **Pequeno vídeo** (opcional) se for fluxo complexo.

---

## 9. Abrindo o Pull Request

```bash
# 1. Verifique o que vai ser comitado
git status
git diff

# 2. Adicione os arquivos
git add <arquivos modificados>

# 3. Comite
git commit -m "feat(mapa): adiciona pins coloridos por status

refs CART-001"

# 4. Sincronize com main
git pull --rebase origin main

# 5. Suba sua branch
git push -u origin feat/CART-001-mapa-leaflet
```

Em seguida, vá ao GitHub:

1. Clique em **Compare & pull request** na branch que você acabou de subir.
2. Use o **título** no formato `[CART-XXX] descrição clara`.
3. Preencha a descrição usando o template do [`CONTRIBUTING.md`](../CONTRIBUTING.md#53-descrição-do-pr).
4. Atribua revisores (1 colega + professor).
5. Cole o link do PR no card do Trello e mova-o para **Em revisão (PR)**.

---

## 10. Recebendo revisão e fazendo ajustes

- Revisores deixam comentários linha-a-linha. Leia tudo.
- Para responder com código:

  ```bash
  # ainda na sua branch
  # editar arquivos conforme feedback
  git add <arquivos>
  git commit -m "fix: ajusta validação após review"
  git push
  ```

- O PR é atualizado automaticamente.
- Se o revisor pedir, faça `git pull --rebase origin main` antes de subir mais commits.
- **Não force-push** sem combinar com quem está revisando.

---

## 11. Após o merge

1. No GitHub, **delete sua branch** (botão "Delete branch" após merge).
2. Localmente:

   ```bash
   git checkout main
   git pull origin main
   git branch -d feat/CART-001-mapa-leaflet
   ```

3. No Trello: mova o card para **Concluído** e cole o link do commit de merge.
4. Comemore. 🎉

---

## 12. Erros comuns e como evitar

| Problema                                                | Como evitar                                                          |
| ------------------------------------------------------- | -------------------------------------------------------------------- |
| Subi um `.env` com segredo                              | Use sempre o `.gitignore`. Verifique com `git status` antes do push. |
| Conflito de merge gigante na hora do PR                 | `git pull --rebase origin main` **diariamente**.                     |
| PR rejeitado por estar com várias tarefas misturadas    | Uma branch = um card = um PR.                                        |
| Banco quebrou após `db:push`                            | **Sempre** faça backup do `.db` antes de migrar.                     |
| Frontend chamando backend errado em produção            | Ver `docs/CONFIG.md` — `VITE_API_BASE` precisa apontar pro Render.   |
| Login não funciona após deploy                          | Verifique `JWT_SECRET` e `FRONTEND_URL` no Render (CORS).            |

---

## 13. Onde pedir ajuda

1. **Card do Trello** — comente lá; fica registrado.
2. **Repositório** — abra uma **Issue** no GitHub se for bug ou dúvida técnica que afete o projeto.
3. **Coordenação** — Euler Azevedo / Dioneide Sales (canais combinados em sala).

---

## 14. Próximos passos

- Faça o [`TUTORIAL-PRIMEIRA-TASK.md`](./TUTORIAL-PRIMEIRA-TASK.md) — uma tarefa guiada do zero ao PR.
- Estude a [`ARQUITETURA.md`](./ARQUITETURA.md) para entender o sistema completo.
- Veja o [`ROADMAP-V2.md`](./ROADMAP-V2.md) para conhecer o backlog.

---

> Boa contribuição e bons estudos!
> © Euler Azevedo & Dioneide Sales — Todos os direitos reservados.
