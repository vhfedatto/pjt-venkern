import type {
  AppEvent,
  ChatConversation,
  Contact,
  ContactDocument,
  ContactInteraction,
  Group,
  Message,
  ModerationAlert,
  Task,
  Team,
} from '../types';
import { getTeamColors } from '../utils/teamColors';

export function mapApiContactToUi(contact: any): Contact {
  return {
    id: String(contact.id),
    name: contact.full_name,
    email: contact.email,
    phone: contact.phone,
    role: contact.role === 'admin' ? 'admin' : 'professional',
    teamId: contact.team_id ? String(contact.team_id) : '',
    position: contact.function_type ?? contact.role ?? '',
    status: 'offline',
    notes: contact.notes ?? '',
    origin: contact.origin ?? 'manual',
    nextAction: contact.next_action ?? '',
    nextActionDate: contact.next_action_date ?? '',
    responsibleId: contact.responsible_id ? String(contact.responsible_id) : undefined,
    createdAt: contact.created_at?.split('T')[0] ?? '',
  };
}

export function mapUiContactToApi(contact: Partial<Contact>) {
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
    project_id: (contact as Partial<Contact> & { projectId?: number | null }).projectId ?? null,
  };
}

export function mapApiTeamToUi(team: any): Team {
  const { bg, text } = getTeamColors(team.color ?? '#6366f1');
  return {
    id: String(team.id),
    name: team.name,
    color: team.color ?? '#6366f1',
    bgColor: bg,
    textColor: text,
    description: team.description ?? '',
    memberIds: (team.members ?? []).map((m: any) => String(m.id)),
    membersCount: team.members_count ?? 0,
  };
}

export function mapApiTaskToUi(task: any): Task {
  return {
    id: String(task.id),
    title: task.title,
    description: task.description ?? '',
    column: task.status,
    teamId: task.team?.id ? String(task.team.id) : '',
    assigneeId: task.assignee?.id ? String(task.assignee.id) : '',
    assigneeName: task.assignee?.full_name ?? '',
    priority: task.priority,
    dueDate: task.due_date?.split('T')[0] ?? '',
    createdAt: task.created_at?.split('T')[0] ?? '',
    tags: task.tags ?? [],
    acceptedAt: task.accepted_at ?? undefined,
    completionNote: task.completion_note ?? undefined,
    completionFileUrl: task.completion_file_url ?? undefined,
  };
}

export function mapUiTaskToApi(task: Partial<Task>) {
  return {
    ...(task.title !== undefined && { title: task.title }),
    ...(task.description !== undefined && { description: task.description }),
    ...(task.column !== undefined && { status: task.column }),
    ...(task.priority !== undefined && { priority: task.priority }),
    ...(task.dueDate !== undefined && { due_date: task.dueDate || null }),
    ...(task.assigneeId !== undefined && { assignee_id: task.assigneeId ? Number(task.assigneeId) : null }),
    ...(task.teamId !== undefined && { team_id: task.teamId ? Number(task.teamId) : null }),
    ...(task.tags !== undefined && { tags: task.tags }),
    ...(((task as Partial<Task> & { projectId?: number | null }).projectId) !== undefined && {
      project_id: (task as Partial<Task> & { projectId?: number | null }).projectId,
    }),
  };
}

// ── Events ────────────────────────────────────────────────────────────────────

export function mapApiEventToUi(event: any): AppEvent {
  return {
    id: String(event.id),
    title: event.title,
    description: event.description ?? '',
    date: event.date ?? '',
    time: event.time ?? '',
    location: event.location ?? '',
    bannerUrl: event.banner_url ?? '',
    targetAudience: event.target_audience ?? [],
    status: event.status,
    createdAt: event.created_at?.split('T')[0] ?? '',
    sentAt: event.sent_at ?? undefined,
  };
}

export function mapUiEventToApi(event: Partial<AppEvent>) {
  return {
    title: event.title,
    description: event.description,
    date: event.date,
    time: event.time,
    location: event.location,
    banner_url: event.bannerUrl,
    target_audience: event.targetAudience,
    status: event.status,
    project_id: (event as Partial<AppEvent> & { projectId?: number | null }).projectId ?? null,
  };
}

// ── Groups ────────────────────────────────────────────────────────────────────

export function mapApiMessageToUi(msg: any): Message {
  return {
    id: String(msg.id),
    senderId: String(msg.sender_id),
    content: msg.content,
    type: msg.type ?? 'text',
    timestamp: msg.timestamp ?? '',
    blocked: msg.blocked ?? false,
    imageUrl: msg.image_url ?? undefined,
  };
}

export function mapApiGroupToUi(group: any): Group {
  return {
    id: String(group.id),
    name: group.name,
    type: group.type ?? 'general',
    teamId: group.team_id ? String(group.team_id) : undefined,
    memberIds: (group.member_ids ?? []).map(String),
    messages: (group.messages ?? []).map(mapApiMessageToUi),
    lastActivity: group.last_activity ?? '',
  };
}

// ── Chats ─────────────────────────────────────────────────────────────────────

export function mapApiChatToUi(chat: any): ChatConversation {
  const [a, b] = chat.participant_ids ?? [0, 0];
  return {
    id: String(chat.id),
    participantIds: [String(a), String(b)],
    messages: (chat.messages ?? []).map(mapApiMessageToUi),
    lastActivity: chat.last_activity ?? '',
  };
}

// ── Interactions ─────────────────────────────────────────────────────────────

export function mapApiInteractionToUi(interaction: any): ContactInteraction {
  return {
    id: String(interaction.id),
    contactId: String(interaction.contact_id),
    type: interaction.type,
    description: interaction.description ?? '',
    createdAt: interaction.created_at ?? '',
    createdBy: String(interaction.created_by),
  };
}

// ── Documents ─────────────────────────────────────────────────────────────────

export function mapApiDocumentToUi(doc: any): ContactDocument {
  return {
    id: String(doc.id),
    contactId: String(doc.contact_id),
    name: doc.name,
    originalFilename: doc.original_filename ?? doc.name,
    mimeType: doc.mime_type ?? '',
    fileType: doc.file_type ?? 'other',
    size: typeof doc.size === 'number' ? doc.size : 0,
    uploadedAt: doc.uploaded_at ?? '',
    uploadedBy: doc.uploaded_by != null ? String(doc.uploaded_by) : '',
    hasFile: doc.has_file ?? false,
  };
}

// ── Moderation ────────────────────────────────────────────────────────────────

export function mapApiModerationAlertToUi(alert: any): ModerationAlert {
  return {
    id: String(alert.id),
    userId: String(alert.user_id),
    context: alert.context,
    contextId: String(alert.context_id),
    contextName: alert.context_name ?? '',
    content: alert.content,
    timestamp: alert.timestamp ?? '',
    status: alert.status,
  };
}
