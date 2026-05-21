# Deploy — Cartivore

Guia de deploy do backend (Render) e frontend (Vercel).

---

## Backend — Render

### Passo a passo

1. Acesse [render.com](https://render.com) e crie uma conta
2. Clique em **New → Web Service**
3. Conecte o repositório `cartivore-backend` (ou este repo com `Root Directory: backend`)
4. Configure:
   - **Runtime:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Health Check Path:** `/api/health`
5. Adicione as variáveis de ambiente:

| Variável       | Valor                                      |
| -------------- | ------------------------------------------ |
| `NODE_ENV`     | `production`                               |
| `JWT_SECRET`   | *(gere com o botão "Generate" do Render)*  |
| `FRONTEND_URL` | URL do Vercel (ex: `https://cartivore.vercel.app`) |
| `DB_PATH`      | `/var/data/cartivore.db`                   |

6. Em **Disks**, adicione:
   - **Name:** `cartivore-data`
   - **Mount Path:** `/var/data`
   - **Size:** 1 GB

7. Clique em **Deploy**

> O `render.yaml` na raiz do projeto automatiza toda essa configuração.

---

## Frontend — Vercel

### Passo a passo

1. Acesse [vercel.com](https://vercel.com) e crie uma conta
2. Clique em **Add New → Project**
3. Importe o repositório `cartivore-frontend` (ou este repo com `Root Directory: frontend`)
4. O framework **Vite** é detectado automaticamente
5. Adicione a variável de ambiente:

| Variável        | Valor                                          |
| --------------- | ---------------------------------------------- |
| `VITE_API_BASE` | URL pública do backend no Render (ex: `https://cartivore-backend.onrender.com`) |

6. Clique em **Deploy**

> O `vercel.json` já configura o rewrite `/* → /index.html` para o roteamento SPA.

---

## Pós-deploy

1. Copie a URL do Vercel e atualize `FRONTEND_URL` no Render
2. Copie a URL do Render e atualize `VITE_API_BASE` no Vercel
3. Faça um redeploy do Render para aplicar o CORS com a URL correta
4. Acesse o frontend e faça login com `admin@cartivore.com` / `admin123`
5. **Altere a senha do admin imediatamente após o primeiro acesso**

---

## Ambiente Local

```bash
bash scripts/setup.sh   # instala dependências de backend e frontend
bash scripts/start.sh   # inicia ambos (backend :3000, frontend :5173)
```
