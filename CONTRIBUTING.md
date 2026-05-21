# Guia de Contribuição — Cartivore

Bem-vindo(a)! Este documento descreve **como contribuir com o projeto Cartivore** durante o estágio supervisionado. Ele é o ponto de partida obrigatório para todos os estagiários e colaboradores.

> **Público-alvo:** estudantes de estágio, monitores e mantenedores do projeto.
> **Idioma oficial do projeto:** Português (PT-BR).

---

## 1. Antes de começar

Antes do primeiro commit, leia também:

- [`README.md`](./README.md) — visão geral
- [`docs/GUIA-ALUNOS.md`](./docs/GUIA-ALUNOS.md) — passo a passo prático para estagiários
- [`docs/CONFIG.md`](./docs/CONFIG.md) — variáveis de ambiente e configuração
- [`docs/ARQUITETURA.md`](./docs/ARQUITETURA.md) — visão técnica do sistema
- [`docs/ROADMAP-V2.md`](./docs/ROADMAP-V2.md) — backlog de tarefas (CART-XXX)
- [`docs/TUTORIAL-PRIMEIRA-TASK.md`](./docs/TUTORIAL-PRIMEIRA-TASK.md) — sua primeira contribuição

---

## 2. Fluxo geral de trabalho

```
Trello (card) → Branch → Commits → Pull Request → Code Review → Merge → Atualiza Trello
```

1. Pegue um card no quadro do **Trello**.
2. Mova o card para a coluna **Em desenvolvimento** e atribua a si mesmo.
3. Crie uma branch a partir de `main` seguindo a convenção abaixo.
4. Faça commits pequenos e frequentes.
5. Abra um **Pull Request (PR)** no GitHub apontando para `main`.
6. Solicite revisão de pelo menos **um colega** e do **professor responsável**.
7. Após aprovação, faça o merge **via GitHub** (squash merge é o padrão).
8. Mova o card no Trello para **Concluído** com o link do PR.

> ⚠️ **Regra absoluta:** **nenhum merge direto em `main` sem revisão**. Sempre via Pull Request com aprovação.

---

## 3. Convenção de branches

```
<tipo>/<id-trello>-<descricao-curta-em-kebab-case>
```

| Tipo       | Quando usar                                            | Exemplo                                  |
| ---------- | ------------------------------------------------------ | ---------------------------------------- |
| `feat`     | Nova funcionalidade                                    | `feat/CART-001-mapa-leaflet`             |
| `fix`      | Correção de bug                                        | `fix/CART-042-erro-login-token`          |
| `refactor` | Refatoração sem mudança de comportamento               | `refactor/CART-015-dashboard-hooks`      |
| `docs`     | Documentação                                           | `docs/CART-099-readme-instalacao`        |
| `chore`    | Tarefas de manutenção (deps, configs, scripts)         | `chore/CART-101-atualiza-eslint`         |
| `test`     | Adicionar ou ajustar testes                            | `test/CART-077-vendas-status`            |

**Regras:**

- Sempre em **inglês** para o tipo, **português** ou **inglês curto** para a descrição.
- **Sem espaços, sem acentos, sem caracteres especiais** — apenas `a-z`, `0-9` e `-`.
- Sempre prefixe com o **ID do card no Trello** (ex.: `CART-001`).
- Branch criada a partir da `main` atualizada (`git pull origin main` antes).

---

## 4. Convenção de commits

Seguimos uma versão simplificada do **Conventional Commits**:

```
<tipo>(<escopo opcional>): <descrição curta no imperativo>

[corpo opcional explicando o "porquê"]

[rodapé opcional: refs CART-XXX]
```

**Tipos aceitos:** `feat`, `fix`, `refactor`, `docs`, `chore`, `test`, `style`, `perf`.

**Exemplos:**

```
feat(mapa): adiciona pins coloridos por status do cliente

Pins verdes para adimplente, amarelos para risco, vermelhos para
inadimplente. Necessário para a entrega da CART-001.

refs CART-001
```

```
fix(auth): corrige expiração de token JWT em produção

O token estava expirando em 8 minutos em vez de 8 horas porque a
configuração lia JWT_EXPIRES_IN como string sem conversão de unidade.

refs CART-042
```

**Regras importantes:**

- Mensagem em **português**, descrição **no imperativo** ("adiciona", "corrige", "remove").
- Linha de assunto **com no máximo 72 caracteres**.
- **Sem ponto final** na linha de assunto.
- Sempre referencie o card do Trello no rodapé (`refs CART-XXX`).
- **Não inclua** `Co-authored-by` de assistentes de IA. Autoria deve refletir o trabalho humano.
- Faça commits **atômicos**: cada commit deve representar uma mudança coerente.

---

## 5. Pull Request — checklist obrigatório

### 5.1 Antes de abrir o PR

- [ ] Branch atualizada em relação à `main` (`git pull --rebase origin main`).
- [ ] Código compila sem erros (`npm run check` no frontend, `npm run build` no backend).
- [ ] Servidor sobe localmente sem erros (`bash scripts/start.sh`).
- [ ] Funcionalidade testada manualmente nos cenários principais.
- [ ] **Sem credenciais, tokens, senhas ou `.env`** comitados (verifique com `git diff --cached`).
- [ ] **Sem `console.log` de debug** esquecidos no código de produção.
- [ ] Variáveis novas adicionadas em `.env.example` e documentadas em `docs/CONFIG.md`.

### 5.2 Título do PR

Formato:

```
[CART-XXX] <descrição clara do que foi feito>
```

Exemplo: `[CART-001] Mapa interativo com Leaflet e pins por status`.

### 5.3 Descrição do PR

Use o template abaixo:

```markdown
## Card do Trello
Link: <cole o link do card aqui>

## O que foi feito
<bullets curtas descrevendo as mudanças funcionais>

## Como testar
1. <passo a passo claro para o revisor reproduzir>
2. ...

## Capturas de tela / evidências
<imagens, vídeos curtos ou logs, quando aplicável>

## Checklist
- [ ] Código segue o padrão do projeto
- [ ] Testado manualmente em ambiente local
- [ ] `.env.example` atualizado (se aplicável)
- [ ] Sem segredos comitados
- [ ] Card do Trello atualizado
```

---

## 5.5 Integração contínua (CI)

A cada **pull request** para `main` e a cada **push** em `main`, o GitHub Actions executa o workflow `.github/workflows/ci.yml`, que valida:

- **Frontend** (`frontend/`): `npm ci`, `npm run check` (typecheck) e `npm run build`.
- **Backend** (`backend/`): `npm ci`, `npx tsc --noEmit` (typecheck) e `npm run build`.

Os jobs rodam em Node 20 com cache de `npm` por lockfile. Variáveis de ambiente do backend usam valores dummy apenas para o pipeline — **nunca commite segredos reais**. Para reproduzir localmente antes de abrir o PR, basta rodar os mesmos comandos em cada pasta.

---

## 6. Checklist de Code Review

Quem revisa um PR deve usar esta lista:

### Funcional
- [ ] O PR realmente entrega o que o card do Trello descreve.
- [ ] A funcionalidade foi reproduzida localmente ou em ambiente de testes.
- [ ] Casos de borda óbvios foram considerados (ex.: lista vazia, valores nulos, erros de rede).

### Código
- [ ] Os nomes de variáveis e funções são claros e em português ou inglês consistente com o restante do código.
- [ ] Não há código duplicado quando uma função/utilitário existente já resolve.
- [ ] Não há `any` injustificado em TypeScript.
- [ ] Não há `console.log` de debug nem código comentado abandonado.
- [ ] Tratamento de erros existe em chamadas externas (rede, banco) — não engole exceções silenciosamente.

### Segurança
- [ ] Nenhum segredo, senha ou token foi comitado.
- [ ] Endpoints autenticados continuam protegidos pelo middleware `authenticate`.
- [ ] Endpoints sensíveis (admin) continuam validando `role`.
- [ ] Inputs de usuário são validados (preferencialmente com `zod`).
- [ ] SQL é construído via Drizzle ORM, **nunca** por concatenação de strings.

### Banco de dados
- [ ] Mudanças de schema vieram acompanhadas de migration via `drizzle-kit`.
- [ ] **Backup do banco foi feito antes de qualquer alteração estrutural** em produção.

### UX/UI (frontend)
- [ ] Layout responsivo (mobile + desktop).
- [ ] Estados de loading, vazio e erro estão tratados.
- [ ] Mensagens em português e claras para o usuário final.

### Documentação
- [ ] README/docs foram atualizados se necessário.
- [ ] `.env.example` está atualizado se houver nova variável.

---

## 7. Integração com o Trello

### 7.1 Estrutura do quadro

Sugestão de colunas:

```
Backlog → A fazer → Em desenvolvimento → Em revisão (PR) → Pronto para testar → Concluído
```

### 7.2 Como vincular um PR a um card

1. No card do Trello, na descrição, cole o link do PR após abri-lo.
2. No PR (descrição), cole também o link do card.
3. Mova o card para **Em revisão (PR)** assim que abrir o PR.
4. Após o merge, mova para **Concluído** e adicione o **link do commit de merge** no card.

### 7.3 Atualização durante o desenvolvimento

- Comente no card sempre que houver bloqueio ou dúvida.
- Atualize a estimativa se perceber que a tarefa é maior do que o previsto.
- Se descobrir que o card depende de outro, adicione essa dependência na descrição.

---

## 8. Regra de ouro: nunca direto em `main`

```
git push origin main          ❌ PROIBIDO
git checkout main && git merge meu-branch    ❌ PROIBIDO localmente sem PR
```

**Sempre:**

```
git checkout -b feat/CART-XXX-...
# trabalha, comita
git push -u origin feat/CART-XXX-...
# abre PR, espera review, merge pelo GitHub
```

A branch `main` deve ser **sempre estável e deployável**.

---

## 9. Boas práticas adicionais

- **Faça commits pequenos e frequentes**. É melhor 6 commits coerentes do que 1 commit gigante.
- **Sincronize sua branch com `main` regularmente** (`git pull --rebase origin main`) para evitar conflitos cabeludos no PR.
- **Não trabalhe em mais de uma tarefa na mesma branch**. Uma branch = um card = um PR.
- **Não suba arquivos `.env`, `*.db`, `node_modules/`, `dist/`** — eles já estão no `.gitignore`, mas verifique.
- **Em caso de dúvida, pergunte antes de comitar**. Mais barato perguntar do que reverter um problema em produção.

---

## 10. Contato

| Papel             | Responsável                            |
| ----------------- | -------------------------------------- |
| Coordenação       | Euler Azevedo                          |
| Co-coordenação    | Dioneide Sales                         |
| Repositório       | https://github.com/eulerazevedo/cartivore |

---

> **Lembre-se:** este é um projeto acadêmico real, com usuários reais (JR FOOD).
> Toda contribuição deve ser feita com o mesmo cuidado de um projeto profissional.

© Euler Azevedo & Dioneide Sales — Todos os direitos reservados.
