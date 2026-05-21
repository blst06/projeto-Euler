# Cartivore

**Sistema de Gestão Estratégica de Carteira de Clientes**  
Desenvolvido para JR FOOD — Projeto Acadêmico de Estágio

> © Euler Azevedo & Dioneide Sales — Todos os direitos reservados.

---

## Visão Geral

O Cartivore é um sistema web para gestão da carteira de clientes de representantes comerciais, com controle de vendas, pagamentos, histórico de relacionamento e indicadores financeiros em tempo real.

## Estrutura do Repositório

```
cartivore/
├── backend/       ← API REST (Node.js + Express + SQLite + Drizzle ORM)
├── frontend/      ← Interface Web (React 18 + Vite + TypeScript + Tailwind)
├── docs/          ← Documentação técnica e roadmap
├── scripts/       ← Scripts de setup e inicialização
├── .env.example   ← Variáveis de ambiente (copie para .env)
├── .gitignore
├── CHANGELOG.md
├── DEPLOY.md      ← Guia de deploy (Render + Vercel)
├── render.yaml    ← Configuração de deploy do backend
└── README.md
```

## Stack

| Camada    | Tecnologia                                      |
| --------- | ----------------------------------------------- |
| Frontend  | React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui |
| Backend   | Node.js, Express, TypeScript                    |
| Banco     | SQLite + Drizzle ORM                            |
| Auth      | JWT + bcryptjs                                  |
| Deploy    | Vercel (frontend) + Render (backend)            |

## Rodando Localmente

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/cartivore.git
cd cartivore

# 2. Setup (instala dependências de backend e frontend)
bash scripts/setup.sh

# 3. Inicia os dois serviços
bash scripts/start.sh
```

| Serviço  | URL                         |
| -------- | --------------------------- |
| Frontend | http://localhost:5173       |
| Backend  | http://localhost:3000/api   |

**Login padrão (apenas em ambiente local):** `admin@cartivore.com` / `admin123`

> ⚠️ Em produção, **altere a senha do admin imediatamente após o primeiro acesso** e gere um `JWT_SECRET` longo e aleatório. Veja [`docs/CONFIG.md`](./docs/CONFIG.md).

## Deploy em Produção

Consulte [DEPLOY.md](./DEPLOY.md) para o passo a passo completo de deploy no Render e Vercel.

## Documentação

### Para estagiários e novos contribuidores

| Arquivo                                          | Descrição                                                        |
| ------------------------------------------------ | ---------------------------------------------------------------- |
| [`CONTRIBUTING.md`](./CONTRIBUTING.md)           | Guia de contribuição: branches, commits, PRs e Trello            |
| [`docs/GUIA-ALUNOS.md`](./docs/GUIA-ALUNOS.md)   | Guia prático do estagiário do zero ao primeiro PR                |
| [`docs/TUTORIAL-PRIMEIRA-TASK.md`](./docs/TUTORIAL-PRIMEIRA-TASK.md) | Tutorial passo a passo da primeira contribuição |
| [`docs/CONFIG.md`](./docs/CONFIG.md)             | Variáveis de ambiente (local e produção)                         |
| [`docs/ENTREGA-SEMESTRE.md`](./docs/ENTREGA-SEMESTRE.md) | Checklist de entrega final de semestre                    |

### Documentação técnica

| Arquivo                                          | Descrição                                                        |
| ------------------------------------------------ | ---------------------------------------------------------------- |
| [`docs/ARQUITETURA.md`](./docs/ARQUITETURA.md)   | Arquitetura do sistema e modelo de dados                         |
| [`docs/ROADMAP-V2.md`](./docs/ROADMAP-V2.md)     | Backlog de demandas para a versão 2.0                            |
| [`docs/adr/`](./docs/adr/)                       | Architecture Decision Records (decisões técnicas)                |
| [`backend/README.md`](./backend/README.md)       | Documentação da API REST                                         |
| [`frontend/README.md`](./frontend/README.md)     | Documentação do frontend                                         |

## Licença

Proprietária © Euler Azevedo & Dioneide Sales — Todos os direitos reservados.  
Proibida a reprodução ou distribuição sem autorização expressa dos autores.


