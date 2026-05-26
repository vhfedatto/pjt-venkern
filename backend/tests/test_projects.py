def test_projects_list_and_create(client, auth_headers):
    created = client.post("/api/projects", headers=auth_headers, json={"name": "Empresa Nova"})
    assert created.status_code == 201
    created_data = created.get_json()["data"]
    assert created_data["name"] == "Empresa Nova"

    listing = client.get("/api/projects", headers=auth_headers)
    assert listing.status_code == 200
    assert any(project["name"] == "Empresa Nova" for project in listing.get_json()["data"])


def test_members_endpoint_returns_active_members(client, auth_headers, project, professional_membership):
    response = client.get(f"/api/projects/{project.id}/members", headers=auth_headers)
    assert response.status_code == 200
    members = response.get_json()["data"]
    assert len(members) == 2
