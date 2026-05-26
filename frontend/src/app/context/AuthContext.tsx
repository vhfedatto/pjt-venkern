import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api';
const TOKEN_KEY = 'venkern_token';
const PROJECT_KEY = 'venkern_project_id';

export interface AuthProject {
  id: number;
  name: string;
  slug: string;
  description?: string;
  owner_id: number;
  status: string;
  role: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  username?: string;
  role: string;
  is_super_admin?: boolean;
  status?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  projects: AuthProject[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, username?: string) => Promise<void>;
  refreshSession: () => Promise<void>;
  updateUser: (user: AuthUser) => void;
  upsertProject: (project: AuthProject) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

async function authFetch(path: string, body: unknown): Promise<{ access_token: string; user: AuthUser; projects?: AuthProject[] }> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message ?? data.error ?? `Erro ${res.status}`);
  }

  return data;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [projects, setProjects] = useState<AuthProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: verify stored token
  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (!stored) {
      setIsLoading(false);
      return;
    }

    fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${stored}` },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data: AuthUser & { projects?: AuthProject[] }) => {
        setUser(data);
        setToken(stored);
        setProjects(data.projects ?? []);
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const _persist = (t: string, u: AuthUser, p: AuthProject[] = []) => {
    localStorage.setItem(TOKEN_KEY, t);
    setToken(t);
    setUser(u);
    setProjects(p);
  };

  const refreshSession = useCallback(async () => {
    const activeToken = localStorage.getItem(TOKEN_KEY);
    if (!activeToken) {
      setUser(null);
      setToken(null);
      setProjects([]);
      return;
    }

    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${activeToken}` },
    });

    if (!res.ok) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(PROJECT_KEY);
      setUser(null);
      setToken(null);
      setProjects([]);
      throw new Error('Sessão expirada. Faça login novamente.');
    }

    const data = await res.json() as AuthUser & { projects?: AuthProject[] };
    setUser(data);
    setToken(activeToken);
    setProjects(data.projects ?? []);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { access_token, user: u, projects: p } = await authFetch('/auth/login', { email, password });
    localStorage.removeItem(PROJECT_KEY);
    _persist(access_token, u, p ?? []);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, username?: string) => {
    const { access_token, user: u, projects: p } = await authFetch('/auth/register', { name, email, password, username: username || undefined });
    localStorage.removeItem(PROJECT_KEY);
    _persist(access_token, u, p ?? []);
  }, []);

  const updateUser = useCallback((nextUser: AuthUser) => {
    setUser(nextUser);
  }, []);

  const upsertProject = useCallback((project: AuthProject) => {
    setProjects((prev) => {
      const exists = prev.some((item) => item.id === project.id);
      return exists ? prev.map((item) => (item.id === project.id ? project : item)) : [...prev, project];
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(PROJECT_KEY);
    setToken(null);
    setUser(null);
    setProjects([]);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        projects,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        refreshSession,
        updateUser,
        upsertProject,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
