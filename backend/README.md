# Cartivore — Backend API

API REST do sistema Cartivore — Gestão Estratégica de Carteira de Clientes.

**Stack:** Node.js · Express · TypeScript · SQLite · Drizzle ORM · JWT · bcryptjs  
**Deploy:** Render (com disco persistente para o SQLite)  
**Repositório frontend:** [cartivore-frontend](https://github.com/seu-usuario/cartivore-frontend)

## Rodando localmente

```bash
bash scripts/setup.sh   # primeira vez: cria .env e instala dependências
bash scripts/start.sh   # inicia o servidor em http://localhost:3000
```

## Variáveis de Ambiente

| Variável       | Descrição                                    | Exemplo                          |
| -------------- | -------------------------------------------- | -------------------------------- |
| `PORT`         | Porta do servidor (Render injeta em produção)| `3000`                           |
| `JWT_SECRET`   | Chave secreta JWT — mude em produção!        | `uma-string-longa-e-aleatoria`   |
| `FRONTEND_URL` | URL do frontend (CORS)                       | `https://cartivore.vercel.app`   |
| `DB_PATH`      | Caminho do banco SQLite                      | `/var/data/cartivore.db`         |

## Deploy no Render

1. Crie um novo **Web Service** no Render apontando para este repositório
2. O `render.yaml` configura tudo automaticamente (incluindo o disco persistente de 1GB)
3. Configure a variável `FRONTEND_URL` com a URL do deploy no Vercel
4. O `JWT_SECRET` é gerado automaticamente pelo Render

## Endpoints

| Método   | Rota                          | Autenticação | Descrição                    |
| -------- | ----------------------------- | ------------ | -----------------------------|
| `GET`    | `/api/health`                 | —            | Health check                 |
| `POST`   | `/api/auth/login`             | —            | Login (retorna JWT)          |
| `GET`    | `/api/auth/me`                | JWT          | Dados do usuário logado      |
| `GET`    | `/api/dashboard`              | JWT          | Estatísticas do dashboard    |
| `GET`    | `/api/clientes`               | JWT          | Lista todos os clientes      |
| `POST`   | `/api/clientes`               | JWT          | Cria cliente                 |
| `PUT`    | `/api/clientes/:id`           | JWT          | Atualiza cliente             |
| `DELETE` | `/api/clientes/:id`           | admin        | Remove cliente (soft delete) |
| `PATCH`  | `/api/clientes/:id/bloquear`  | admin/gerente| Bloqueia cliente             |
| `GET`    | `/api/vendas`                 | JWT          | Lista todas as vendas        |
| `POST`   | `/api/vendas`                 | JWT          | Cria venda                   |
| `PATCH`  | `/api/vendas/:id/status`      | JWT          | Atualiza status da venda     |
| `POST`   | `/api/pagamentos`             | JWT          | Registra pagamento           |
| `POST`   | `/api/historico`              | JWT          | Adiciona histórico           |
| `GET`    | `/api/usuarios`               | admin        | Lista usuários               |
| `POST`   | `/api/usuarios`               | admin        | Cria usuário                 |

## Login padrão

```
Email: admin@cartivore.com
Senha: admin123
```

> Altere a senha do admin após o primeiro acesso em produção.

## Licença

Proprietária © Euler Azevedo & Dioneide Sales — Todos os direitos reservados.
