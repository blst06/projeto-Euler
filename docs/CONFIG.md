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
| `JWT_SECRET`    | **Sim** | Chave secreta usada para assinar tokens JWT.                            | `dev-secret-trocar-em-prod`                      | `(string longa e aleatória — usar "Generate")`|
| `FRONTEND_URL`  | Sim         | URL do frontend autorizada no CORS.                                     | `http://localhost:5173`                          | `https://cartivore.vercel.app`                |
| `DATABASE_URL`  | **Sim** | String de conexão do Supabase (PostgreSQL).                            | `(vazio ou BD local)`                            | `postgresql://postgres:senha@url...`          |
| `DB_PATH`       | Não         | *(Obsoleto - Migração Supabase)* Caminho SQLite.                       | `./cartivore.db`                                 | *(Remover na v2)* |

### 2.2 Detalhes importantes

#### `DATABASE_URL` (Novo - Integração Supabase)

- Esta variável substitui o `DB_PATH` na transição para Supabase.
- **Segurança Crítica:** Nunca guarde a string de conexão real em nenhum arquivo `.env` comitado. Ela contém o usuário e a senha do banco de dados em texto plano.
- Configure esta variável diretamente no painel do Render.

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
| `VITE_API_BASE` | Não em local | URL base da API. Em local, **deixe vazio** para usar o proxy do Vite. | *(vazio)* | `https://cartivore-backend.onrender.com`    |

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