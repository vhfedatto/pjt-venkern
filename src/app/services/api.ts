const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Erro HTTP ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) => request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

// ── Domain helpers ─────────────────────────────────────────────────────────

export const contactsApi = {
  list: () => api.get<any[]>('/contacts'),
  get: (id: string) => api.get<any>(`/contacts/${id}`),
  create: (body: unknown) => api.post<any>('/contacts', body),
  update: (id: string, body: unknown) => api.put<any>(`/contacts/${id}`, body),
  remove: (id: string) => api.delete<any>(`/contacts/${id}`),
};

export const teamsApi = {
  list: () => api.get<any[]>('/teams'),
  get: (id: string) => api.get<any>(`/teams/${id}`),
  create: (body: unknown) => api.post<any>('/teams', body),
  update: (id: string, body: unknown) => api.put<any>(`/teams/${id}`, body),
  remove: (id: string) => api.delete<any>(`/teams/${id}`),
};

export const tasksApi = {
  list: () => api.get<any[]>('/tasks'),
  get: (id: string) => api.get<any>(`/tasks/${id}`),
  create: (body: unknown) => api.post<any>('/tasks', body),
  update: (id: string, body: unknown) => api.put<any>(`/tasks/${id}`, body),
  remove: (id: string) => api.delete<any>(`/tasks/${id}`),
};

export const eventsApi = {
  list: () => api.get<any[]>('/events'),
  get: (id: string) => api.get<any>(`/events/${id}`),
  create: (body: unknown) => api.post<any>('/events', body),
  update: (id: string, body: unknown) => api.put<any>(`/events/${id}`, body),
  remove: (id: string) => api.delete<any>(`/events/${id}`),
  send: (id: string) => api.patch<any>(`/events/${id}/send`),
};

export const groupsApi = {
  list: () => api.get<any[]>('/groups'),
  get: (id: string) => api.get<any>(`/groups/${id}`),
  create: (body: unknown) => api.post<any>('/groups', body),
  update: (id: string, body: unknown) => api.put<any>(`/groups/${id}`, body),
  remove: (id: string) => api.delete<any>(`/groups/${id}`),
  messages: (id: string) => api.get<any[]>(`/groups/${id}/messages`),
  sendMessage: (id: string, body: unknown) => api.post<any>(`/groups/${id}/messages`, body),
};

export const chatsApi = {
  list: (participantId?: string) =>
    api.get<any[]>(participantId ? `/chats?participant_id=${participantId}` : '/chats'),
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
  list: (status?: string) =>
    api.get<any[]>(status ? `/moderation?status=${status}` : '/moderation'),
  get: (id: string) => api.get<any>(`/moderation/${id}`),
  create: (body: unknown) => api.post<any>('/moderation', body),
  resolve: (id: string) => api.patch<any>(`/moderation/${id}/resolve`),
  dismiss: (id: string) => api.patch<any>(`/moderation/${id}/dismiss`),
  remove: (id: string) => api.delete<any>(`/moderation/${id}`),
};

export const dashboardApi = {
  summary: () => api.get<any>('/dashboard/summary'),
};

