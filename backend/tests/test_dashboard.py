from datetime import date, timedelta


def test_dashboard_summary_counts_project_data(client, auth_headers, project, team, contact):
    client.post(
        "/api/tasks",
        headers=auth_headers,
        json={
            "project_id": project.id,
            "team_id": team.id,
            "assignee_id": contact.id,
            "title": "Task Dashboard",
            "status": "todo",
            "priority": "medium",
            "due_date": (date.today() + timedelta(days=2)).isoformat(),
        },
    )
    client.post(
        "/api/events",
        headers=auth_headers,
        json={
            "project_id": project.id,
            "title": "Evento Dashboard",
            "date": (date.today() + timedelta(days=4)).isoformat(),
            "status": "scheduled",
        },
    )

    response = client.get(f"/api/dashboard/summary?project_id={project.id}", headers=auth_headers)
    assert response.status_code == 200
    payload = response.get_json()
    assert payload["total_contacts"] >= 1
    assert payload["total_teams"] >= 1
    assert payload["total_tasks"] >= 1
    assert payload["total_events"] >= 1
