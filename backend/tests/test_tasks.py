from datetime import date, timedelta


def test_tasks_crud_kanban_and_past_due_date_validation(client, auth_headers, project, team, contact):
    due_date = (date.today() + timedelta(days=3)).isoformat()
    created = client.post(
        "/api/tasks",
        headers=auth_headers,
        json={
            "project_id": project.id,
            "team_id": team.id,
            "assignee_id": contact.id,
            "title": "Task Teste",
            "description": "Descrição",
            "status": "todo",
            "priority": "high",
            "due_date": due_date,
            "tags": ["api"],
        },
    )
    assert created.status_code == 201
    task = created.get_json()

    listing = client.get(f"/api/tasks?project_id={project.id}", headers=auth_headers)
    assert listing.status_code == 200
    assert any(item["id"] == task["id"] for item in listing.get_json()["data"])

    kanban = client.get(f"/api/tasks/kanban?project_id={project.id}", headers=auth_headers)
    assert kanban.status_code == 200
    assert any(item["id"] == task["id"] for item in kanban.get_json()["todo"])

    moved = client.patch(f"/api/tasks/{task['id']}/status", headers=auth_headers, json={"status": "in_progress"})
    assert moved.status_code == 200
    assert moved.get_json()["status"] == "in_progress"

    invalid = client.post(
        "/api/tasks",
        headers=auth_headers,
        json={
            "project_id": project.id,
            "title": "Task Inválida",
            "status": "todo",
            "priority": "low",
            "due_date": (date.today() - timedelta(days=1)).isoformat(),
        },
    )
    assert invalid.status_code == 400
    assert "data da task" in invalid.get_json()["message"].lower()
