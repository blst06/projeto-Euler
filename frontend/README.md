# Cartivore — Frontend

Interface web do sistema Cartivore — Gestão Estratégica de Carteira de Clientes.

**Stack:** React 18 · Vite · TypeScript · Tailwind CSS v3 · shadcn/ui · TanStack Query  
**Deploy:** Vercel  
**Repositório backend:** [cartivore-backend](https://github.com/seu-usuario/cartivore-backend)

## Rodando localmente

```bash
# 1. Certifique-se de que o backend está rodando em localhost:3000
bash scripts/setup.sh   # primeira vez: cria .env e instala dependências
bash scripts/start.sh   # inicia em http://localhost:5173
```

O Vite faz proxy automático de `/api` → `http://localhost:3000` em desenvolvimento. Não é necessário configurar nada extra.

## Variáveis de Ambiente

| Variável        | Descrição                                        | Exemplo                                    |
| --------------- | ------------------------------------------------ | -------------------------------------------|
| `VITE_API_BASE` | URL base do backend (vazio = proxy local)        | `https://cartivore-backend.onrender.com`   |

Em desenvolvimento local, deixe `VITE_API_BASE` **vazio** — o proxy do Vite cuida do roteamento.  
Em produção (Vercel), configure com a URL pública do Render.

## Deploy no Vercel

1. Importe o repositório no [Vercel](https://vercel.com)
2. O framework é detectado automaticamente como **Vite**
3. Adicione a variável de ambiente `VITE_API_BASE` com a URL do backend no Render
4. Deploy automático a cada push na branch `main`

O `vercel.json` já inclui o rewrite `/* → /index.html` necessário para o roteamento SPA.

## Estrutura

```
src/
├── pages/         ← Telas da aplicação
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── Clientes.tsx
│   ├── Vendas.tsx
│   ├── Financeiro.tsx
│   ├── Mapa.tsx
│   ├── Relatorios.tsx
│   └── Usuarios.tsx
├── components/
│   ├── Layout.tsx  ← Sidebar + header
│   └── ui/         ← Componentes shadcn/ui
├── contexts/
│   └── AuthContext.tsx
├── hooks/
└── lib/
    ├── queryClient.ts  ← Configuração do fetch + TanStack Query
    └── auth.ts         ← Gerenciamento de token JWT
```

## Login padrão

```
Email: admin@cartivore.com
Senha: admin123
```

## Licença

Proprietária © Euler Azevedo & Dioneide Sales — Todos os direitos reservados.
