<div align="center">

# Venkern

### A modern platform for managing software factory teams, contacts, tasks and workflows.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-3-black?logo=flask&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql&logoColor=white)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2-D71F00?logo=sqlalchemy&logoColor=white)
![Status](https://img.shields.io/badge/Status-Alpha-8B5CF6)

</div>

## Preview

Interface previews and product screenshots will be added in future iterations as the frontend and backend become fully integrated.

## About the project

Venkern was born as an academic project, but it was designed with a broader SaaS vision in mind. The idea is to support software factory management inside the university context by connecting administrators, tech leads, professionals, teams, contacts, tasks and operational workflows in one platform.

At this stage, the project already has a functional Flask API and a first React dashboard interface for presentation, validation and future backend integration.

## Current features

- Contacts CRUD
- Teams CRUD
- Tasks CRUD
- Kanban API
- Dashboard Summary
- Seed Data
- API Polish

## Tech stack

### Frontend

- React
- Vite
- JavaScript
- CSS

### Backend

- Python
- Flask
- SQLAlchemy
- Flask-Migrate
- PostgreSQL
- CORS

### Tools

- APIdog / Postman
- Git / GitHub
- Figma

## Project structure

```text
pjt-venkern/
├── front-end/
├── venkern-api/
└── README.md
```

## Running the backend

```powershell
cd venkern-api
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
flask --app run.py db upgrade
python seed.py
python run.py
```

The backend will usually be available at `http://127.0.0.1:5000`.

## Running the frontend

```powershell
cd front-end
npm install
npm run dev
```

The frontend will usually be available at `http://127.0.0.1:5173`.

## Seed data

The backend includes demo data for academic presentations and local testing.

```powershell
cd venkern-api
python seed.py
```

This script clears old demo records and recreates teams, contacts and tasks with mock data.

## Main endpoints

### Contacts

- `GET /api/contacts`
- `POST /api/contacts`
- `PUT /api/contacts/:id`
- `DELETE /api/contacts/:id`

### Teams

- `GET /api/teams`
- `POST /api/teams`

### Tasks

- `GET /api/tasks`
- `POST /api/tasks`
- `PATCH /api/tasks/:id/status`

### Kanban

- `GET /api/tasks/kanban`

### Dashboard

- `GET /api/dashboard/summary`

## Roadmap

### Delivered

- `v0.1` Contacts
- `v0.2` Teams
- `v0.3` Tasks
- `v0.4` Kanban API
- `v0.5` Dashboard Summary
- `v0.6` API Polish
- `v0.7` Seed Data
- `v0.8` Alpha Delivery

### Future

- Authentication
- Projects
- Advanced Kanban
- User permissions
- Spring Boot migration
- SaaS version

## Team

- Victor Hugo — Backend
- Kaliel — Database and Figma
- Alexandre — Frontend
- Rodrigo — Frontend
- Luanny — Frontend

## Academic note

This repository represents an **Alpha version** prepared for academic delivery and initial validation. The focus is clarity, modular organization and a solid starting point for future iterations.

## License

This project is currently intended for academic and portfolio use. Add a formal license later if the team decides to open the repository publicly.
