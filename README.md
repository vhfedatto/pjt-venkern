# Venkern

> Plataforma de gestão de contatos, tarefas, eventos e comunicação para equipes modernas.

Venkern é uma aplicação full-stack que centraliza o CRM, gerenciamento de projetos, comunicação em tempo real e relatórios de uma equipe em uma única interface. Foi construída com Flask no back-end e React no front-end, totalmente containerizada com Docker.

---

## Screenshots

> *(Adicione prints das telas principais aqui)*

| Dashboard | Contatos | Kanban |
|-----------|----------|--------|
| ![dashboard](.github/screenshots/dashboard.png) | ![contacts](.github/screenshots/contacts.png) | ![kanban](.github/screenshots/kanban.png) |

---

## Funcionalidades

- **Autenticação** — Login com JWT, refresh token, fluxo de convite por link
- **Projetos** — Múltiplos projetos por workspace, controle de membros e permissões
- **Contatos** — CRM com filtros, favoritos, histórico de interações e documentos
- **Times** — Agrupamento de contatos por equipe com indicadores visuais
- **Tarefas (Kanban)** — Boards com drag-and-drop, prioridades, datas de vencimento e tags
- **Eventos** — Agenda de eventos com status (agendado / concluído)
- **Chat em tempo real** — Mensagens privadas e grupos via WebSocket (Socket.IO)
- **Moderação** — Alertas de conteúdo com triagem (pendente / resolvido / descartado)
- **Relatórios** — Gráficos de tarefas, contatos, atividade e resumo geral
- **Dashboard** — Visão geral com métricas e atividade recente
- **Seed de dados** — Dados de demonstração prontos para uso

---

## Stack Tecnológica

### Back-end
| Tecnologia | Versão | Uso |
|---|---|---|
| Python | 3.12 | Runtime |
| Flask | 3.x | Framework web |
| SQLAlchemy 2 | 2.x | ORM |
| Flask-Migrate | — | Migrações de banco |
| Flask-JWT-Extended | — | Autenticação JWT |
| Flask-SocketIO | 5.x | WebSocket / chat |
| Eventlet | 0.38 | Worker assíncrono |
| Gunicorn | — | Servidor WSGI |
| PostgreSQL | 16 | Banco de dados |

### Front-end
| Tecnologia | Versão | Uso |
|---|---|---|
| React | 18 | UI |
| TypeScript | 5 | Tipagem |
| Vite | 6 | Build tool |
| TailwindCSS | 3 | Estilização |
| React Router | 7 | Roteamento |
| Recharts | — | Gráficos |
| Lucide React | — | Ícones |
| Motion/React | — | Animações |
| Sonner | — | Notificações toast |

### Infra
| Tecnologia | Uso |
|---|---|
| Docker + Docker Compose | Containerização |
| Nginx | Servidor do front-end |
| Volumes Docker | Persistência do banco e uploads |

---

## Arquitetura

```
Cliente (Browser)
    |
    ├── [80]  Nginx  ──► React SPA (Vite build)
    |              ──► /api/*  proxy para Flask
    |
    ├── [5000] Flask (Gunicorn + Eventlet)
    |              ├── REST API  (/api/...)
    |              └── WebSocket (/socket.io/...)
    |
    └── [5432] PostgreSQL 16
```

Todos os serviços comunicam-se na rede interna `app-network` do Docker. O front-end nunca acessa o banco diretamente.

---

## Estrutura de Pastas

```
.
├── backend/
│   ├── app/
│   │   ├── auth/           # Autenticação e usuários
│   │   ├── chats/          # Chat privado (WebSocket)
│   │   ├── contacts/       # CRM de contatos
│   │   ├── contact_documents/
│   │   ├── contact_interactions/
│   │   ├── dashboard/      # Métricas
│   │   ├── events/         # Agenda
│   │   ├── groups/         # Grupos e mensagens
│   │   ├── moderation/     # Alertas de moderação
│   │   ├── projects/       # Projetos e membros
│   │   ├── reports/        # Relatórios
│   │   ├── tasks/          # Tarefas (Kanban)
│   │   └── teams/          # Times
│   ├── migrations/         # Alembic
│   ├── seed.py             # Dados de demonstração
│   ├── run.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── pages/      # Páginas da aplicação
│   │   │   ├── components/ # Componentes reutilizáveis
│   │   │   ├── services/   # Clientes de API
│   │   │   ├── context/    # Estado global (Auth, Project)
│   │   │   ├── hooks/      # Custom hooks
│   │   │   └── types/      # Tipos TypeScript
│   │   └── styles/
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## Como Rodar com Docker

### Pré-requisitos
- [Docker](https://www.docker.com/) 24+
- [Docker Compose](https://docs.docker.com/compose/) v2+

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/venkern.git
cd venkern
```

### 2. Configure as variáveis de ambiente (opcional)
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```
> As configurações padrão funcionam para rodar localmente sem nenhuma alteração.

### 3. Suba os containers
```bash
docker compose up --build
```

### 4. Acesse a aplicação
| Serviço | URL |
|---|---|
| Front-end | http://localhost |
| API REST | http://localhost:5000/api |

### 5. Popule com dados de demonstração (opcional)
```bash
docker compose exec backend python seed.py
```

---

## Como Rodar Manualmente (Sem Docker)

### Back-end

**Pré-requisitos:** Python 3.12+, PostgreSQL 16

```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt

# Configure o banco no .env
cp .env.example .env
# Edite DATABASE_URL para apontar para seu PostgreSQL local

flask db upgrade
python run.py
```

### Front-end

**Pré-requisitos:** Node.js 20+

```bash
cd frontend
npm install

# Configure a URL da API
cp .env.example .env
# Edite VITE_API_URL=http://localhost:5000/api

npm run dev
```

Acesse: http://localhost:5173

---

## Variáveis de Ambiente

### Back-end (`backend/.env`)

| Variável | Padrão | Descrição |
|---|---|---|
| `FLASK_APP` | `run.py` | Entry point do Flask |
| `FLASK_ENV` | `production` | Modo de execução |
| `DATABASE_URL` | `postgresql://venkern:venkern123@db:5432/venkern` | String de conexão ao banco |
| `SECRET_KEY` | *(obrigatório em prod)* | Chave secreta do Flask |
| `JWT_SECRET_KEY` | *(obrigatório em prod)* | Chave de assinatura dos JWTs |
| `CORS_ORIGINS` | `http://localhost` | Origens permitidas pelo CORS |
| `UPLOAD_FOLDER` | `uploads` | Pasta de uploads |
| `SEED_DB` | `false` | Se `true`, executa seed.py no startup |

### Front-end (`frontend/.env`)

| Variável | Padrão | Descrição |
|---|---|---|
| `VITE_API_URL` | `http://localhost:5000/api` | URL base da API REST |
| `VITE_WS_URL` | `http://localhost:5000` | URL do servidor WebSocket |

---

## Usuários de Teste

Após executar o seed, os seguintes usuários estão disponíveis:

| E-mail | Senha | Papel |
|---|---|---|
| `super@venkern.com` | `12345678` | Super Admin |
| `admin@venkern.com` | `12345678` | Admin |
| `pro@venkern.com` | `12345678` | Profissional |

---

## Rotas Principais da API

### Autenticação
| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/auth/login` | Login |
| `POST` | `/api/auth/register` | Registro |
| `POST` | `/api/auth/logout` | Logout |
| `GET` | `/api/auth/me` | Usuário autenticado |

### Projetos
| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/projects` | Listar projetos do usuário |
| `POST` | `/api/projects` | Criar projeto |
| `GET` | `/api/projects/:slug` | Detalhes do projeto |
| `POST` | `/api/projects/:slug/invite` | Convidar membro |

### Recursos do Projeto (prefixo `/api/projects/:slug`)
| Método | Rota | Descrição |
|---|---|---|
| `GET/POST` | `/contacts` | Contatos |
| `GET/POST` | `/tasks` | Tarefas |
| `GET/POST` | `/events` | Eventos |
| `GET/POST` | `/teams` | Times |
| `GET/POST` | `/groups` | Grupos |
| `GET` | `/chats` | Conversas privadas |
| `GET` | `/reports/summary` | Resumo geral |
| `GET` | `/reports/tasks` | Relatório de tarefas |
| `GET` | `/reports/contacts` | Relatório de contatos |
| `GET` | `/reports/activity` | Atividade recente |
| `GET` | `/dashboard` | Dados do dashboard |
| `GET/POST` | `/moderation/alerts` | Alertas de moderação |

---

## Regras de Permissão

| Papel | Permissões |
|---|---|
| **Super Admin** | Acesso total a todos os projetos e configurações globais |
| **Admin** | Gerencia membros, times, contatos e todos os recursos do projeto |
| **Profissional** | Visualiza e edita recursos; não pode excluir projetos ou gerenciar membros |

O controle de acesso é aplicado via JWT em todas as rotas (`before_request` global) e validado por decorators nas rotas sensíveis.

---

## Fluxo de Convite

1. Admin gera um link de convite em `/api/projects/:slug/invite`
2. O link contém um token JWT com prazo de expiração
3. O convidado acessa a URL e é direcionado para `/invite/accept?token=...`
4. O sistema valida o token, cria (ou associa) o usuário e o adiciona ao projeto com o papel definido

---

## Fluxo de Chat

1. Front-end conecta ao Socket.IO em `/socket.io/`
2. Ao abrir uma conversa, entra na sala `conversation:<id>`
3. Mensagens enviadas via evento `send_message` são persistidas no banco e retransmitidas para todos os participantes da sala em tempo real
4. Grupos seguem o mesmo padrão com sala `group:<id>`

---

## Fluxo de Projetos

1. Usuário cria um projeto (se torna `owner`)
2. Convida membros com papel `ADMIN` ou `PROFESSIONAL`
3. O `slug` do projeto é usado em todas as rotas da API
4. O front-end armazena o projeto ativo no `ProjectContext` e o inclui em todas as requisições

---

## Comandos Úteis

```bash
# Ver logs em tempo real
docker compose logs -f

# Acessar o shell do back-end
docker compose exec backend bash

# Rodar migrações manualmente
docker compose exec backend flask db upgrade

# Gerar nova migração
docker compose exec backend flask db migrate -m "descricao"

# Resetar dados do seed
docker compose exec backend python seed.py --reset

# Parar e remover volumes (limpa o banco)
docker compose down -v
```

---

## Roadmap

- [ ] Autenticação OAuth (Google / GitHub)
- [ ] Notificações push (PWA)
- [ ] Exportação de relatórios em PDF/CSV
- [ ] Webhooks para integrações externas
- [ ] Aplicativo mobile (React Native)
- [ ] Testes automatizados (pytest + Playwright)
- [ ] CI/CD com GitHub Actions

---

## Licença

MIT © 2024 Venkern. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
