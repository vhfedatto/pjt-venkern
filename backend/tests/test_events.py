from datetime import date, timedelta


def test_events_crud_send_and_past_date_validation(client, auth_headers, project):
    event_date = (date.today() + timedelta(days=5)).isoformat()
    created = client.post(
        "/api/events",
        headers=auth_headers,
        json={
            "project_id": project.id,
            "title": "Evento Teste",
            "date": event_date,
            "time": "10:00",
            "location": "Sala 1",
            "status": "scheduled",
        },
    )
    assert created.status_code == 201
    event = created.get_json()

    listing = client.get(f"/api/events?project_id={project.id}", headers=auth_headers)
    assert listing.status_code == 200
    assert any(item["id"] == event["id"] for item in listing.get_json()["data"])

    sent = client.patch(f"/api/events/{event['id']}/send", headers=auth_headers)
    assert sent.status_code == 200
    assert sent.get_json()["status"] == "sent"

    invalid = client.post(
        "/api/events",
        headers=auth_headers,
        json={
            "project_id": project.id,
            "title": "Evento Passado",
            "date": (date.today() - timedelta(days=1)).isoformat(),
        },
    )
    assert invalid.status_code == 400
    assert "data do evento" in invalid.get_json()["message"].lower()
