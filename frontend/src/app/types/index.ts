export type UserRole = 'admin' | 'professional';
export type UserStatus = 'online' | 'offline' | 'busy' | 'away';
export type TaskColumn = 'todo' | 'in_progress' | 'review' | 'done' | 'late';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type EventStatus = 'draft' | 'scheduled' | 'sent' | 'completed';
export type MessageType = 'text' | 'image' | 'blocked' | 'event_banner';
export type ModerationStatus = 'pending' | 'resolved' | 'dismissed';

export type InteractionType = 'call' | 'whatsapp' | 'email' | 'meeting' | 'note';

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  teamId: string;
  position: string;
  status: UserStatus;
  notes: string;
  createdAt: string;
  origin?: string;
  nextAction?: string;
  nextActionDate?: string;
  responsibleId?: string;
  isFavorite?: boolean;
  updatedAt?: string;
}

export interface ContactInteraction {
  id: string;
  contactId: string;
  type: InteractionType;
  description: string;
  createdAt: string;
  createdBy: string;
}

export interface ContactDocument {
  id: string;
  contactId: string;
  name: string;
  originalFilename: string;
  mimeType: string;
  fileType: string;
  size: number;
  uploadedAt: string;
  uploadedBy: string;
  hasFile: boolean;
}

export interface DashboardSummary {
  total_contacts: number;
  favorite_contacts: number;
  total_teams: number;
  total_tasks: number;
  todo_tasks: number;
  in_progress_tasks: number;
  review_tasks: number;
  done_tasks: number;
  late_tasks: number;
  high_priority_tasks: number;
  urgent_priority_tasks: number;
  unassigned_tasks: number;
  total_events: number;
  draft_events: number;
  scheduled_events: number;
  sent_events: number;
  total_groups: number;
}

export interface Team {
  id: string;
  name: string;
  color: string;
  bgColor: string;
  textColor: string;
  description: string;
  memberIds: string[];
  membersCount: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  column: TaskColumn;
  teamId: string;
  assigneeId: string;
  assigneeName?: string;
  priority: TaskPriority;
  dueDate: string;
  createdAt: string;
  tags: string[];
  acceptedAt?: string;
  completionNote?: string;
  completionFileUrl?: string;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  type: MessageType;
  timestamp: string;
  blocked: boolean;
  imageUrl?: string;
}

export interface Group {
  id: string;
  name: string;
  type: 'team' | 'general';
  teamId?: string;
  memberIds: string[];
  messages: Message[];
  lastActivity: string;
}

export interface ChatConversation {
  id: string;
  participantIds: [string, string];
  messages: Message[];
  lastActivity: string;
}

export interface AppEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  bannerUrl: string;
  targetAudience: string[];
  status: EventStatus;
  createdAt: string;
  sentAt?: string;
}

export interface ModerationAlert {
  id: string;
  userId: string;
  context: 'group' | 'chat';
  contextId: string;
  contextName: string;
  content: string;
  timestamp: string;
  status: ModerationStatus;
}

export interface AppUser {
  id: string;
  contactId?: string;
  name: string;
  email: string;
  username?: string;
  role: UserRole;
  teamId: string;
  position: string;
  status: UserStatus;
}
