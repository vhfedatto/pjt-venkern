def test_contacts_crud_and_filters(client, auth_headers, project, team):
    created = client.post(
        "/api/contacts",
        headers=auth_headers,
        json={
            "project_id": project.id,
            "team_id": team.id,
            "full_name": "Maria Cliente",
            "email": "maria@cliente.com",
            "phone": "11911112222",
            "role": "professional",
            "function_type": "Sales",
        },
    )
    assert created.status_code == 201
    contact = created.get_json()

    listing = client.get(f"/api/contacts?project_id={project.id}&team_id={team.id}", headers=auth_headers)
    assert listing.status_code == 200
    assert any(item["id"] == contact["id"] for item in listing.get_json()["data"])

    updated = client.put(
        f"/api/contacts/{contact['id']}",
        headers=auth_headers,
        json={"full_name": "Maria Atualizada", "phone": "11933334444", "email": "maria@cliente.com"},
    )
    assert updated.status_code == 200
    assert updated.get_json()["full_name"] == "Maria Atualizada"

    deleted = client.delete(f"/api/contacts/{contact['id']}", headers=auth_headers)
    assert deleted.status_code == 204
