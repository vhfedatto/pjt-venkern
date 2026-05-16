from datetime import datetime, timedelta, timezone

from app import create_app
from app.contacts.models import Contact
from app.extensions import db
from app.tasks.models import Task
from app.teams.models import Team


def reset_data():
    Task.query.delete()
    Contact.query.delete()
    Team.query.delete()
    db.session.commit()


def create_teams():
    teams_data = [
        {
            "name": "Desenvolvimento",
            "description": "Equipe responsável pela plataforma principal.",
            "color": "#2563EB",
        },
        {
            "name": "Design",
            "description": "Equipe focada em UX, UI e branding.",
            "color": "#DB2777",
        },
        {
            "name": "Marketing",
            "description": "Equipe de campanhas, conteúdo e aquisição.",
            "color": "#EA580C",
        },
        {
            "name": "Gestão",
            "description": "Equipe de produto, operação e estratégia.",
            "color": "#059669",
        },
    ]

    teams = [Team(**team_data) for team_data in teams_data]
    db.session.add_all(teams)
    db.session.commit()
    return teams


def create_contacts(teams_by_name):
    contacts_data = [
        {
            "full_name": "Ana Ribeiro",
            "phone": "+55 11 99999-1001",
            "email": "ana.ribeiro@venkern.dev",
            "role": "Tech Lead",
            "function_type": "Leadership",
            "notes": "Lidera entregas de backend e arquitetura.",
            "is_favorite": True,
            "team_id": teams_by_name["Desenvolvimento"].id,
        },
        {
            "full_name": "Bruno Lima",
            "phone": "+55 11 99999-1002",
            "email": "bruno.lima@venkern.dev",
            "role": "Front-end Developer",
            "function_type": "Engineering",
            "notes": "Responsável por interfaces React.",
            "is_favorite": True,
            "team_id": teams_by_name["Desenvolvimento"].id,
        },
        {
            "full_name": "Carla Mendes",
            "phone": "+55 11 99999-1003",
            "email": "carla.mendes@venkern.dev",
            "role": "Back-end Developer",
            "function_type": "Engineering",
            "notes": "Atua em APIs Flask e integrações.",
            "is_favorite": False,
            "team_id": teams_by_name["Desenvolvimento"].id,
        },
        {
            "full_name": "Diego Nunes",
            "phone": "+55 11 99999-1004",
            "email": "diego.nunes@venkern.dev",
            "role": "UI Designer",
            "function_type": "Design",
            "notes": "Cria fluxos e protótipos de alta fidelidade.",
            "is_favorite": False,
            "team_id": teams_by_name["Design"].id,
        },
        {
            "full_name": "Elisa Rocha",
            "phone": "+55 11 99999-1005",
            "email": "elisa.rocha@venkern.dev",
            "role": "Product Manager",
            "function_type": "Product",
            "notes": "Prioriza roadmap e alinhamento com stakeholders.",
            "is_favorite": True,
            "team_id": teams_by_name["Gestão"].id,
        },
        {
            "full_name": "Felipe Costa",
            "phone": "+55 11 99999-1006",
            "email": "felipe.costa@venkern.dev",
            "role": "QA Tester",
            "function_type": "Quality",
            "notes": "Executa planos de teste e valida regressões.",
            "is_favorite": False,
            "team_id": teams_by_name["Gestão"].id,
        },
        {
            "full_name": "Gabriela Souza",
            "phone": "+55 11 99999-1007",
            "email": "gabriela.souza@venkern.dev",
            "role": "Stakeholder",
            "function_type": "Business",
            "notes": "Representa demandas comerciais.",
            "is_favorite": False,
            "team_id": teams_by_name["Marketing"].id,
        },
        {
            "full_name": "Henrique Alves",
            "phone": "+55 11 99999-1008",
            "email": "henrique.alves@venkern.dev",
            "role": "DevOps Engineer",
            "function_type": "Infrastructure",
            "notes": "Cuida de deploy, monitoramento e ambientes.",
            "is_favorite": True,
            "team_id": teams_by_name["Desenvolvimento"].id,
        },
    ]

    contacts = [Contact(**contact_data) for contact_data in contacts_data]
    db.session.add_all(contacts)
    db.session.commit()
    return contacts


def create_tasks(teams_by_name, contacts_by_email):
    now = datetime.now(timezone.utc)
    tasks_data = [
        {
            "title": "Definir backlog da sprint 12",
            "description": "Organizar escopo e dependências da próxima sprint.",
            "status": "todo",
            "priority": "high",
            "due_date": now + timedelta(days=2),
            "assignee_id": contacts_by_email["elisa.rocha@venkern.dev"].id,
            "team_id": teams_by_name["Gestão"].id,
        },
        {
            "title": "Refatorar autenticação JWT",
            "description": "Separar middleware e revisar expiração de tokens.",
            "status": "in_progress",
            "priority": "urgent",
            "due_date": now + timedelta(days=1),
            "assignee_id": contacts_by_email["ana.ribeiro@venkern.dev"].id,
            "team_id": teams_by_name["Desenvolvimento"].id,
        },
        {
            "title": "Criar tela de onboarding",
            "description": "Implementar fluxo inicial para novos usuários.",
            "status": "review",
            "priority": "medium",
            "due_date": now + timedelta(days=4),
            "assignee_id": contacts_by_email["bruno.lima@venkern.dev"].id,
            "team_id": teams_by_name["Desenvolvimento"].id,
        },
        {
            "title": "Ajustar endpoint de contatos",
            "description": "Corrigir paginação futura e documentar filtros.",
            "status": "done",
            "priority": "low",
            "due_date": now - timedelta(days=1),
            "assignee_id": contacts_by_email["carla.mendes@venkern.dev"].id,
            "team_id": teams_by_name["Desenvolvimento"].id,
        },
        {
            "title": "Revisar fluxo de aprovação",
            "description": "Mapear gargalos entre review e deploy.",
            "status": "late",
            "priority": "high",
            "due_date": now - timedelta(days=3),
            "assignee_id": contacts_by_email["felipe.costa@venkern.dev"].id,
            "team_id": teams_by_name["Gestão"].id,
        },
        {
            "title": "Atualizar design system",
            "description": "Padronizar botões e estados de carregamento.",
            "status": "todo",
            "priority": "medium",
            "due_date": now + timedelta(days=5),
            "assignee_id": contacts_by_email["diego.nunes@venkern.dev"].id,
            "team_id": teams_by_name["Design"].id,
        },
        {
            "title": "Planejar campanha de lançamento",
            "description": "Estruturar cronograma e canais de divulgação.",
            "status": "in_progress",
            "priority": "high",
            "due_date": now + timedelta(days=6),
            "assignee_id": contacts_by_email["gabriela.souza@venkern.dev"].id,
            "team_id": teams_by_name["Marketing"].id,
        },
        {
            "title": "Cobrir API com testes manuais",
            "description": "Validar fluxos críticos no APIdog.",
            "status": "review",
            "priority": "medium",
            "due_date": now + timedelta(days=2),
            "assignee_id": contacts_by_email["felipe.costa@venkern.dev"].id,
            "team_id": teams_by_name["Gestão"].id,
        },
        {
            "title": "Provisionar ambiente de staging",
            "description": "Ajustar variáveis e pipeline de deploy.",
            "status": "done",
            "priority": "urgent",
            "due_date": now - timedelta(days=2),
            "assignee_id": contacts_by_email["henrique.alves@venkern.dev"].id,
            "team_id": teams_by_name["Desenvolvimento"].id,
        },
        {
            "title": "Auditar permissões de usuários",
            "description": "Conferir papéis e acessos administrativos.",
            "status": "late",
            "priority": "urgent",
            "due_date": now - timedelta(days=4),
            "assignee_id": contacts_by_email["ana.ribeiro@venkern.dev"].id,
            "team_id": teams_by_name["Desenvolvimento"].id,
        },
        {
            "title": "Escrever FAQ do produto",
            "description": "Produzir conteúdo base para help center.",
            "status": "todo",
            "priority": "low",
            "due_date": now + timedelta(days=8),
            "assignee_id": None,
            "team_id": teams_by_name["Marketing"].id,
        },
        {
            "title": "Mapear métricas de conversão",
            "description": "Definir eventos e painéis iniciais.",
            "status": "in_progress",
            "priority": "medium",
            "due_date": now + timedelta(days=7),
            "assignee_id": None,
            "team_id": None,
        },
        {
            "title": "Ajustar cópia da landing page",
            "description": "Revisar proposta de valor e CTA principal.",
            "status": "review",
            "priority": "high",
            "due_date": now + timedelta(days=3),
            "assignee_id": contacts_by_email["gabriela.souza@venkern.dev"].id,
            "team_id": teams_by_name["Marketing"].id,
        },
        {
            "title": "Organizar retrospectiva mensal",
            "description": "Coletar feedbacks e consolidar ações.",
            "status": "done",
            "priority": "low",
            "due_date": now - timedelta(days=5),
            "assignee_id": contacts_by_email["elisa.rocha@venkern.dev"].id,
            "team_id": teams_by_name["Gestão"].id,
        },
        {
            "title": "Investigar lentidão no login",
            "description": "Analisar logs e tempo de resposta no backend.",
            "status": "late",
            "priority": "urgent",
            "due_date": now - timedelta(days=1),
            "assignee_id": contacts_by_email["carla.mendes@venkern.dev"].id,
            "team_id": teams_by_name["Desenvolvimento"].id,
        },
    ]

    tasks = [Task(**task_data) for task_data in tasks_data]
    db.session.add_all(tasks)
    db.session.commit()
    return tasks


def run_seed():
    reset_data()
    teams = create_teams()
    teams_by_name = {team.name: team for team in teams}

    contacts = create_contacts(teams_by_name)
    contacts_by_email = {contact.email: contact for contact in contacts}

    tasks = create_tasks(teams_by_name, contacts_by_email)

    print("Seed concluído:")
    print(f"- {len(teams)} equipes criadas")
    print(f"- {len(contacts)} contatos criados")
    print(f"- {len(tasks)} tasks criadas")


if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        run_seed()
