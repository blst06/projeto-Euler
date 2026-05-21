# Cartivore — Roadmap v2.0
## Demandas para Estagiários (Jira Backlog)

> **Projeto acadêmico** — Estágio supervisionado  
> **Responsável:** Euler Azevedo & Dioneide Sales  
> **Objetivo:** Evoluir o sistema da v1.0 (Beta) para a v2.0 com todas as features planejadas

---

## Como usar este documento

Cada item abaixo deve ser cadastrado como uma **tarefa no Jira** com:
- **Epic** correspondente
- **Estimativa de horas** (indicada)
- **Nível de complexidade**: 🟢 Fácil | 🟡 Médio | 🔴 Difícil
- **Pré-requisitos** (se houver)

---

## EPIC 1 — Mapa Interativo de Clientes

> Módulo 8 da proposta original. Alto valor visual e comercial.

### CART-001 — Integração do mapa com Leaflet.js
**Complexidade:** 🟡 Médio | **Estimativa:** 8h

**Descrição:**  
Substituir a tela de "Mapa" atual (que exibe distribuição por cidade) por um mapa interativo usando a biblioteca Leaflet.js com tiles do OpenStreetMap (gratuito, sem chave de API).

**Critérios de aceite:**
- [ ] Mapa carregado na rota `/mapa`
- [ ] Pins no mapa para cada cliente com `lat` e `lng` cadastrados
- [ ] Cor do pin baseada no status: verde (adimplente), amarelo (risco), vermelho (inadimplente), cinza (bloqueado)
- [ ] Click no pin abre um popup com: nome do cliente, segmento, status e limite de crédito

**Bibliotecas sugeridas:** `leaflet`, `react-leaflet`  
**Referência:** https://react-leaflet.js.org/

---

### CART-002 — Geocodificação de Endereços
**Complexidade:** 🟡 Médio | **Estimativa:** 6h  
**Pré-requisito:** CART-001

**Descrição:**  
Ao cadastrar/editar um cliente, converter automaticamente o endereço (rua, cidade, estado) em coordenadas geográficas (lat/lng) e salvar no banco.

**Critérios de aceite:**
- [ ] No formulário de cadastro de cliente, ao preencher o CEP e clicar em "Buscar endereço", a API ViaCEP preenche rua, cidade e estado
- [ ] Ao salvar, o endereço é geocodificado via Nominatim (OpenStreetMap — gratuito)
- [ ] Lat/lng são salvos nos campos `lat` e `lng` do cliente
- [ ] Em caso de falha na geocodificação, o cadastro segue normalmente (sem lat/lng)

**API gratuita para geocodificação:** https://nominatim.openstreetmap.org/  
**API de CEP:** https://viacep.com.br/

---

### CART-003 — Filtros e Agrupamento no Mapa
**Complexidade:** 🟡 Médio | **Estimativa:** 5h  
**Pré-requisito:** CART-001

**Descrição:**  
Adicionar controles ao mapa para filtrar quais clientes são exibidos.

**Critérios de aceite:**
- [ ] Filtro por status (adimplente, risco, inadimplente, bloqueado)
- [ ] Filtro por segmento (mercado, açougue, restaurante, etc.)
- [ ] Agrupamento de pins próximos (clustering) quando há muitos clientes na mesma região
- [ ] Contador de clientes visíveis no mapa

**Biblioteca para clustering:** `leaflet.markercluster`

---

## EPIC 2 — Histórico de Relacionamento

> Registro de interações com clientes (visitas, ligações, negociações)

### CART-004 — Interface de Histórico por Cliente
**Complexidade:** 🟢 Fácil | **Estimativa:** 6h

**Descrição:**  
Criar uma tela dedicada ao histórico de um cliente específico, acessível ao clicar em um cliente na lista.

**Critérios de aceite:**
- [ ] Rota `/clientes/:id` com a página de detalhes do cliente
- [ ] Seção "Histórico de Relacionamento" com timeline vertical
- [ ] Cada entrada mostra: tipo de contato (ícone), data, usuário responsável e descrição
- [ ] Formulário para adicionar nova entrada (tipo + data + texto)
- [ ] Tipos disponíveis: Visita, Ligação, E-mail, Negociação, Outros

---

### CART-005 — Página de Detalhes do Cliente
**Complexidade:** 🟡 Médio | **Estimativa:** 8h  
**Pré-requisito:** CART-004

**Descrição:**  
Criar uma página completa de detalhes do cliente com todas as informações consolidadas.

**Critérios de aceite:**
- [ ] Header com nome, status, segmento e botões de ação (editar, bloquear)
- [ ] Card de crédito: limite, utilizado, disponível (barra de progresso)
- [ ] Tab "Vendas": lista das vendas do cliente com status e valores
- [ ] Tab "Histórico": timeline de relacionamento (CART-004)
- [ ] Tab "Pagamentos": pagamentos registrados
- [ ] Botão "Exportar ficha" — gera PDF com dados do cliente

---

## EPIC 3 — Gestão de Pagamentos

### CART-006 — Interface de Registro de Pagamentos
**Complexidade:** 🟢 Fácil | **Estimativa:** 5h

**Descrição:**  
Criar a interface visual de registro de pagamentos (a rota backend `/api/pagamentos` já existe).

**Critérios de aceite:**
- [ ] Na tela de Vendas, ao clicar em uma venda pendente, abrir modal "Registrar Pagamento"
- [ ] Campos: valor pago, data do pagamento, forma de pagamento (Dinheiro/Pix/Boleto/Cartão), observações
- [ ] Ao registrar pagamento suficiente, a venda muda automaticamente para "Pago"
- [ ] Lista de pagamentos parciais visível na tela

---

### CART-007 — Alerta de Vencimento
**Complexidade:** 🟢 Fácil | **Estimativa:** 4h

**Descrição:**  
Exibir alertas visuais no dashboard sobre vendas que vencem nos próximos dias.

**Critérios de aceite:**
- [ ] Banner no dashboard: "X vendas vencem em 3 dias"
- [ ] Card no dashboard listando os clientes com vencimentos próximos (próximos 7 dias)
- [ ] Badge no ícone da sidebar de "Financeiro" quando há vencimentos críticos
- [ ] Vendas com vencimento = hoje destacadas em laranja

---

## EPIC 4 — Segurança Avançada

> Módulo 7 da proposta — classificado como "pode virar módulo avançado para alunos"

### CART-008 — Log de Auditoria (Interface)
**Complexidade:** 🟡 Médio | **Estimativa:** 6h

**Descrição:**  
A tabela `audit_log` já existe e é preenchida pelo backend. Criar a interface de visualização.

**Critérios de aceite:**
- [ ] Rota `/auditoria` (apenas admin)
- [ ] Tabela com: data/hora, usuário, ação, entidade afetada, IP
- [ ] Filtros por usuário, tipo de ação e período (data inicial/final)
- [ ] Exportação do log em CSV

---

### CART-009 — Troca de Senha e Gerenciamento de Perfil
**Complexidade:** 🟢 Fácil | **Estimativa:** 4h

**Descrição:**  
Permitir que o usuário logado altere sua própria senha e dados de perfil.

**Critérios de aceite:**
- [ ] Ícone/menu de perfil no sidebar
- [ ] Modal com campos: Nome, E-mail (readonly), Senha atual, Nova senha, Confirmar nova senha
- [ ] Validação: nova senha mínimo 8 caracteres, deve ser diferente da atual
- [ ] Backend: rota `PUT /api/auth/profile` com verificação da senha atual

---

### CART-010 — Controle de Sessão Persistente
**Complexidade:** 🔴 Difícil | **Estimativa:** 10h

**Descrição:**  
Atualmente, o token JWT é perdido ao recarregar a página. Implementar persistência segura de sessão com refresh token.

**Critérios de aceite:**
- [ ] Token de acesso (15min) + Refresh token (7 dias) armazenados em httpOnly cookie
- [ ] Refresh automático do access token antes de expirar
- [ ] Logout invalida ambos os tokens
- [ ] Backend: nova tabela `refresh_tokens` e rotas `/api/auth/refresh` e `/api/auth/logout`
- [ ] Frontend: interceptor na `queryClient` para renovar token em 401

---

## EPIC 5 — Exportação Avançada

### CART-011 — Exportação em Excel (.xlsx)
**Complexidade:** 🟡 Médio | **Estimativa:** 6h

**Descrição:**  
Adicionar exportação em formato Excel com formatação profissional.

**Critérios de aceite:**
- [ ] Botão "Exportar Excel" na tela de Relatórios
- [ ] Arquivo `.xlsx` com abas: "Clientes", "Vendas", "Inadimplentes"
- [ ] Cabeçalhos com cor de fundo (azul petróleo) e texto branco
- [ ] Células de status coloridas (verde/amarelo/vermelho)
- [ ] Auto-ajuste da largura das colunas

**Biblioteca:** `xlsx` (já instalada no projeto)

---

### CART-012 — Exportação em PDF (Relatório Gerencial)
**Complexidade:** 🔴 Difícil | **Estimativa:** 12h

**Descrição:**  
Gerar um relatório PDF gerencial completo com gráficos e análise da carteira.

**Critérios de aceite:**
- [ ] Capa com logo Cartivore, nome da empresa, data e responsável
- [ ] Seção de KPIs com números em destaque
- [ ] Gráfico de distribuição de status (pode ser uma tabela formatada)
- [ ] Ranking top 10 clientes por limite de crédito
- [ ] Lista de inadimplentes com valor em aberto
- [ ] Rodapé com assinatura e gerado em

**Bibliotecas:** `jspdf`, `jspdf-autotable`

---

## EPIC 6 — Notificações

### CART-013 — Notificações por E-mail (Vencimentos)
**Complexidade:** 🔴 Difícil | **Estimativa:** 14h

**Descrição:**  
Enviar e-mails automáticos para o administrador quando há vendas vencendo ou clientes tornando-se inadimplentes.

**Critérios de aceite:**
- [ ] Cron job no backend (executa 1x ao dia às 8h)
- [ ] E-mail "Resumo diário": lista de vendas que vencem hoje e amanhã
- [ ] E-mail "Alerta de inadimplência": clientes que ficaram inadimplentes no dia
- [ ] Templates HTML profissionais para os e-mails
- [ ] Configuração via painel admin: ativar/desativar notificações + e-mail do destinatário

**Serviço de e-mail sugerido:** Resend (https://resend.com — plano gratuito)

---

## EPIC 7 — UX e Interface

### CART-014 — Dark Mode Melhorado
**Complexidade:** 🟢 Fácil | **Estimativa:** 3h

**Descrição:**  
Ajustes finos no dark mode para garantir contraste adequado em todos os componentes.

**Critérios de aceite:**
- [ ] Revisar todos os `Badge`, `Card`, `Table` em dark mode
- [ ] Garantir contraste WCAG AA em todos os textos
- [ ] Testar em tela com brilho baixo

---

### CART-015 — Responsividade Mobile Avançada
**Complexidade:** 🟡 Médio | **Estimativa:** 8h

**Descrição:**  
Otimizar a experiência em smartphones (telas de 375px a 430px).

**Critérios de aceite:**
- [ ] Formulários de cadastro em tela cheia (drawer) em mobile
- [ ] Tabelas com scroll horizontal ou cards adaptados
- [ ] Botões de ação com tamanho mínimo de 44px (toque fácil)
- [ ] Dashboard em coluna única em mobile
- [ ] Testar em iPhone SE (375px) e Samsung Galaxy (412px)

---

### CART-016 — Onboarding do Usuário
**Complexidade:** 🟡 Médio | **Estimativa:** 6h

**Descrição:**  
Tutorial interativo para novos usuários que acessam o sistema pela primeira vez.

**Critérios de aceite:**
- [ ] Modal de boas-vindas no primeiro acesso
- [ ] Tour guiado por 5 passos: Dashboard → Clientes → Vendas → Financeiro → Exportação
- [ ] Checklist de configuração inicial: "Cadastre seu primeiro cliente"
- [ ] Botão para pular o tutorial
- [ ] Flag no backend para não mostrar o tutorial novamente

---

## Estimativa Total v2.0

| Epic                      | Tasks | Horas estimadas |
|---------------------------|-------|-----------------|
| Mapa Interativo           | 3     | 19h             |
| Histórico de Relacionamento | 2   | 14h             |
| Gestão de Pagamentos      | 2     | 9h              |
| Segurança Avançada        | 3     | 20h             |
| Exportação Avançada       | 2     | 18h             |
| Notificações              | 1     | 14h             |
| UX e Interface            | 3     | 17h             |
| **TOTAL**                 | **16** | **~111h**      |

---

## Critérios de Qualidade para Entrega

Cada feature entregue pelos estagiários deve:

1. **Ter testes manuais** documentados (cenário de teste, resultado esperado, resultado obtido)
2. **Seguir o padrão visual** do sistema (paleta, tipografia, componentes shadcn)
3. **Não quebrar** nenhuma funcionalidade existente
4. **Ter código revisado** por pelo menos 1 colega (Pull Request)
5. **Estar documentada** no `CONTRIBUTING.md` se introduzir nova convenção

---

## Sugestão de Artigo Científico

Após a conclusão do projeto, os dados e experiência podem embasar um artigo para publicação:

**Título sugerido:**  
*"Cartivore: Desenvolvimento de um Sistema de Gestão Estratégica de Carteira de Clientes para Representantes Comerciais usando Tecnologias Web Modernas"*

**Seções sugeridas:**
1. Introdução — problema da dependência de dados na representação comercial
2. Referencial Teórico — portabilidade de dados, LGPD, CRM para PMEs
3. Metodologia — processo de desenvolvimento, stack tecnológica, regras de negócio
4. Resultados — funcionalidades implementadas, feedback dos usuários
5. Conclusão — impacto prático, trabalhos futuros

**Revistas sugeridas:**
- RISTI — Revista Ibérica de Sistemas e Tecnologias de Informação
- REIC — Revista Eletrônica de Iniciação Científica em Computação

---

*Cartivore v2.0 — Documento de Roadmap*  
*Última atualização: 2024*  
*Autores: Euler Azevedo & Dioneide Sales*
