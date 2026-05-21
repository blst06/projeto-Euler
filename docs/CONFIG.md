# Configuração — Variáveis de Ambiente

Este documento consolida **todas as variáveis de ambiente** usadas no Cartivore, separadas por escopo (raiz, backend, frontend) e por ambiente (local vs produção).

> ⚠️ **Este arquivo NÃO contém segredos.** Apenas nomes e exemplos. Os valores reais ficam:
> - localmente em arquivos `.env` (que estão no `.gitignore` e **nunca** devem ser comitados);
> - em produção, no painel do **Render** (backend) e do **Vercel** (frontend).

---

## 1. Visão geral por escopo

| Arquivo                    | Escopo            | Quando criar                                        |
| -------------------------- | ----------------- | --------------------------------------------------- |
| `.env`                     | Raiz / scripts    | Local — copiado de `.env.example` no setup          |
| `backend/.env` (opcional)  | Apenas backend    | Local — se preferir separar variáveis do backend    |
| `frontend/.env`            | Apenas frontend   | Local — variáveis prefixadas com `VITE_`            |

Em produção, **nunca** existe arquivo `.env` no servidor — as variáveis são definidas direto no painel do Render/Vercel.

---

## 2. Variáveis do backend

### 2.1 Tabela completa

| Variável        | Obrigatória | Descrição                                                              | Exemplo (local)                                  | Exemplo (produção)                            |
| --------------- | ----------- | ---------------------------------------------------------------------- | ------------------------------------------------ | --------------------------------------------- |
| `NODE_ENV`      | Sim         | Modo de execução. Afeta logs, CORS e otimizações.                      | `development`                                    | `production`                                  |
| `PORT`          | Sim         | Porta do servidor HTTP. **Em produção o Render injeta automaticamente**.| `3000`                                           | `(injetado pelo Render)`                      |
| `JWT_SECRET`    | **Sim**     | Chave secreta usada para assinar tokens JWT.                            | `dev-secret-trocar-em-prod`                      | `(string longa e aleatória — usar "Generate")`|
| `FRONTEND_URL`  | Sim         | URL do frontend autorizada no CORS.                                     | `http://localhost:5173`                          | `https://cartivore.vercel.app`                |
| `DB_PATH`       | Não         | Caminho do arquivo SQLite. Default: `./cartivore.db`.                   | `./cartivore.db`                                 | `/var/data/cartivore.db`                      |

### 2.2 Detalhes importantes

#### `JWT_SECRET`

- **Nunca** use o valor de exemplo em produção.
- Recomendação: string com **pelo menos 64 caracteres** aleatórios.
- No Render, use o botão **"Generate"** ao criar a variável.
- Se você mudar `JWT_SECRET` em produção, **todos os tokens ativos serão invalidados** — usuários precisarão fazer login novamente.

#### `FRONTEND_URL`

- Em produção, deve apontar para a URL pública do Vercel (ex.: `https://cartivore.vercel.app`).
- Sem isso, o navegador bloqueia chamadas por **CORS**.
- Se houver mais de um frontend (ex.: domínio customizado + vercel.app), atualmente o backend aceita apenas uma URL — discuta com a coordenação se precisar suportar várias.

#### `DB_PATH`

- Em produção no Render, **deve apontar para um disco persistente** (`/var/data/cartivore.db`), senão o banco é apagado a cada deploy.
- O `render.yaml` já configura o disco `cartivore-data` (1 GB) montado em `/var/data`.

---

## 3. Variáveis do frontend

### 3.1 Tabela completa

| Variável        | Obrigatória | Descrição                                                              | Exemplo (local)                | Exemplo (produção)                          |
| --------------- | ----------- | ---------------------------------------------------------------------- | ------------------------------ | ------------------------------------------- |
| `VITE_API_BASE` | Não em local | URL base da API. Em local, **deixe vazio** para usar o proxy do Vite. | *(vazio)*                      | `https://cartivore-backend.onrender.com`    |

### 3.2 Detalhes importantes

- **Apenas variáveis prefixadas com `VITE_`** são expostas ao código frontend.
- **Tudo que vira `VITE_*` aparece no JavaScript final do navegador** — **nunca** coloque segredo, senha ou chave de API privada aí.
- Em desenvolvimento, o `vite.config.ts` faz proxy de `/api/*` para `http://localhost:3000`. Por isso `VITE_API_BASE` deve ficar **vazio** localmente.
- No Vercel, configure `VITE_API_BASE` no painel **Environment Variables** antes do primeiro deploy.

---

## 4. Setup local — passo a passo

```bash
# 1. Na raiz do projeto
cp .env.example .env

# 2. Edite o .env conforme necessário
#    - JWT_SECRET pode ser qualquer string em ambiente local
#    - FRONTEND_URL = http://localhost:5173 já é o default

# 3. Frontend (opcional — apenas se quiser apontar para um backend remoto)
echo "VITE_API_BASE=" > frontend/.env

# 4. Subir o ambiente
bash scripts/setup.sh
bash scripts/start.sh
```

---

## 5. Configuração em produção

### 5.1 Render (backend)

No painel do Render, em **Environment**, configure:

```
NODE_ENV       = production
JWT_SECRET     = (use o botão Generate)
FRONTEND_URL   = https://cartivore.vercel.app   (URL real do Vercel)
DB_PATH        = /var/data/cartivore.db
```

> `PORT` é injetado automaticamente — **não defina manualmente**.

Verifique também que existe um **Disk** anexo:

```
Name:        cartivore-data
Mount Path:  /var/data
Size:        1 GB
```

### 5.2 Vercel (frontend)

No painel do Vercel, em **Settings → Environment Variables**, configure:

```
VITE_API_BASE = https://cartivore-backend.onrender.com   (URL real do Render)
```

Aplique para **Production**, **Preview** e **Development**.

### 5.3 Ordem recomendada do primeiro deploy

1. Faça deploy inicial do backend no Render — ele gera a URL pública.
2. Configure `VITE_API_BASE` no Vercel com a URL do passo 1.
3. Faça deploy do frontend no Vercel — ele gera a URL pública.
4. Volte ao Render e configure `FRONTEND_URL` com a URL do Vercel.
5. **Re-deploy** o backend para o CORS pegar a URL nova.

---

## 6. Avisos de segurança

- **`JWT_SECRET`** — nunca comitado, nunca compartilhado fora do painel de produção. Se vazar, **rotacione imediatamente** (gerar novo secret + redeploy do backend).
- **Senha padrão `admin123`** — **só** para ambiente local na primeira inicialização. Em produção, **altere imediatamente após o primeiro login**. Sugestão: ao detectar o ambiente de produção, force a troca da senha do admin no primeiro acesso (item para o roadmap).
- **Backups antes de migrations** — antes de qualquer `npm run db:push` ou alteração de schema em produção, **baixe uma cópia** do `cartivore.db` do disco do Render. Sem backup, qualquer erro de migration é irreversível.
- **Pull Requests precisam de revisão** — não faça merge direto em `main` sem o code review descrito no [`CONTRIBUTING.md`](../CONTRIBUTING.md).

---

## 7. Adicionando uma nova variável

Sempre que você (ou um card do Trello) precisar de uma variável nova:

1. Adicione **com valor de exemplo seguro** em `.env.example` (ou `frontend/.env.example` se for `VITE_*`).
2. Documente nesta página, em uma das tabelas acima.
3. Lembre o coordenador de **provisionar a variável no Render/Vercel** antes do próximo deploy.
4. No PR, mencione explicitamente a nova variável na descrição.

---

## 8. Diagnóstico rápido

| Sintoma                                                 | Provável causa                                                     |
| ------------------------------------------------------- | ------------------------------------------------------------------ |
| Backend sobe mas login falha com 401                    | `JWT_SECRET` mudou — token velho inválido. Faça login novamente.   |
| Frontend mostra "Network error" em produção             | `VITE_API_BASE` errado ou backend dormindo (Render free tier).     |
| Backend retorna `CORS error`                            | `FRONTEND_URL` no Render está apontando para URL errada.           |
| Banco zerado após deploy                                | `DB_PATH` não está no disco persistente. Restaurar do backup.      |
| `npm run dev` reclama de variável undefined no front    | Variável precisa ser prefixada com `VITE_` e o servidor reiniciado.|

---

> © Euler Azevedo & Dioneide Sales — Todos os direitos reservados.
