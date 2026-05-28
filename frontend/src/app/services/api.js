const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api';
const TOKEN_KEY = 'venkern_token';
function withQuery(path, query) {
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
async function request(path, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY);
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? {
        Authorization: `Bearer ${token}`
      } : {}),
      ...(options.headers ?? {})
    },
    ...options
  });
  if (response.status === 401) {
    localStorage.removeItem(TOKEN_KEY);
    window.location.href = '/login';
    throw new Error('Sessão expirada. Faça login novamente.');
  }
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message ?? body.error ?? `Erro HTTP ${response.status}`);
  }
  if (response.status === 204) return null;
  return response.json();
}
export const api = {
  get: path => request(path),
  post: (path, body) => request(path, {
    method: 'POST',
    body: JSON.stringify(body)
  }),
  put: (path, body) => request(path, {
    method: 'PUT',
    body: JSON.stringify(body)
  }),
  patch: (path, body) => request(path, {
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined
  }),
  delete: path => request(path, {
    method: 'DELETE'
  }),
  postFile: async (path, body) => {
    const token = localStorage.getItem(TOKEN_KEY);
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      body,
      headers: token ? {
        Authorization: `Bearer ${token}`
      } : {}
    });
    if (response.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      window.location.href = '/login';
      throw new Error('Sessão expirada. Faça login novamente.');
    }
    if (!response.ok) {
      const b = await response.json().catch(() => ({}));
      throw new Error(b.message ?? b.error ?? `Erro HTTP ${response.status}`);
    }
    if (response.status === 204) return null;
    return response.json();
  }
};

// ── Domain helpers ─────────────────────────────────────────────────────────

export const contactsApi = {
  list: query => api.get(withQuery('/contacts', query)),
  get: id => api.get(`/contacts/${id}`),
  create: body => api.post('/contacts', body),
  update: (id, body) => api.put(`/contacts/${id}`, body),
  remove: id => api.delete(`/contacts/${id}`),
  favorite: (id, value) => api.patch(`/contacts/${id}/favorite`, value === undefined ? undefined : {
    is_favorite: value
  })
};
export const teamsApi = {
  list: query => api.get(withQuery('/teams', query)),
  get: id => api.get(`/teams/${id}`),
  create: body => api.post('/teams', body),
  update: (id, body) => api.put(`/teams/${id}`, body),
  remove: id => api.delete(`/teams/${id}`),
  addMember: (teamId, body) => api.post(`/teams/${teamId}/members`, body),
  removeMember: (teamId, contactId) => api.delete(`/teams/${teamId}/members/${contactId}`),
  searchCandidates: (teamId, q) => api.get(`/teams/${teamId}/candidates?q=${encodeURIComponent(q)}`)
};
export const usersApi = {
  search: q => api.get(`/auth/users/search?q=${encodeURIComponent(q)}`),
  updateMe: body => api.patch('/users/me', body)
};
export const tasksApi = {
  list: query => api.get(withQuery('/tasks', query)),
  kanban: query => api.get(withQuery('/tasks/kanban', query)),
  get: id => api.get(`/tasks/${id}`),
  create: body => api.post('/tasks', body),
  update: (id, body) => api.put(`/tasks/${id}`, body),
  remove: id => api.delete(`/tasks/${id}`),
  moveStatus: (id, status) => api.patch(`/tasks/${id}/status`, {
    status
  }),
  accept: id => api.patch(`/tasks/${id}/accept`),
  complete: (id, body) => api.postFile(`/tasks/${id}/complete`, body),
  approve: id => api.patch(`/tasks/${id}/approve`)
};
export const eventsApi = {
  list: query => api.get(withQuery('/events', query)),
  get: id => api.get(`/events/${id}`),
  create: body => api.post('/events', body),
  update: (id, body) => api.put(`/events/${id}`, body),
  remove: id => api.delete(`/events/${id}`),
  send: id => api.patch(`/events/${id}/send`)
};
export const groupsApi = {
  list: query => api.get(withQuery('/groups', query)),
  get: id => api.get(`/groups/${id}`),
  create: body => api.post('/groups', body),
  update: (id, body) => api.put(`/groups/${id}`, body),
  remove: id => api.delete(`/groups/${id}`),
  messages: id => api.get(`/groups/${id}/messages`),
  sendMessage: (id, body) => api.post(`/groups/${id}/messages`, body)
};
export const chatsApi = {
  list: (participantIdOrProjectId, projectId) => {
    if (projectId !== undefined) {
      return api.get(withQuery('/chats', {
        participant_id: participantIdOrProjectId,
        project_id: projectId
      }));
    }
    return api.get(withQuery('/chats', participantIdOrProjectId ? {
      project_id: participantIdOrProjectId
    } : undefined));
  },
  get: id => api.get(`/chats/${id}`),
  create: body => api.post('/chats', body),
  messages: id => api.get(`/chats/${id}/messages`),
  sendMessage: (id, body) => api.post(`/chats/${id}/messages`, body)
};
export const interactionsApi = {
  list: contactId => api.get(contactId ? `/contact-interactions?contact_id=${contactId}` : '/contact-interactions'),
  create: body => api.post('/contact-interactions', body),
  remove: id => api.delete(`/contact-interactions/${id}`)
};
export const documentsApi = {
  list: contactId => api.get(contactId ? `/contact-documents?contact_id=${contactId}` : '/contact-documents'),
  upload: async (contactId, file, uploadedBy) => {
    const body = new FormData();
    body.append('contact_id', contactId);
    body.append('name', file.name);
    body.append('file', file);
    if (uploadedBy) body.append('uploaded_by', uploadedBy);
    return api.postFile('/contact-documents', body);
  },
  download: async (documentId, filename) => {
    const token = localStorage.getItem(TOKEN_KEY);
    const response = await fetch(`${API_BASE_URL}/contact-documents/${documentId}/download`, {
      headers: token ? {
        Authorization: `Bearer ${token}`
      } : {}
    });
    if (response.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      window.location.href = '/login';
      throw new Error('Sessão expirada. Faça login novamente.');
    }
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.message ?? body.error ?? `Erro HTTP ${response.status}`);
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'documento';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
  create: body => api.post('/contact-documents', body),
  remove: id => api.delete(`/contact-documents/${id}`)
};
export const moderationApi = {
  list: query => api.get(withQuery('/moderation', query)),
  get: id => api.get(`/moderation/${id}`),
  create: body => api.post('/moderation', body),
  resolve: id => api.patch(`/moderation/${id}/resolve`),
  dismiss: id => api.patch(`/moderation/${id}/dismiss`),
  remove: id => api.delete(`/moderation/${id}`)
};
export const dashboardApi = {
  summary: projectId => api.get(withQuery('/dashboard/summary', {
    project_id: projectId
  }))
};
export const notificationsApi = {
  list: () => api.get('/notifications'),
  markRead: id => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all')
};
export const reportsApi = {
  summary: projectId => api.get(`/projects/${projectId}/reports/summary`),
  tasks: projectId => api.get(`/projects/${projectId}/reports/tasks`),
  contacts: projectId => api.get(`/projects/${projectId}/reports/contacts`),
  activity: projectId => api.get(`/projects/${projectId}/reports/activity`)
};
export const invitationsApi = {
  mine: () => api.get('/invitations/me'),
  accept: id => api.post(`/invitations/${id}/accept`, {}),
  refuse: id => api.post(`/invitations/${id}/refuse`, {})
};
export const inviteLinkApi = {
  get: token => api.get(`/invites/${token}`),
  accept: token => api.post(`/invites/${token}/accept`, {})
};
export const projectsApi = {
  list: () => api.get('/projects'),
  create: body => api.post('/projects', body),
  members: projectId => api.get(`/projects/${projectId}/members`),
  listInvites: projectId => api.get(`/projects/${projectId}/invites`),
  inviteMemberByUsername: (projectId, body) => api.post(`/projects/${projectId}/members/by-username`, body),
  createInvite: (projectId, body) => api.post(`/projects/${projectId}/invites`, body),
  revokeInvite: (projectId, inviteId) => api.post(`/projects/${projectId}/invites/${inviteId}/revoke`, {}),
  changeMemberRole: (projectId, memberId, role) => api.patch(`/projects/${projectId}/members/${memberId}/role`, {
    role
  }),
  removeMember: (projectId, memberId) => api.delete(`/projects/${projectId}/members/${memberId}`)
};