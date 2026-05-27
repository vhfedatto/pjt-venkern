import { getTeamColors } from "../utils/teamColors";
function mapApiContactToUi(contact) {
  return {
    id: String(contact.id),
    name: contact.full_name,
    email: contact.email,
    phone: contact.phone,
    role: contact.role === "admin" ? "admin" : "professional",
    teamId: contact.team_id ? String(contact.team_id) : "",
    position: contact.function_type ?? contact.role ?? "",
    status: "offline",
    notes: contact.notes ?? "",
    origin: contact.origin ?? "manual",
    nextAction: contact.next_action ?? "",
    nextActionDate: contact.next_action_date ?? "",
    responsibleId: contact.responsible_id ? String(contact.responsible_id) : void 0,
    createdAt: contact.created_at?.split("T")[0] ?? ""
  };
}
function mapUiContactToApi(contact) {
  return {
    full_name: contact.name,
    email: contact.email,
    phone: contact.phone,
    role: contact.role,
    function_type: contact.position,
    team_id: contact.teamId ? Number(contact.teamId) : null,
    notes: contact.notes,
    origin: contact.origin,
    next_action: contact.nextAction,
    next_action_date: contact.nextActionDate,
    responsible_id: contact.responsibleId ? Number(contact.responsibleId) : null,
    project_id: contact.projectId ?? null
  };
}
function mapApiTeamToUi(team) {
  const { bg, text } = getTeamColors(team.color ?? "#6366f1");
  return {
    id: String(team.id),
    name: team.name,
    color: team.color ?? "#6366f1",
    bgColor: bg,
    textColor: text,
    description: team.description ?? "",
    memberIds: (team.members ?? []).map((m) => String(m.id)),
    membersCount: team.members_count ?? 0
  };
}
function mapApiTaskToUi(task) {
  return {
    id: String(task.id),
    title: task.title,
    description: task.description ?? "",
    column: task.status,
    teamId: task.team?.id ? String(task.team.id) : "",
    assigneeId: task.assignee?.id ? String(task.assignee.id) : "",
    assigneeName: task.assignee?.full_name ?? "",
    priority: task.priority,
    dueDate: task.due_date?.split("T")[0] ?? "",
    createdAt: task.created_at?.split("T")[0] ?? "",
    tags: task.tags ?? [],
    acceptedAt: task.accepted_at ?? void 0,
    completionNote: task.completion_note ?? void 0,
    completionFileUrl: task.completion_file_url ?? void 0
  };
}
function mapUiTaskToApi(task) {
  return {
    ...task.title !== void 0 && { title: task.title },
    ...task.description !== void 0 && { description: task.description },
    ...task.column !== void 0 && { status: task.column },
    ...task.priority !== void 0 && { priority: task.priority },
    ...task.dueDate !== void 0 && { due_date: task.dueDate || null },
    ...task.assigneeId !== void 0 && { assignee_id: task.assigneeId ? Number(task.assigneeId) : null },
    ...task.teamId !== void 0 && { team_id: task.teamId ? Number(task.teamId) : null },
    ...task.tags !== void 0 && { tags: task.tags },
    ...task.projectId !== void 0 && {
      project_id: task.projectId
    }
  };
}
function mapApiEventToUi(event) {
  return {
    id: String(event.id),
    title: event.title,
    description: event.description ?? "",
    date: event.date ?? "",
    time: event.time ?? "",
    location: event.location ?? "",
    bannerUrl: event.banner_url ?? "",
    targetAudience: event.target_audience ?? [],
    status: event.status,
    createdAt: event.created_at?.split("T")[0] ?? "",
    sentAt: event.sent_at ?? void 0
  };
}
function mapUiEventToApi(event) {
  return {
    title: event.title,
    description: event.description,
    date: event.date,
    time: event.time,
    location: event.location,
    banner_url: event.bannerUrl,
    target_audience: event.targetAudience,
    status: event.status,
    project_id: event.projectId ?? null
  };
}
function mapApiMessageToUi(msg) {
  return {
    id: String(msg.id),
    senderId: String(msg.sender_id),
    content: msg.content,
    type: msg.type ?? "text",
    timestamp: msg.timestamp ?? "",
    blocked: msg.blocked ?? false,
    imageUrl: msg.image_url ?? void 0
  };
}
function mapApiGroupToUi(group) {
  return {
    id: String(group.id),
    name: group.name,
    type: group.type ?? "general",
    teamId: group.team_id ? String(group.team_id) : void 0,
    memberIds: (group.member_ids ?? []).map(String),
    messages: (group.messages ?? []).map(mapApiMessageToUi),
    lastActivity: group.last_activity ?? ""
  };
}
function mapApiChatToUi(chat) {
  const [a, b] = chat.participant_ids ?? [0, 0];
  return {
    id: String(chat.id),
    participantIds: [String(a), String(b)],
    messages: (chat.messages ?? []).map(mapApiMessageToUi),
    lastActivity: chat.last_activity ?? ""
  };
}
function mapApiInteractionToUi(interaction) {
  return {
    id: String(interaction.id),
    contactId: String(interaction.contact_id),
    type: interaction.type,
    description: interaction.description ?? "",
    createdAt: interaction.created_at ?? "",
    createdBy: String(interaction.created_by)
  };
}
function mapApiDocumentToUi(doc) {
  return {
    id: String(doc.id),
    contactId: String(doc.contact_id),
    name: doc.name,
    originalFilename: doc.original_filename ?? doc.name,
    mimeType: doc.mime_type ?? "",
    fileType: doc.file_type ?? "other",
    size: typeof doc.size === "number" ? doc.size : 0,
    uploadedAt: doc.uploaded_at ?? "",
    uploadedBy: doc.uploaded_by != null ? String(doc.uploaded_by) : "",
    hasFile: doc.has_file ?? false
  };
}
function mapApiModerationAlertToUi(alert) {
  return {
    id: String(alert.id),
    userId: String(alert.user_id),
    context: alert.context,
    contextId: String(alert.context_id),
    contextName: alert.context_name ?? "",
    content: alert.content,
    timestamp: alert.timestamp ?? "",
    status: alert.status
  };
}
export {
  mapApiChatToUi,
  mapApiContactToUi,
  mapApiDocumentToUi,
  mapApiEventToUi,
  mapApiGroupToUi,
  mapApiInteractionToUi,
  mapApiMessageToUi,
  mapApiModerationAlertToUi,
  mapApiTaskToUi,
  mapApiTeamToUi,
  mapUiContactToApi,
  mapUiEventToApi,
  mapUiTaskToApi
};
