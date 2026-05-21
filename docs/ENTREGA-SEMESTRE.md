# Checklist de Entrega de Semestre — Cartivore

Este documento define **o que deve ser entregue ao final de cada semestre letivo** para que o trabalho do estagiário seja considerado concluído e avaliado.

> **Quem usa:** estagiários, monitores e coordenação.
> **Quando preencher:** ao final do período (semestre/módulo) ou ao encerrar o estágio.

---

## 1. Resumo da entrega

A entrega final é composta por **quatro blocos**:

1. **Tarefas executadas** — lista de cards do Trello concluídos com link de PR.
2. **Evidências técnicas** — capturas de tela, vídeos curtos, logs e/ou testes.
3. **Deploy** — confirmação de que o que foi entregue está no ambiente de produção (ou justificativa documentada).
4. **Demonstração** — script de demo + apresentação ao coordenador.

---

## 2. Capa da entrega

Crie um documento (Markdown ou PDF) com a estrutura abaixo:

```markdown
# Entrega — <Nome do Aluno> — <Semestre/Ano>

- **Curso/Disciplina:** <preencher>
- **Período:** <ex.: 2026.1>
- **Coordenação:** Euler Azevedo / Dioneide Sales
- **Repositório:** https://github.com/eulerazevedo/cartivore
- **Quadro Trello:** <link>
- **Total de horas estimadas:** <horas>
- **Total de horas reais:** <horas>
```

---

## 3. Tarefas executadas

Liste **todas** as tarefas trabalhadas no semestre, mesmo as canceladas. Use a tabela:

| Card     | Título                                          | Status     | PR                                          | Horas estimadas | Horas reais |
| -------- | ----------------------------------------------- | ---------- | ------------------------------------------- | --------------- | ----------- |
| CART-001 | Integração do mapa com Leaflet.js               | Concluída  | https://github.com/eulerazevedo/cartivore/pull/12 | 8               | 11          |
| CART-002 | Geocodificação de endereços                     | Concluída  | https://github.com/eulerazevedo/cartivore/pull/14 | 6               | 7           |
| CART-005 | Dark mode                                        | Em andamento | https://github.com/eulerazevedo/cartivore/pull/22 | 4               | 3           |
| CART-007 | Exportação Excel                                | Cancelada  | —                                           | 6               | 0           |

> Se uma tarefa foi cancelada, **explique brevemente o motivo** abaixo da tabela.

---

## 4. Evidências por tarefa

Para **cada tarefa concluída**, anexe:

### Modelo

```markdown
### CART-XXX — <Título>

**PR:** <link>
**Branch:** <nome>
**Commit de merge:** <hash>

#### O que foi entregue
<descrição em 2-3 linhas>

#### Capturas de tela
<imagens — antes/depois quando fizer sentido>

#### Como testar
1. <passo a passo curto>

#### Evidência de funcionamento em produção
<URL pública + print, ou justificativa se ainda não foi para produção>
```

### Tipos de evidência aceitos

| Tipo                       | Quando usar                                   |
| -------------------------- | --------------------------------------------- |
| Print de tela              | Mudanças visuais no frontend.                 |
| Vídeo curto (até 60s)      | Fluxos com várias etapas (formulários, mapa). |
| Print do terminal/Postman  | Endpoints de backend.                         |
| Log do servidor            | Tarefas de infraestrutura ou correções.      |
| Print do banco (SQLite)    | Mudanças de schema ou dados.                  |

> Salve as evidências em uma pasta `entrega-<ano>-<semestre>/` enviada por e-mail ou anexada ao card final no Trello. **Não comite imagens grandes no repositório**.

---

## 5. Checklist de Deploy

Marque o que se aplica:

- [ ] Backend em produção (Render) atualizado com a versão entregue.
- [ ] Frontend em produção (Vercel) atualizado com a versão entregue.
- [ ] Variáveis de ambiente (Render/Vercel) revisadas e documentadas.
- [ ] **Backup do banco SQLite** feito antes de qualquer migration de produção.
- [ ] Migrations aplicadas em produção sem erro (`npm run db:push`).
- [ ] Health check (`/api/health`) responde 200 em produção.
- [ ] Login com usuário de teste validado em produção.
- [ ] **Senha padrão do admin foi alterada** em produção.
- [ ] `JWT_SECRET` em produção é diferente do exemplo do `.env.example`.
- [ ] CORS funcionando — frontend acessa backend sem erro.

> Se algum item não foi concluído, registre **o motivo** e o **plano de mitigação**.

---

## 6. Roteiro de demonstração

Prepare um script de **5 a 10 minutos** seguindo:

### 6.1 Apresentação inicial (1 min)
- Quem é você, qual o seu papel no projeto, o que entregou.

### 6.2 Demo das tarefas concluídas (5–7 min)
- Para cada CART-XXX concluído:
  1. Abra a tela ou rode o endpoint.
  2. Mostre o **caminho feliz**.
  3. Mostre **um caso de erro** tratado.
  4. Mostre o PR no GitHub e o card no Trello.

### 6.3 Pendências e próximos passos (1–2 min)
- O que ficou pendente.
- O que você sugere como próximo passo.

### 6.4 Perguntas (livre)
- Espaço para a coordenação avaliar.

---

## 7. Pendências e dívidas técnicas

Liste tudo que **ficou aberto** (com honestidade — isso conta a favor):

| Card       | O que falta                                  | Risco / Impacto                    | Sugestão de continuidade           |
| ---------- | -------------------------------------------- | ---------------------------------- | ---------------------------------- |
| CART-005   | Persistência da preferência de tema          | Baixo — funciona, só não persiste  | Salvar em localStorage             |
| —          | Testes automatizados ainda inexistentes      | Médio — refactors são arriscados   | Adotar Vitest no front, Jest no back |
| —          | Logs estruturados em produção                | Médio — debugging difícil          | Adicionar pino + transport ao Render |

---

## 8. Documentação adicional entregue

Marque tudo o que foi atualizado/criado durante o semestre:

- [ ] `README.md`
- [ ] `CONTRIBUTING.md`
- [ ] `CHANGELOG.md`
- [ ] `docs/ARQUITETURA.md`
- [ ] `docs/CONFIG.md`
- [ ] `docs/GUIA-ALUNOS.md`
- [ ] `docs/ROADMAP-V2.md`
- [ ] `docs/adr/*.md`
- [ ] `docs/TUTORIAL-PRIMEIRA-TASK.md`
- [ ] Comentários relevantes no código

---

## 9. Avaliação (a ser preenchida pela coordenação)

| Critério                                         | Peso | Nota | Observações |
| ------------------------------------------------ | ---- | ---- | ----------- |
| Execução das tarefas atribuídas                  | 30%  |      |             |
| Qualidade do código (clareza, padrões, segurança)| 25%  |      |             |
| Processo (Trello, branches, PRs, code review)    | 15%  |      |             |
| Documentação e evidências                        | 15%  |      |             |
| Comunicação e proatividade                       | 10%  |      |             |
| Demonstração final                                | 5%   |      |             |
| **Total**                                        | 100% |      |             |

---

## 10. Lembretes finais

- **Backup antes de migrations** em produção. Sempre.
- **Não comite segredos** (verifique `git diff --cached`).
- **Não force-push em `main`** sob nenhuma hipótese.
- Em caso de dúvida sobre o que entregar, **pergunte à coordenação** antes do prazo final.

---

> © Euler Azevedo & Dioneide Sales — Todos os direitos reservados.
