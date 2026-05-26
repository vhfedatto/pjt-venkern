def test_teams_create_and_add_member(client, auth_headers, project, contact):
    created = client.post(
        "/api/teams",
        headers=auth_headers,
        json={"name": "Comercial", "description": "Time comercial", "color": "#10b981", "project_id": project.id},
    )
    assert created.status_code == 201
    team = created.get_json()

    listing = client.get(f"/api/teams?project_id={project.id}", headers=auth_headers)
    assert listing.status_code == 200
    assert any(item["id"] == team["id"] for item in listing.get_json())

    added = client.post(
        f"/api/teams/{team['id']}/members",
        headers=auth_headers,
        json={"contact_id": contact.id},
    )
    assert added.status_code == 200
    assert any(member["id"] == contact.id for member in added.get_json()["members"])
