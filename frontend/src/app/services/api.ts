const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api';
const TOKEN_KEY = 'venkern_token';

function withQuery(path: string, query?: string | URLSearchParams | Record<string, string | number | boolean | null | undefined>) {
  if (!query) return path;
  if (typeof query === 'string') return query ? `${path}?${query}` : path;
  if (query instanceof URLSearchParams) {
    const qs = query.toString();
    return qs ? `${path}?${qs}` : path;
  }

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value));
    }
  }
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
    ...options,
  });

  if (response.status === 401) {
    localStorage.removeItem(TOKEN_KEY);
    window.location.href = '/login';
    throw new Error('Sessão expirada. Faça login novamente.');
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as any;
    throw new Error(body.message ?? body.error ?? `Erro HTTP ${response.status}`);
  }

  if (response.status === 204) return null as unknown as T;
  return response.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) => request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  postFile: async <T>(path: string, body: FormData): Promise<T> => {
    const token = localStorage.getItem(TOKEN_KEY);
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      body,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (response.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      window.location.href = '/login';
      throw new Error('Sessão expirada. Faça login novamente.');
    }
    if (!response.ok) {
      const b = await response.json().catch(() => ({})) as any;
      throw new Error(b.message ?? b.error ?? `Erro HTTP ${response.status}`);
    }
    if (response.status === 204) return null as unknown as T;
    return response.json() as Promise<T>;
  },
};

// ── Domain helpers ─────────────────────────────────────────────────────────

export const contactsApi = {
  list: (query?: string | URLSearchParams | Record<string, string | number | boolean | null | undefined>) =>
    api.get<any>(withQuery('/contacts', query)),
  get: (id: string) => api.get<any>(`/contacts/${id}`),
  create: (body: unknown) => api.post<any>('/contacts', body),
  update: (id: string, body: unknown) => api.put<any>(`/contacts/${id}`, body),
  remove: (id: string) => api.delete<any>(`/contacts/${id}`),
  favorite: (id: string, value?: boolean) =>
    api.patch<any>(`/contacts/${id}/favorite`, value === undefined ? undefined : { is_favorite: value }),
};

export const teamsApi = {
  list: (query?: string | URLSearchParams | Record<string, string | number | boolean | null | undefined>) =>
    api.get<any[]>(withQuery('/teams', query)),
  get: (id: string) => api.get<any>(`/teams/${id}`),
  create: (body: unknown) => api.post<any>('/teams', body),
  update: (id: string, body: unknown) => api.put<any>(`/teams/${id}`, body),
  remove: (id: string) => api.delete<any>(`/teams/${id}`),
  addMember: (teamId: string, body: { user_id?: number; contact_id?: number }) =>
    api.post<any>(`/teams/${teamId}/members`, body),
  removeMember: (teamId: string, contactId: string) =>
    api.delete<any>(`/teams/${teamId}/members/${contactId}`),
  searchCandidates: (teamId: string, q: string) =>
    api.get<any[]>(`/teams/${teamId}/candidates?q=${encodeURIComponent(q)}`),
};

export const usersApi = {
  search: (q: string) => api.get<any[]>(`/auth/users/search?q=${encodeURIComponent(q)}`),
  updateMe: (body: unknown) => api.patch<any>('/users/me', body),
};

export const tasksApi = {
  list: (query?: string | URLSearchParams | Record<string, string | number | boolean | null | undefined>) =>
    api.get<any>(withQuery('/tasks', query)),
  kanban: (query?: string | URLSearchParams | Record<string, string | number | boolean | null | undefined>) =>
    api.get<any>(withQuery('/tasks/kanban', query)),
  get: (id: string) => api.get<any>(`/tasks/${id}`),
  create: (body: unknown) => api.post<any>('/tasks', body),
  update: (id: string, body: unknown) => api.put<any>(`/tasks/${id}`, body),
  remove: (id: string) => api.delete<any>(`/tasks/${id}`),
  moveStatus: (id: string, status: string) => api.patch<any>(`/tasks/${id}/status`, { status }),
  accept: (id: string) => api.patch<any>(`/tasks/${id}/accept`),
  complete: (id: string, body: FormData) => api.postFile<any>(`/tasks/${id}/complete`, body),
  approve: (id: string) => api.patch<any>(`/tasks/${id}/approve`),
};

export const eventsApi = {
  list: (query?: string | URLSearchParams | Record<string, string | number | boolean | null | undefined>) =>
    api.get<any>(withQuery('/events', query)),
  get: (id: string) => api.get<any>(`/events/${id}`),
  create: (body: unknown) => api.post<any>('/events', body),
  update: (id: string, body: unknown) => api.put<any>(`/events/${id}`, body),
  remove: (id: string) => api.delete<any>(`/events/${id}`),
  send: (id: string) => api.patch<any>(`/events/${id}/send`),
};

export const groupsApi = {
  list: (query?: string | URLSearchParams | Record<string, string | number | boolean | null | undefined>) =>
    api.get<any>(withQuery('/groups', query)),
  get: (id: string) => api.get<any>(`/groups/${id}`),
  create: (body: unknown) => api.post<any>('/groups', body),
  update: (id: string, body: unknown) => api.put<any>(`/groups/${id}`, body),
  remove: (id: string) => api.delete<any>(`/groups/${id}`),
  messages: (id: string) => api.get<any[]>(`/groups/${id}/messages`),
  sendMessage: (id: string, body: unknown) => api.post<any>(`/groups/${id}/messages`, body),
};

export const chatsApi = {
  list: (participantIdOrProjectId?: string, projectId?: string | number) => {
    if (projectId !== undefined) {
      return api.get<any[]>(withQuery('/chats', {
        participant_id: participantIdOrProjectId,
        project_id: projectId,
      }));
    }
    return api.get<any[]>(withQuery('/chats', participantIdOrProjectId ? { project_id: participantIdOrProjectId } : undefined));
  },
  get: (id: string) => api.get<any>(`/chats/${id}`),
  create: (body: unknown) => api.post<any>('/chats', body),
  messages: (id: string) => api.get<any[]>(`/chats/${id}/messages`),
  sendMessage: (id: string, body: unknown) => api.post<any>(`/chats/${id}/messages`, body),
};

export const interactionsApi = {
  list: (contactId?: string) =>
    api.get<any[]>(contactId ? `/contact-interactions?contact_id=${contactId}` : '/contact-interactions'),
  create: (body: unknown) => api.post<any>('/contact-interactions', body),
  remove: (id: string) => api.delete<any>(`/contact-interactions/${id}`),
};

export const documentsApi = {
  list: (contactId?: string) =>
    api.get<any[]>(contactId ? `/contact-documents?contact_id=${contactId}` : '/contact-documents'),
  create: (body: unknown) => api.post<any>('/contact-documents', body),
  remove: (id: string) => api.delete<any>(`/contact-documents/${id}`),
};

export const moderationApi = {
  list: (query?: string | URLSearchParams | Record<string, string | number | boolean | null | undefined>) =>
    api.get<any[]>(withQuery('/moderation', query)),
  get: (id: string) => api.get<any>(`/moderation/${id}`),
  create: (body: unknown) => api.post<any>('/moderation', body),
  resolve: (id: string) => api.patch<any>(`/moderation/${id}/resolve`),
  dismiss: (id: string) => api.patch<any>(`/moderation/${id}/dismiss`),
  remove: (id: string) => api.delete<any>(`/moderation/${id}`),
};

export const dashboardApi = {
  summary: (projectId: string | number) =>
    api.get<any>(withQuery('/dashboard/summary', { project_id: projectId })),
};

export const notificationsApi = {
  list: () => api.get<any[]>('/notifications'),
  markRead: (id: string | number) => api.patch<any>(`/notifications/${id}/read`),
  markAllRead: () => api.patch<any>('/notifications/read-all'),
};

export const reportsApi = {
  summary: (projectId: string | number) =>
    api.get<any>(`/projects/${projectId}/reports/summary`),
  tasks: (projectId: string | number) =>
    api.get<any>(`/projects/${projectId}/reports/tasks`),
  contacts: (projectId: string | number) =>
    api.get<any>(`/projects/${projectId}/reports/contacts`),
  activity: (projectId: string | number) =>
    api.get<any>(`/projects/${projectId}/reports/activity`),
};

export const invitationsApi = {
  mine: () => api.get<any[]>('/invitations/me'),
  accept: (id: string | number) => api.post<any>(`/invitations/${id}/accept`, {}),
  refuse: (id: string | number) => api.post<any>(`/invitations/${id}/refuse`, {}),
};

export const inviteLinkApi = {
  get: (token: string) => api.get<any>(`/invites/${token}`),
  accept: (token: string) => api.post<any>(`/invites/${token}/accept`, {}),
};

export const projectsApi = {
  list: () => api.get<{ data: any[] }>('/projects'),
  create: (body: unknown) => api.post<{ data: any }>('/projects', body),
  members: (projectId: string | number) => api.get<any[]>(`/projects/${projectId}/members`),
  listInvites: (projectId: string | number) => api.get<any[]>(`/projects/${projectId}/invites`),
  inviteMemberByUsername: (projectId: string | number, body: unknown) =>
    api.post<any>(`/projects/${projectId}/members/by-username`, body),
  createInvite: (projectId: string | number, body: unknown) =>
    api.post<any>(`/projects/${projectId}/invites`, body),
  revokeInvite: (projectId: string | number, inviteId: string | number) =>
    api.post<any>(`/projects/${projectId}/invites/${inviteId}/revoke`, {}),
  changeMemberRole: (projectId: string | number, memberId: string | number, role: string) =>
    api.patch<any>(`/projects/${projectId}/members/${memberId}/role`, { role }),
  removeMember: (projectId: string | number, memberId: string | number) =>
    api.delete<any>(`/projects/${projectId}/members/${memberId}`),
};
