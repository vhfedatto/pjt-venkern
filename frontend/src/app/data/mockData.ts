import type {
  Contact,
  Team,
  Task,
  Group,
  ChatConversation,
  AppEvent,
  ModerationAlert,
  AppUser,
} from '../types';

export const currentUser: AppUser = {
  id: 'user',
  name: 'Usuario',
  email: '',
  role: 'admin',
  teamId: '',
  position: '',
  status: 'online',
};

export const initialTeams: Team[] = [];
export const initialContacts: Contact[] = [];
export const initialTasks: Task[] = [];
export const initialGroups: Group[] = [];
export const initialChats: ChatConversation[] = [];
export const initialEvents: AppEvent[] = [];
export const initialModerationAlerts: ModerationAlert[] = [];
