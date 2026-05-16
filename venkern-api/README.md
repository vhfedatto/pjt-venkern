# Venkern API 🚀

## 1. Introdução

O **Venkern** é um projeto acadêmico que simula uma plataforma de organização de times, contatos e tarefas.  
Esta API é o backend do sistema. Em outras palavras: ela é a parte responsável por **guardar os dados**, **organizar regras de negócio** e **entregar informações para o front-end**.

Hoje a API já permite:

- cadastrar contatos
- organizar contatos em equipes
- criar tarefas
- montar um quadro Kanban
- mostrar um resumo geral no dashboard

O foco deste backend é servir como um **MVP**.  
MVP significa **Minimum Viable Product**, ou seja, uma primeira versão funcional do produto, simples, objetiva e pronta para validar a ideia.

### Por que Flask foi escolhido?

O Flask foi uma boa escolha para este momento do projeto porque ele:

- é leve
- é simples de aprender
- permite crescer por módulos
- funciona muito bem para APIs pequenas e médias
- ajuda a equipe a evoluir rápido sem excesso de complexidade

Para um projeto acadêmico e um MVP, isso faz bastante sentido.

---

## 2. Tecnologias utilizadas 🧰

### Flask
Framework web em Python.  
É ele que recebe as requisições HTTP, como `GET`, `POST`, `PUT`, `PATCH` e `DELETE`, e devolve respostas em JSON.

### PostgreSQL
Banco de dados relacional.  
É onde ficam salvos os registros de:

- contatos
- equipes
- tarefas

### SQLAlchemy
Ferramenta que faz a ponte entre Python e banco de dados.  
Com ele, você trabalha com classes Python em vez de escrever SQL o tempo todo.

Exemplo de ideia:

- classe `Contact` representa a tabela `contacts`
- classe `Team` representa a tabela `teams`
- classe `Task` representa a tabela `tasks`

### Flask-Migrate
Ferramenta usada para versionar mudanças no banco.  
Quando você altera um model, normalmente precisa gerar uma **migration** para atualizar a estrutura do banco sem apagar tudo.

### CORS
Permite que o front-end rode em outra porta ou outro domínio e ainda consiga acessar a API.  
Isso é muito comum quando temos:

- front-end em React/Vite
- backend em Flask

### APIdog / Postman
Ferramentas para testar endpoints manualmente.  
Você envia requisições e vê as respostas da API sem precisar depender do front-end.

---

## 3. Estrutura de pastas 🗂️

Estrutura principal do backend:

```text
venkern-api/
├─ app/
│  ├─ contacts/
│  ├─ teams/
│  ├─ tasks/
│  ├─ dashboard/
│  ├─ utils/
│  ├─ __init__.py
│  ├─ config.py
│  └─ extensions.py
├─ migrations/
├─ .env
├─ requirements.txt
├─ run.py
└─ seed.py
```

### O que cada pasta faz?

### `app/`
É a pasta principal da aplicação.  
Tudo que faz parte da API fica aqui dentro.

### `app/contacts/`
Módulo responsável pelos contatos.

### `app/teams/`
Módulo responsável pelas equipes.

### `app/tasks/`
Módulo responsável pelas tarefas e pelo Kanban.

### `app/dashboard/`
Módulo responsável pelo resumo do dashboard.

### `app/utils/`
Guarda funções reutilizáveis, como:

- respostas padronizadas
- validações simples

### `migrations/`
Pasta criada pelo Flask-Migrate para controlar as versões do banco.

### `seed.py`
Script para popular o banco com dados de demonstração.

### `run.py`
Arquivo usado para iniciar a API.

---

## 4. O papel de `routes.py`, `models.py` e `services.py`

### `models.py`
Define a estrutura dos dados no banco.

Exemplo:

- `Contact`
- `Team`
- `Task`

Se você quiser saber quais campos existem em cada entidade, normalmente começa olhando o `models.py`.

### `routes.py`
Define os endpoints da API.

Exemplo:

- `GET /api/contacts`
- `POST /api/tasks`
- `GET /api/dashboard/summary`

Se você quiser saber o que a API expõe para o front-end, normalmente olha o `routes.py`.

### `services.py`
Guarda regras auxiliares que não precisam ficar direto nas rotas.

No módulo de tasks, por exemplo, ele ajuda em:

- validações
- filtros
- tratamento de dados

Isso ajuda a evitar código repetido.

---

## 5. Como instalar o projeto 💻

### Passo 1. Entrar na pasta do backend

```powershell
cd venkern-api
```

### Passo 2. Criar o ambiente virtual

No Windows:

```powershell
python -m venv venv
```

### Passo 3. Ativar o ambiente virtual

No PowerShell:

```powershell
.\venv\Scripts\Activate.ps1
```

No Prompt de Comando:

```cmd
venv\Scripts\activate
```

### Passo 4. Instalar as dependências

```powershell
pip install -r requirements.txt
```

### Passo 5. Configurar o arquivo `.env`

Crie ou ajuste o arquivo `.env` com algo parecido com:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/venkern_db
FLASK_APP=run.py
FLASK_ENV=development
```

---

## 6. Como instalar o PostgreSQL 🐘

Se você ainda não tem PostgreSQL instalado:

1. baixe o PostgreSQL no site oficial
2. instale normalmente
3. anote:
   - usuário
   - senha
   - porta
4. crie o banco que será usado pela aplicação

Durante o desenvolvimento local, o mais comum é usar:

- host: `localhost`
- porta: `5432`

### Alternativa: rodar PostgreSQL com Docker

Se você não quiser instalar o PostgreSQL diretamente no sistema, pode rodar o banco em um container Docker.  
Essa opção costuma ser muito útil porque:

- evita instalar o banco manualmente
- deixa o ambiente mais isolado
- facilita apagar e recriar o banco
- ajuda toda a equipe a usar uma configuração parecida

### O que você precisa ter instalado

Antes de usar essa opção, instale:

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

Depois, abra o Docker Desktop e verifique se ele está em execução.

### Comando para subir o PostgreSQL no Docker

Você pode usar este comando:

```powershell
docker run --name venkern-postgres `
  -e POSTGRES_USER=postgres `
  -e POSTGRES_PASSWORD=postgres `
  -e POSTGRES_DB=venkern_db `
  -p 5432:5432 `
  -d postgres:16
```

### O que esse comando faz?

- cria um container chamado `venkern-postgres`
- define o usuário como `postgres`
- define a senha como `postgres`
- cria o banco `venkern_db`
- libera a porta `5432`
- roda o PostgreSQL em segundo plano

### Como verificar se o container está rodando

```powershell
docker ps
```

Se tudo estiver certo, você verá o container `venkern-postgres` na lista.

### Como parar o container

```powershell
docker stop venkern-postgres
```

### Como iniciar novamente depois

```powershell
docker start venkern-postgres
```

### Como remover o container

Se você quiser apagar completamente esse banco de teste:

```powershell
docker rm -f venkern-postgres
```

### Como fica a `DATABASE_URL` usando Docker?

Se você usar exatamente o comando acima, a sua configuração no `.env` pode continuar assim:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/venkern_db
```

Isso funciona porque a porta do container foi conectada com a porta `5432` da sua máquina.

### Como visualizar o banco que está no Docker

Mesmo usando Docker, você ainda pode abrir o banco em ferramentas visuais como:

- pgAdmin
- DBeaver
- TablePlus
- Azure Data Studio

Na prática, a conexão será a mesma:

- host: `localhost`
- porta: `5432`
- usuário: `postgres`
- senha: `postgres`
- banco: `venkern_db`

### Observação importante

Se a porta `5432` já estiver ocupada por outro PostgreSQL instalado localmente, o container pode falhar ao iniciar.  
Nesse caso, você pode trocar a porta do lado esquerdo do mapeamento.

Exemplo:

```powershell
docker run --name venkern-postgres `
  -e POSTGRES_USER=postgres `
  -e POSTGRES_PASSWORD=postgres `
  -e POSTGRES_DB=venkern_db `
  -p 5433:5432 `
  -d postgres:16
```

E aí a `DATABASE_URL` ficaria:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/venkern_db
```

---

## 7. Como criar o banco

Você pode criar e abrir o banco de duas formas bem amigáveis:

- **DBeaver**
- **Visual Studio Code com extensão MSSQL**

Hoje, entre Azure Data Studio e VS Code, vale mais a pena ensinar **VS Code**.  
Motivo: a Microsoft aposentou o Azure Data Studio em **28 de fevereiro de 2026** e recomenda usar o **Visual Studio Code com a extensão MSSQL** para trabalho contínuo.

### Opção 1. Criar o banco pelo DBeaver

O DBeaver é uma das opções mais fáceis para iniciantes porque ele mostra tudo visualmente.

#### Passo a passo

1. abra o DBeaver
2. clique em **New Database Connection**
3. escolha **PostgreSQL**
4. preencha os dados da conexão:

- Host: `localhost`
- Port: `5432`
- Database: `postgres`
- Username: `postgres`
- Password: `postgres`

5. clique em **Test Connection**
6. se der certo, clique em **Finish**
7. abra o editor SQL dentro do DBeaver
8. rode este comando:

Exemplo em SQL:

```sql
CREATE DATABASE venkern_db;
```

Depois disso, o banco `venkern_db` estará criado.

### Opção 2. Criar o banco pelo VS Code com MSSQL

Se você já usa VS Code no dia a dia, essa opção é muito boa porque mantém tudo no mesmo lugar.

#### O que instalar

No VS Code, instale:

- extensão **PostgreSQL** para navegação visual do banco
- ou a extensão **MSSQL**, se você também quiser seguir a recomendação da Microsoft para o ecossistema SQL

Como este projeto usa **PostgreSQL**, para navegar nas tabelas do banco do Venkern a experiência mais direta costuma ser com uma extensão de PostgreSQL no VS Code.

#### Passo a passo

1. abra o VS Code
2. vá até a aba de extensões
3. instale uma extensão de PostgreSQL
4. abra a extensão e crie uma nova conexão
5. preencha:

- Host: `localhost`
- Port: `5432`
- User: `postgres`
- Password: `postgres`
- Database: `postgres`

6. conecte ao servidor
7. abra um editor SQL pela própria extensão
8. execute:

```sql
CREATE DATABASE venkern_db;
```

Se você tiver subido o PostgreSQL via Docker, os dados da conexão continuam os mesmos, a menos que você tenha trocado a porta.

### Depois de criar o banco

Depois disso, configure a `DATABASE_URL` no `.env`.

Exemplo:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/venkern_db
```

### O que significa essa URL?

Ela segue esta ideia:

```text
postgresql://USUARIO:SENHA@HOST:PORTA/NOME_DO_BANCO
```

Exemplo:

- usuário: `postgres`
- senha: `postgres`
- host: `localhost`
- porta: `5432`
- banco: `venkern_db`

---

## 8. Como rodar migrations 🧱

### O que é uma migration?

Uma **migration** é uma forma organizada de atualizar o banco quando os models mudam.

Exemplo:

- você adiciona um campo novo no model
- o banco ainda não sabe disso
- a migration registra essa mudança

Assim, a estrutura do banco acompanha a evolução do código.

### Comandos principais

Se for a primeira vez:

```powershell
flask --app run.py db init
```

Para gerar uma nova migration:

```powershell
flask --app run.py db migrate -m "mensagem da migration"
```

Para aplicar a migration no banco:

```powershell
flask --app run.py db upgrade
```

### Fluxo simples

1. alterar model
2. rodar `db migrate`
3. rodar `db upgrade`

### Importante

Se você **não alterou model**, normalmente **não precisa criar migration**.

---

## 9. Como rodar a API ▶️

Você pode rodar de duas formas.

### Opção 1. Usando Flask

```powershell
flask --app run.py run
```

### Opção 2. Usando Python diretamente

```powershell
python run.py
```

Se tudo estiver certo, a API ficará disponível em algo como:

```text
http://127.0.0.1:5000
```

---

## 10. Como popular o banco com dados de exemplo 🌱

O projeto já possui um script de seed:

```powershell
python seed.py
```

### O que o seed faz?

Ele:

- apaga dados antigos de `tasks`
- apaga dados antigos de `contacts`
- apaga dados antigos de `teams`
- recria dados de demonstração

### O que será criado?

- 4 equipes
- 8 contatos
- 15 tasks

### Exemplo de saída esperada

```text
Seed concluído:
- 4 equipes criadas
- 8 contatos criados
- 15 tasks criadas
```

---

## 11. Como testar no APIdog ou Postman 🧪

### Métodos HTTP mais usados

### `GET`
Usado para buscar dados.

### `POST`
Usado para criar dados.

### `PUT`
Usado para atualizar um registro inteiro ou quase inteiro.

### `PATCH`
Usado para atualizar apenas parte do dado.

### `DELETE`
Usado para remover dados.

---

## 12. Exemplos reais de endpoints

### Criar contato

**POST** `/api/contacts`

Exemplo de body:

```json
{
  "full_name": "Maria Silva",
  "phone": "+55 11 99999-0001",
  "email": "maria.silva@venkern.dev",
  "role": "Product Manager",
  "function_type": "Product",
  "notes": "Contato importante para alinhamento de produto.",
  "is_favorite": true,
  "team_id": 1
}
```

### Listar contatos

**GET** `/api/contacts`

### Buscar contatos favoritos

**GET** `/api/contacts?favorite=true`

### Buscar contatos por texto

**GET** `/api/contacts?search=maria`

---

### Criar equipe

**POST** `/api/teams`

```json
{
  "name": "Suporte",
  "description": "Equipe responsável por atendimento",
  "color": "#0EA5E9"
}
```

### Listar equipes

**GET** `/api/teams`

---

### Criar task

**POST** `/api/tasks`

```json
{
  "title": "Implementar tela de login",
  "description": "Criar a primeira versão da tela de login do sistema.",
  "status": "todo",
  "priority": "high",
  "due_date": "2026-06-10T18:00:00+00:00",
  "assignee_id": 1,
  "team_id": 1
}
```

### Listar tasks

**GET** `/api/tasks`

### Filtrar tasks

**GET** `/api/tasks?status=todo`

**GET** `/api/tasks?priority=high`

**GET** `/api/tasks?team_id=1`

**GET** `/api/tasks?assignee_id=2`

**GET** `/api/tasks?search=login`

### Alterar status da task

**PATCH** `/api/tasks/1/status`

```json
{
  "status": "in_progress"
}
```

### Kanban

**GET** `/api/tasks/kanban`

Exemplo de resposta:

```json
{
  "todo": [],
  "in_progress": [],
  "review": [],
  "done": [],
  "late": []
}
```

### Dashboard summary

**GET** `/api/dashboard/summary`

Exemplo de resposta:

```json
{
  "total_contacts": 8,
  "favorite_contacts": 4,
  "total_teams": 4,
  "total_tasks": 15,
  "todo_tasks": 3,
  "in_progress_tasks": 3,
  "review_tasks": 3,
  "done_tasks": 3,
  "late_tasks": 3,
  "high_priority_tasks": 4,
  "urgent_priority_tasks": 4,
  "unassigned_tasks": 2
}
```

---

## 13. Como visualizar o banco 🗃️

Você pode usar ferramentas visuais para abrir o PostgreSQL:

- **DBeaver**
- **Visual Studio Code**
- **pgAdmin**
- **TablePlus**

### Qual delas vale mais a pena ensinar?

Para este projeto, a recomendação mais prática é:

- **DBeaver** para quem quer uma interface visual pronta e simples
- **VS Code** para quem quer centralizar código e banco no mesmo lugar

O **Azure Data Studio** não é mais a melhor opção para ensinar, porque foi aposentado pela Microsoft em **28 de fevereiro de 2026** e a recomendação oficial é migrar para **VS Code**.

### Como abrir pelo DBeaver

1. abra o DBeaver
2. conecte no PostgreSQL
3. expanda:
   - servidor
   - databases
   - `venkern_db`
   - schemas
   - public
   - tables

### Como abrir pelo VS Code

1. abra o VS Code
2. use a extensão de PostgreSQL
3. crie a conexão com o banco
4. expanda o banco `venkern_db`
5. abra as tabelas pela árvore lateral da extensão

### Tabelas principais para observar

- `contacts`
- `teams`
- `tasks`

### O que olhar nessas tabelas?

#### `contacts`
Veja os contatos cadastrados e o campo `team_id`.

#### `teams`
Veja as equipes existentes.

#### `tasks`
Veja:

- status
- prioridade
- responsável
- equipe
- data de vencimento

---

## 14. Explicação das entidades 🧩

### Contact
Representa uma pessoa cadastrada no sistema.

Campos importantes:

- nome completo
- telefone
- email
- cargo
- tipo de função
- observações
- favorito
- equipe

### Team
Representa uma equipe.

Campos importantes:

- nome
- descrição
- cor

Uma equipe pode ter vários contatos.

### Task
Representa uma tarefa do quadro Kanban.

Campos importantes:

- título
- descrição
- status
- prioridade
- data limite
- responsável
- equipe

---

## 15. Relacionamentos entre as entidades 🔗

### Relação entre Contact e Team

- um `Contact` pode pertencer a uma `Team`
- uma `Team` pode ter vários `Contacts`

### Relação entre Task e Contact

- uma `Task` pode ter um responsável
- esse responsável é um `Contact`

### Relação entre Task e Team

- uma `Task` pode pertencer a uma equipe
- também pode existir task geral, sem equipe

Isso permite flexibilidade para o MVP.

---

## 16. Explicação do Kanban 📋

O quadro Kanban organiza tarefas por **status**.

Na API atual, os status são:

- `todo`
- `in_progress`
- `review`
- `done`
- `late`

### O que cada status significa?

#### `todo`
Tarefa ainda não iniciada.

#### `in_progress`
Tarefa em andamento.

#### `review`
Tarefa pronta para revisão.

#### `done`
Tarefa concluída.

#### `late`
Tarefa atrasada.

### Como o front usa isso?

O front pode chamar:

```text
GET /api/tasks/kanban
```

E montar as colunas visualmente com base na resposta.

---

## 17. Explicação do Dashboard 📊

O dashboard mostra um resumo rápido do sistema.

Ele serve para alimentar cards e indicadores visuais no front-end.

Exemplos de métricas:

- total de contatos
- total de equipes
- total de tarefas
- tarefas por status
- tarefas de alta prioridade
- tarefas urgentes
- tarefas sem responsável

Endpoint:

```text
GET /api/dashboard/summary
```

Esse endpoint é útil para:

- cards de resumo
- visão executiva
- widgets iniciais

---

## 18. Respostas e erros da API

A API retorna JSON nas rotas principais.

### Exemplos de erros claros

- `full_name is required`
- `phone is required`
- `email is required`
- `Invalid email format`
- `Invalid task status`
- `Invalid task priority`
- `Team has linked contacts and cannot be deleted`

Também existem handlers globais para:

- `404`
- `400`
- `500`

Isso ajuda a evitar respostas HTML inesperadas em caso de erro.

---

## 19. Fluxo sugerido para desenvolvimento 👨‍💻

Se você entrar agora no projeto, um fluxo simples é:

1. instalar dependências
2. configurar `.env`
3. criar banco
4. rodar migrations
5. iniciar a API
6. rodar `python seed.py`
7. testar endpoints no APIdog ou Postman

---

## 20. Próximos passos do projeto 🌍

Depois desta fase alpha, alguns próximos passos naturais seriam:

- autenticação de usuários
- autorização por perfil
- multiusuário
- multiempresa
- módulo de projetos
- comentários em tasks
- anexos
- histórico de alterações
- notificações

### E onde o Spring Boot entra?

Se o projeto crescer bastante, uma futura migração ou reescrita para **Spring Boot** pode fazer sentido por motivos como:

- ecossistema corporativo forte
- recursos robustos para aplicações maiores
- facilidade de integração em ambientes enterprise

Mas, para o MVP acadêmico atual, o Flask cumpre muito bem o papel.

### Visão de produto

No futuro, o Venkern pode evoluir para algo mais próximo de um **SaaS**.

SaaS significa **Software as a Service**: um sistema online usado por várias empresas ou times, cada um com seu próprio espaço.

---

## 21. Resumo final ✅

Hoje o backend do Venkern já entrega:

- CRUD de contatos
- CRUD de equipes
- CRUD de tasks
- quadro Kanban via API
- dashboard summary
- validações básicas
- seed de demonstração

Isso já forma uma base muito boa para:

- apresentação acadêmica
- integração com front-end
- evolução futura do produto

Se você está começando agora no projeto, o melhor caminho é:

1. rodar a API
2. executar o seed
3. testar no APIdog
4. abrir o banco em uma ferramenta visual
5. navegar pelas rotas para entender o fluxo
