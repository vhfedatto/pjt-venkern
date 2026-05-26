"""
seed.py -- Venkern demo data seeder.

Usage (inside Docker):
    docker compose exec backend python seed.py

Usage (local):
    python seed.py

Flags:
    --reset   Wipe all data before seeding (development only)

Safe to run multiple times: existing records are detected before insertion.
"""

from __future__ import annotations

import sys
from datetime import date, datetime, timedelta, timezone

from app import create_app
from app.auth.models import User
from app.chats.models import ChatConversation, ChatMessage
from app.contact_documents.models import ContactDocument
from app.contact_interactions.models import ContactInteraction
from app.contacts.models import Contact
from app.events.models import AppEvent
from app.extensions import db
from app.groups.models import Group, GroupMessage
from app.moderation.models import ModerationAlert
from app.projects.models import Project, ProjectMember
from app.tasks.models import Task
from app.teams.models import Team

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def now() -> datetime:
    return datetime.now(timezone.utc)


def days_ago(n: int) -> datetime:
    return now() - timedelta(days=n)


def days_from_now(n: int) -> datetime:
    return now() + timedelta(days=n)


# ---------------------------------------------------------------------------
# Reset
# ---------------------------------------------------------------------------


def reset_data() -> None:
    print("  Wiping existing data...")
    ModerationAlert.query.delete()
    ChatMessage.query.delete()
    ChatConversation.query.delete()
    GroupMessage.query.delete()
    db.session.execute(db.text("DELETE FROM group_members"))
    Group.query.delete()
    ContactDocument.query.delete()
    ContactInteraction.query.delete()
    AppEvent.query.delete()
    Task.query.delete()
    Contact.query.delete()
    Team.query.delete()
    ProjectMember.query.delete()
    Project.query.delete()
    User.query.delete()
    db.session.commit()
    print("  Done.")


# ---------------------------------------------------------------------------
# Users
# ---------------------------------------------------------------------------


def get_or_create_user(
    name: str,
    email: str,
    username: str,
    password: str,
    role: str = "professional",
    is_super_admin: bool = False,
) -> User:
    user = User.query.filter_by(email=email).first()
    if user:
        return user
    user = User(
        name=name,
        email=email,
        username=username,
        role=role,
        is_active=True,
        is_super_admin=is_super_admin,
        status="ACTIVE",
    )
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    return user


def create_users() -> dict[str, User]:
    print("  Creating users...")
    super_admin = get_or_create_user(
        name="Super Admin",
        email="super@venkern.com",
        username="superadmin",
        password="12345678",
        role="admin",
        is_super_admin=True,
    )
    admin = get_or_create_user(
        name="Admin Venkern",
        email="admin@venkern.com",
        username="admin",
        password="12345678",
        role="admin",
    )
    pro = get_or_create_user(
        name="Ana Profissional",
        email="pro@venkern.com",
        username="profissional",
        password="12345678",
        role="professional",
    )
    return {"super_admin": super_admin, "admin": admin, "pro": pro}


# ---------------------------------------------------------------------------
# Project
# ---------------------------------------------------------------------------


def create_project(owner: User) -> Project:
    print("  Creating project...")
    project = Project.query.filter_by(slug="venkern").first()
    if project:
        return project
    project = Project(
        name="Venkern",
        slug="venkern",
        description=(
            "Plataforma de gestao de contatos, tarefas, eventos e comunicacao "
            "para equipes modernas."
        ),
        owner_id=owner.id,
        status="ACTIVE",
    )
    db.session.add(project)
    db.session.commit()
    return project


def add_member(project: Project, user: User, role: str) -> None:
    exists = ProjectMember.query.filter_by(
        project_id=project.id, user_id=user.id
    ).first()
    if exists:
        return
    member = ProjectMember(
        project_id=project.id,
        user_id=user.id,
        role=role,
        status="ACTIVE",
        invited_by_id=project.owner_id,
    )
    db.session.add(member)
    db.session.commit()


# ---------------------------------------------------------------------------
# Teams
# ---------------------------------------------------------------------------


def create_teams(project: Project) -> dict[str, Team]:
    print("  Creating teams...")
    teams_data = [
        {"name": "Vendas",    "color": "#6366f1", "description": "Time comercial e prospeccao."},
        {"name": "Marketing", "color": "#10b981", "description": "Branding, conteudo e campanhas."},
        {"name": "Suporte",   "color": "#f59e0b", "description": "Atendimento e pos-venda."},
        {"name": "Tech",      "color": "#3b82f6", "description": "Desenvolvimento e infraestrutura."},
    ]
    result: dict[str, Team] = {}
    for td in teams_data:
        team = Team.query.filter_by(name=td["name"], project_id=project.id).first()
        if not team:
            team = Team(project_id=project.id, **td)
            db.session.add(team)
            db.session.commit()
        result[td["name"]] = team
    return result


# ---------------------------------------------------------------------------
# Contacts
# ---------------------------------------------------------------------------


def create_contacts(project: Project, teams: dict[str, Team]) -> list[Contact]:
    print("  Creating contacts...")
    data = [
        dict(full_name="Lucas Ferreira",  phone="(11) 99001-0001", email="lucas@empresa.com",    role="CEO",             function_type="Leadership",  origin="indicacao", is_favorite=True,  team_id=teams["Vendas"].id),
        dict(full_name="Marina Souza",    phone="(11) 99001-0002", email="marina@empresa.com",   role="CTO",             function_type="Leadership",  origin="evento",    is_favorite=True,  team_id=teams["Tech"].id),
        dict(full_name="Pedro Alves",     phone="(11) 99001-0003", email="pedro@empresa.com",    role="Gerente",         function_type="Management",  origin="instagram", is_favorite=False, team_id=teams["Vendas"].id),
        dict(full_name="Juliana Costa",   phone="(11) 99001-0004", email="juliana@empresa.com",  role="Analista",        function_type="Analyst",     origin="email",     is_favorite=False, team_id=teams["Marketing"].id),
        dict(full_name="Rafael Lima",     phone="(11) 99001-0005", email="rafael@empresa.com",   role="Dev Senior",      function_type="Developer",   origin="manual",    is_favorite=False, team_id=teams["Tech"].id),
        dict(full_name="Beatriz Mendes",  phone="(11) 99001-0006", email="beatriz@empresa.com",  role="Designer",        function_type="Designer",    origin="instagram", is_favorite=True,  team_id=teams["Marketing"].id),
        dict(full_name="Carlos Oliveira", phone="(11) 99001-0007", email="carlos@empresa.com",   role="Suporte N2",      function_type="Support",     origin="whatsapp",  is_favorite=False, team_id=teams["Suporte"].id),
        dict(full_name="Fernanda Torres", phone="(11) 99001-0008", email="fernanda@empresa.com", role="SDR",             function_type="Sales",       origin="whatsapp",  is_favorite=False, team_id=teams["Vendas"].id),
        dict(full_name="Gustavo Rocha",   phone="(11) 99001-0009", email="gustavo@empresa.com",  role="DevOps",          function_type="Developer",   origin="manual",    is_favorite=False, team_id=teams["Tech"].id),
        dict(full_name="Isabela Nunes",   phone="(11) 99001-0010", email="isabela@empresa.com",  role="Product Manager", function_type="Management",  origin="evento",    is_favorite=True,  team_id=teams["Tech"].id),
        dict(full_name="Thiago Santos",   phone="(11) 99001-0011", email="thiago@empresa.com",   role="Closer",          function_type="Sales",       origin="indicacao", is_favorite=False, team_id=teams["Vendas"].id),
        dict(full_name="Amanda Barbosa",  phone="(11) 99001-0012", email="amanda@empresa.com",   role="CS Manager",      function_type="Support",     origin="email",     is_favorite=False, team_id=teams["Suporte"].id),
    ]
    contacts: list[Contact] = []
    for d in data:
        c = Contact.query.filter_by(email=d["email"], project_id=project.id).first()
        if not c:
            c = Contact(project_id=project.id, notes="Contato criado via seed.", **d)
            db.session.add(c)
            db.session.commit()
        contacts.append(c)
    return contacts


# ---------------------------------------------------------------------------
# Tasks
# ---------------------------------------------------------------------------


def create_tasks(project: Project, contacts: list[Contact], teams: dict[str, Team]) -> None:
    print("  Creating tasks...")
    tasks_data = [
        dict(title="Fechar contrato com Lucas Ferreira",   status="in_progress", priority="urgent", due_date=days_from_now(3),  assignee_id=contacts[0].id,  team_id=teams["Vendas"].id,    tags=["contrato", "urgente"]),
        dict(title="Preparar proposta comercial",          status="todo",        priority="high",   due_date=days_from_now(7),  assignee_id=contacts[2].id,  team_id=teams["Vendas"].id,    tags=["proposta"]),
        dict(title="Onboarding Marina Souza",              status="done",        priority="high",   due_date=days_ago(2),       assignee_id=contacts[1].id,  team_id=teams["Tech"].id,      tags=["onboarding"]),
        dict(title="Deploy versao 2.1.0",                  status="review",      priority="high",   due_date=days_from_now(1),  assignee_id=contacts[4].id,  team_id=teams["Tech"].id,      tags=["deploy", "release"]),
        dict(title="Campanha de e-mail marketing",         status="in_progress", priority="medium", due_date=days_from_now(10), assignee_id=contacts[3].id,  team_id=teams["Marketing"].id, tags=["email", "campanha"]),
        dict(title="Criar identidade visual Q3",           status="todo",        priority="medium", due_date=days_from_now(14), assignee_id=contacts[5].id,  team_id=teams["Marketing"].id, tags=["design"]),
        dict(title="Resolver ticket #482 - lentidao",      status="done",        priority="high",   due_date=days_ago(1),       assignee_id=contacts[6].id,  team_id=teams["Suporte"].id,   tags=["bug"]),
        dict(title="Atualizar base de conhecimento",       status="todo",        priority="low",    due_date=days_from_now(21), assignee_id=contacts[11].id, team_id=teams["Suporte"].id,   tags=["docs"]),
        dict(title="Prospectar 20 leads este mes",         status="in_progress", priority="urgent", due_date=days_from_now(5),  assignee_id=contacts[7].id,  team_id=teams["Vendas"].id,    tags=["leads"]),
        dict(title="Infraestrutura Kubernetes",            status="in_progress", priority="high",   due_date=days_from_now(12), assignee_id=contacts[8].id,  team_id=teams["Tech"].id,      tags=["infra", "k8s"]),
        dict(title="Roadmap produto Q3",                   status="review",      priority="medium", due_date=days_from_now(4),  assignee_id=contacts[9].id,  team_id=teams["Tech"].id,      tags=["roadmap"]),
        dict(title="Follow-up Thiago Santos",              status="late",        priority="high",   due_date=days_ago(5),       assignee_id=contacts[10].id, team_id=teams["Vendas"].id,    tags=["follow-up"]),
    ]
    for td in tasks_data:
        exists = Task.query.filter_by(title=td["title"], project_id=project.id).first()
        if not exists:
            task = Task(
                project_id=project.id,
                description="Tarefa criada via seed.",
                **td,
            )
            db.session.add(task)
    db.session.commit()


# ---------------------------------------------------------------------------
# Events
# ---------------------------------------------------------------------------


def create_events(project: Project) -> None:
    print("  Creating events...")
    events_data = [
        dict(title="Workshop de Vendas Q3",    description="Treinamento de tecnicas de vendas.", date=date.today() + timedelta(days=7),  time="09:00", location="Sala 1 - SP",    status="scheduled", target_audience=["all"]),
        dict(title="Lancamento Produto v3.0",  description="Novas funcionalidades da plataforma.", date=date.today() + timedelta(days=15), time="14:00", location="Online (Zoom)", status="scheduled", target_audience=["all"]),
        dict(title="Reuniao de Alinhamento Q2", description="Retrospectiva e planejamento.",     date=date.today() - timedelta(days=10), time="10:00", location="Sala 3 - RJ",    status="completed",  target_audience=["all"]),
        dict(title="Happy Hour Tech",           description="Encontro informal da equipe tech.", date=date.today() + timedelta(days=3),  time="18:00", location="Bar do Ze",      status="scheduled", target_audience=["all"]),
    ]
    for ed in events_data:
        exists = AppEvent.query.filter_by(title=ed["title"], project_id=project.id).first()
        if not exists:
            event = AppEvent(project_id=project.id, **ed)
            db.session.add(event)
    db.session.commit()


# ---------------------------------------------------------------------------
# Interactions
# ---------------------------------------------------------------------------


def create_interactions(contacts: list[Contact]) -> None:
    print("  Creating interactions...")
    interactions_data = [
        dict(contact_id=contacts[0].id, type="call",    description="Ligacao inicial - interesse confirmado.",     created_by=contacts[1].id),
        dict(contact_id=contacts[0].id, type="meeting", description="Reuniao de apresentacao da proposta.",        created_by=contacts[1].id),
        dict(contact_id=contacts[1].id, type="email",   description="Envio de documentacao tecnica.",              created_by=contacts[0].id),
        dict(contact_id=contacts[2].id, type="call",    description="Follow-up pos-proposta.",                     created_by=contacts[0].id),
        dict(contact_id=contacts[4].id, type="meeting", description="Alinhamento de arquitetura do novo modulo.",  created_by=contacts[1].id),
        dict(contact_id=contacts[9].id, type="email",   description="Envio do roadmap para aprovacao.",            created_by=contacts[0].id),
    ]
    for idata in interactions_data:
        existing = ContactInteraction.query.filter_by(
            contact_id=idata["contact_id"],
            description=idata["description"],
        ).first()
        if not existing:
            interaction = ContactInteraction(**idata)
            db.session.add(interaction)
    db.session.commit()


# ---------------------------------------------------------------------------
# Group + Messages
# ---------------------------------------------------------------------------


def create_group(project: Project, contacts: list[Contact]) -> Group:
    print("  Creating group + messages...")
    group = Group.query.filter_by(name="Geral Venkern", project_id=project.id).first()
    if not group:
        group = Group(
            project_id=project.id,
            name="Geral Venkern",
            type="general",
            last_activity=now(),
        )
        group.members = contacts[:8]
        db.session.add(group)
        db.session.commit()

    if GroupMessage.query.filter_by(group_id=group.id).count() == 0:
        messages = [
            (contacts[0], "Bom dia, pessoal! Semana boa para todos."),
            (contacts[1], "Bom dia! Deploy do modulo de relatorios foi concluido."),
            (contacts[3], "A campanha de marco bateu meta."),
            (contacts[2], "Parabens ao time de marketing!"),
            (contacts[5], "Arquivos de design no Figma. Link no canal."),
            (contacts[0], "Reuniao de alinhamento amanha as 10h."),
            (contacts[6], "Ticket #482 resolvido. Cliente satisfeito."),
            (contacts[9], "Roadmap Q3 enviado para aprovacao."),
        ]
        for sender, content in messages:
            msg = GroupMessage(
                group_id=group.id,
                sender_id=sender.id,
                content=content,
                type="text",
            )
            db.session.add(msg)
        db.session.commit()

    return group


# ---------------------------------------------------------------------------
# Private Chat
# ---------------------------------------------------------------------------


def create_private_chat(project: Project, contacts: list[Contact]) -> None:
    print("  Creating private chat...")
    a, b = contacts[0], contacts[1]
    conv = ChatConversation.query.filter_by(
        participant_a=a.id, participant_b=b.id
    ).first()
    if not conv:
        conv = ChatConversation(
            project_id=project.id,
            participant_a=a.id,
            participant_b=b.id,
            last_activity=now(),
        )
        db.session.add(conv)
        db.session.commit()

    if ChatMessage.query.filter_by(conversation_id=conv.id).count() == 0:
        chat_msgs = [
            (a, "Marina, pode revisar o modulo de relatorios hoje?"),
            (b, "Claro! Tem algum ponto especifico?"),
            (a, "Sim, os graficos de tarefas por status. Pode conferir os dados?"),
            (b, "Dados conferidos. Tudo certo. Posso fazer o merge hoje."),
            (a, "Perfeito! Obrigado."),
        ]
        for sender, content in chat_msgs:
            msg = ChatMessage(
                conversation_id=conv.id,
                sender_id=sender.id,
                content=content,
                type="text",
            )
            db.session.add(msg)
        db.session.commit()


# ---------------------------------------------------------------------------
# Moderation Alerts
# ---------------------------------------------------------------------------


def create_moderation_alerts(
    project: Project, contacts: list[Contact], group: Group
) -> None:
    print("  Creating moderation alerts...")
    alerts_data = [
        dict(user_id=contacts[6].id,  context="group", context_id=str(group.id), context_name="Geral Venkern", content="link suspeito compartilhado no grupo",         status="pending"),
        dict(user_id=contacts[7].id,  context="group", context_id=str(group.id), context_name="Geral Venkern", content="mensagem com linguagem inadequada detectada",   status="resolved"),
        dict(user_id=contacts[2].id,  context="chat",  context_id="1",           context_name="Chat Privado",   content="tentativa de compartilhar arquivo executavel", status="dismissed"),
    ]
    for ad in alerts_data:
        exists = ModerationAlert.query.filter_by(
            project_id=project.id,
            user_id=ad["user_id"],
            content=ad["content"],
        ).first()
        if not exists:
            alert = ModerationAlert(project_id=project.id, **ad)
            db.session.add(alert)
    db.session.commit()


# ---------------------------------------------------------------------------
# Documents (metadata only -- no actual files on disk)
# ---------------------------------------------------------------------------


def create_documents(contacts: list[Contact]) -> None:
    print("  Creating document metadata...")
    docs_data = [
        dict(contact_id=contacts[0].id, name="Proposta Lucas",   original_filename="proposta_lucas.pdf",   mime_type="application/pdf", file_type="pdf",   storage_path="uploads/proposta_lucas.pdf",   uploaded_by=contacts[1].id, size=102400),
        dict(contact_id=contacts[1].id, name="Contrato Marina",  original_filename="contrato_marina.docx", mime_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document", file_type="doc", storage_path="uploads/contrato_marina.docx", uploaded_by=contacts[0].id, size=204800),
        dict(contact_id=contacts[4].id, name="Arquitetura v2",   original_filename="arquitetura_v2.png",   mime_type="image/png",       file_type="image", storage_path="uploads/arquitetura_v2.png",   uploaded_by=contacts[1].id, size=512000),
    ]
    for dd in docs_data:
        exists = ContactDocument.query.filter_by(
            contact_id=dd["contact_id"],
            original_filename=dd["original_filename"],
        ).first()
        if not exists:
            doc = ContactDocument(**dd)
            db.session.add(doc)
    db.session.commit()


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def run_seed(do_reset: bool = False) -> None:
    if do_reset:
        reset_data()

    print("-" * 50)
    print("Venkern -- seed")
    print("-" * 50)

    users   = create_users()
    project = create_project(owner=users["super_admin"])

    add_member(project, users["admin"], role="ADMIN")
    add_member(project, users["pro"],   role="PROFESSIONAL")

    teams    = create_teams(project)
    contacts = create_contacts(project, teams)

    create_tasks(project, contacts, teams)
    create_events(project)
    create_interactions(contacts)
    group = create_group(project, contacts)
    create_private_chat(project, contacts)
    create_moderation_alerts(project, contacts, group)
    create_documents(contacts)

    print("-" * 50)
    print("Seed concluido com sucesso!")
    print()
    print("Usuarios de teste:")
    print("  super@venkern.com  /  12345678  (Super Admin)")
    print("  admin@venkern.com  /  12345678  (Admin)")
    print("  pro@venkern.com    /  12345678  (Profissional)")
    print("-" * 50)


if __name__ == "__main__":
    do_reset = "--reset" in sys.argv
    app = create_app()
    with app.app_context():
        run_seed(do_reset=do_reset)
