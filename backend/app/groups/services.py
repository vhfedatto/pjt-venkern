from app.groups.models import Group


def sync_contact_team_group(contact, previous_team_id=None):
    if previous_team_id and previous_team_id != contact.team_id:
        previous_group = Group.query.filter_by(team_id=previous_team_id).first()
        if previous_group and contact in previous_group.members:
            previous_group.members.remove(contact)

    if contact.team_id:
        current_group = Group.query.filter_by(team_id=contact.team_id).first()
        if current_group and contact not in current_group.members:
            current_group.members.append(contact)
