# Venkern — o que falta no back-end e no front-end

## Front-end já ajustado neste pacote

- Nome do sistema trocado para **Venkern**.
- E-mails mockados trocados para `@venkern.com`.
- Tela nova de **Detalhes do Contato** em `/contatos/:id`.
- Página de detalhes com dados completos, origem, próxima ação, responsável, histórico, tarefas vinculadas e documentos.
- Lista de contatos com botão **Detalhes**.
- Formulário de contato com **origem**, **responsável**, **próxima ação** e **prazo da ação**.
- Histórico de interações mockado por contato.
- Documentos/anexos mockados por contato.
- Arquivos auxiliares de integração criados em `src/app/services/api.ts` e `src/app/services/mappers.ts`.

## O que falta no front-end

### Prioridade alta

- Trocar o `AppContext` mockado por chamadas reais para a API Flask.
- Criar `contactsService.ts`, `teamsService.ts`, `tasksService.ts` e `dashboardService.ts` usando `api.ts`.
- Aplicar os mappers entre campos do front e campos reais do back-end.
- Criar estado global de loading, erro e sucesso por módulo.
- Conectar Dashboard com `/api/dashboard/summary`.
- Conectar Contatos com `/api/contacts`.
- Conectar Equipes com `/api/teams`.
- Conectar Tarefas/Kanban com `/api/tasks` e `/api/tasks/kanban`.

### Prioridade média

- Persistir histórico de interações por contato via API.
- Persistir documentos/anexos por contato via API.
- Adicionar favoritos com `PATCH /api/contacts/{id}/favorite`.
- Melhorar a tela de relatórios com dados reais.
- Criar telas de login, perfil e recuperação de senha.
- Criar controle real de permissões por usuário.

### Prioridade futura

- Drag and drop real no Kanban conectado ao back-end.
- Notificações reais.
- Upload real de arquivos.
- Chat em tempo real com WebSocket.
- Moderação real de imagens/mensagens.

## O que falta no back-end

### Prioridade alta

- Criar migration da tabela `tasks`, porque o model existe, mas a migration não estava no pacote analisado.
- Adicionar campos no contato para acompanhar o front:
  - `origin`
  - `next_action`
  - `next_action_date`
  - `responsible_id`
- Criar módulo de histórico de interações:
  - `ContactInteraction`
  - `GET /api/contacts/{id}/interactions`
  - `POST /api/contacts/{id}/interactions`
  - `DELETE /api/interactions/{id}`
- Criar módulo de documentos/anexos:
  - `ContactDocument`
  - `GET /api/contacts/{id}/documents`
  - `POST /api/contacts/{id}/documents`
  - `DELETE /api/documents/{id}`

### Prioridade média

- Criar autenticação:
  - `User`
  - senha com hash
  - JWT
  - roles: `admin` e `professional`
- Criar módulo de eventos:
  - `Event`
  - `GET /api/events`
  - `POST /api/events`
  - `PUT /api/events/{id}`
  - `DELETE /api/events/{id}`
  - `PATCH /api/events/{id}/send`
- Criar módulo de grupos e mensagens:
  - `Group`
  - `GroupMessage`
  - rotas para listar, criar e enviar mensagens.
- Criar chat privado:
  - `ChatConversation`
  - `PrivateMessage`

### Prioridade futura

- Moderação real:
  - `ModerationAlert`
  - resolver/dispensar alertas.
- Relatórios avançados:
  - contatos por equipe
  - tarefas por status
  - tarefas por prioridade
  - eventos enviados
  - alertas de moderação
- Docker Compose completo com PostgreSQL, API e front.
- Testes automatizados.
- Documentação OpenAPI/Swagger.

## Ordem recomendada

1. Corrigir migration de `tasks`.
2. Adicionar campos operacionais em `contacts`.
3. Criar back-end de interações.
4. Criar back-end de documentos.
5. Conectar Dashboard, Contatos, Equipes e Tarefas no front.
6. Conectar detalhes do contato com interações/documentos reais.
7. Criar login/JWT.
8. Criar eventos, grupos, chat e moderação.
