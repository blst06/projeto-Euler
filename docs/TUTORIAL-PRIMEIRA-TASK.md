# Tutorial — Sua primeira tarefa no Cartivore

Tutorial **passo a passo, copiando e colando comandos**, para você (estagiário(a)) entregar com segurança sua **primeira contribuição** ao projeto.

> Antes de começar, leia rapidamente o [`CONTRIBUTING.md`](../CONTRIBUTING.md) e o [`docs/GUIA-ALUNOS.md`](./GUIA-ALUNOS.md). Eles dão o contexto que este tutorial usa sem repetir.

> ⚠️ **Importante:** este tutorial é genérico. Os comandos são reais, mas trechos como `<seu-usuario>` e `CART-XXX` precisam ser substituídos pelos seus valores. **Nunca cole credenciais no terminal de exemplo público.**

---

## 0. O que vamos fazer

Para sua primeira task, sugerimos algo seguro e visível:

> **Tarefa exemplo:** ajustar o título da página inicial do frontend para incluir o ano corrente (ex.: "Cartivore — 2026").

Isso permite exercitar **todo o fluxo** (Trello → branch → commit → PR → merge) sem riscos para o sistema.

> Se a coordenação te indicou outro card como sua primeira tarefa, **siga este mesmo fluxo** apenas trocando o que for editado.

---

## 1. Pegue o card no Trello

1. Abra o quadro do Trello.
2. Encontre o card **"CART-XXX — Atualiza título com ano corrente"** (ou o que a coordenação te indicar).
3. Atribua-se ao card.
4. Mova-o para a coluna **Em desenvolvimento**.
5. Anote o **ID do card** — você vai usá-lo no nome da branch e nos commits.

---

## 2. Verifique se o ambiente está pronto

Já fez o `setup.sh` antes? Confira:

```bash
node -v        # deve mostrar v20+ ou superior
git --version  # deve estar instalado
cd ~/projetos/cartivore   # ou o caminho onde você clonou
ls scripts/    # deve listar setup.sh e start.sh
```

Se ainda não rodou o setup:

```bash
bash scripts/setup.sh
```

---

## 3. Atualize a `main` antes de criar a branch

```bash
git checkout main
git pull origin main
```

> Se aparecer `Your branch is up to date`, ótimo. Se aparecer conflito, **pare** e chame a coordenação.

---

## 4. Crie sua branch

Substitua `CART-XXX` pelo ID do seu card e use uma descrição curta em kebab-case:

```bash
git checkout -b feat/CART-XXX-titulo-com-ano
```

Confirme com:

```bash
git branch
# deve mostrar:
# * feat/CART-XXX-titulo-com-ano
#   main
```

---

## 5. Faça a alteração

Abra o projeto no VS Code:

```bash
code .
```

Localize o arquivo do título. Para o exemplo, está em `frontend/index.html`:

```html
<title>Cartivore</title>
```

Altere para:

```html
<title>Cartivore — 2026</title>
```

> Para outros cards, a coordenação te dirá quais arquivos editar. Siga sempre o **escopo do card** — não aproveite para mexer em coisas não relacionadas.

---

## 6. Suba o ambiente local e teste

Em um terminal:

```bash
bash scripts/start.sh
```

Aguarde aparecer:

```
Frontend  http://localhost:5173
Backend   http://localhost:3000/api
```

Abra o navegador em `http://localhost:5173` e:

1. Verifique se a aba do navegador mostra o título correto.
2. Faça login com `admin@cartivore.com / admin123`.
3. Navegue por **pelo menos duas telas** (Dashboard, Clientes) para garantir que **nada quebrou**.
4. Tire um **print** da aba do navegador com o título novo. Você vai usar no PR.

Quando terminar de testar, derrube o servidor com `Ctrl+C`.

---

## 7. Verifique o que vai ser comitado

```bash
git status
```

Deve aparecer **apenas** os arquivos que você editou. Se aparecer algo como `.env`, `*.db`, `node_modules`, **pare** e revise o `.gitignore` — esses arquivos **não podem** ir para o commit.

```bash
git diff
```

Confira se a mudança é exatamente a que você quer.

---

## 8. Faça o commit

```bash
git add frontend/index.html
git commit -m "feat(frontend): adiciona ano corrente ao título da página

Atualiza o <title> para 'Cartivore — 2026' para indicar a versão
em uso aos usuários internos.

refs CART-XXX"
```

Confirme:

```bash
git log -1 --format='%h %an <%ae> | %cn <%ce>%n%s'
```

Deve mostrar **seu nome e e-mail** corretamente.

> Se o nome/e-mail estiver errado, configure antes de continuar:
>
> ```bash
> git config user.name "Seu Nome Completo"
> git config user.email "seuemail@exemplo.com"
> ```
>
> E refaça o commit com `git commit --amend --reset-author`.

---

## 9. Sincronize com a `main` (rebase)

```bash
git pull --rebase origin main
```

Se aparecer **conflito**, abra os arquivos marcados, resolva, e em seguida:

```bash
git add <arquivo-resolvido>
git rebase --continue
```

Em caso de dúvida, **pare e pergunte** — não force operações que você não entende.

---

## 10. Suba a branch para o GitHub

```bash
git push -u origin feat/CART-XXX-titulo-com-ano
```

O Git vai mostrar uma URL para abrir o PR. Copie e cole no navegador, ou vá manualmente em:

```
https://github.com/eulerazevedo/cartivore/pulls
```

---

## 11. Abra o Pull Request

No GitHub:

1. Clique em **Compare & pull request**.
2. **Base:** `main` &nbsp; **Compare:** `feat/CART-XXX-titulo-com-ano`.
3. **Título do PR:**

   ```
   [CART-XXX] Adiciona ano corrente ao título da página
   ```

4. **Descrição do PR** (use o template):

   ```markdown
   ## Card do Trello
   Link: <cole o link do card aqui>

   ## O que foi feito
   - Atualiza `<title>` em `frontend/index.html` para incluir o ano corrente.

   ## Como testar
   1. `bash scripts/start.sh`
   2. Abrir `http://localhost:5173`
   3. Verificar a aba do navegador: deve mostrar "Cartivore — 2026"

   ## Capturas de tela
   <anexe o print que você tirou no passo 6>

   ## Checklist
   - [x] Código compila e roda localmente
   - [x] Testado manualmente
   - [x] Sem segredos comitados
   - [x] Card do Trello atualizado
   ```

5. Atribua **revisores** (1 colega + coordenação).
6. Clique em **Create pull request**.

---

## 12. Atualize o card do Trello

1. Mova o card para **Em revisão (PR)**.
2. Cole o link do PR na descrição do card.
3. Comente, se quiser, "PR aberto: #N — aguardando revisão."

---

## 13. Atendendo ao code review

- Leia **todos os comentários** com calma.
- Para responder com código:

  ```bash
  # ainda na sua branch, faça as correções pedidas
  git add <arquivos>
  git commit -m "fix(frontend): ajusta texto após review

  refs CART-XXX"
  git push
  ```

- O PR atualiza automaticamente.
- Marque os comentários como "Resolved" quando ajustar.

---

## 14. Após o merge

1. No GitHub, clique em **Delete branch** quando aparecer o aviso.
2. No terminal:

   ```bash
   git checkout main
   git pull origin main
   git branch -d feat/CART-XXX-titulo-com-ano
   ```

3. No Trello: mova o card para **Concluído** e cole o **link do commit de merge**.

Pronto — sua primeira tarefa está entregue. 🎉

---

## 15. Erros comuns nesta primeira vez

| Sintoma                                              | O que fazer                                                            |
| ---------------------------------------------------- | ---------------------------------------------------------------------- |
| `git push` recusado por "branch protection"          | Você está tentando subir direto na `main`. Crie uma branch.            |
| `git push` recusado por "rejected (non-fast-forward)"| `git pull --rebase origin main` antes do push.                         |
| Apareceu `.env` ou `*.db` no `git status`            | Não comite. Verifique o `.gitignore`.                                  |
| Author do commit aparece com nome errado             | `git config user.name/email` e `git commit --amend --reset-author`.    |
| Servidor não sobe                                     | Veja `docs/CONFIG.md` — provavelmente falta `.env` ou `JWT_SECRET`.    |
| Login não funciona localmente                         | Apague `backend/cartivore.db` (após backup) e suba de novo.            |

---

## 16. Próximos passos

- Pegue a **segunda tarefa** no Trello — agora sem este tutorial passo a passo.
- Leia o [`docs/ARQUITETURA.md`](./ARQUITETURA.md) para entender o sistema completo.
- Leia o [`docs/ROADMAP-V2.md`](./ROADMAP-V2.md) para conhecer o backlog inteiro.
- Em caso de dúvida, comente no card do Trello ou abra uma **Issue** no GitHub.

---

> © Euler Azevedo & Dioneide Sales — Todos os direitos reservados.
