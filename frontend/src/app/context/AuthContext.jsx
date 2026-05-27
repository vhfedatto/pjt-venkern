import { jsx } from "react/jsx-runtime";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api";
const TOKEN_KEY = "venkern_token";
const PROJECT_KEY = "venkern_project_id";
const AuthContext = createContext(null);
async function authFetch(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message ?? data.error ?? `Erro ${res.status}`);
  }
  return data;
}
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (!stored) {
      setIsLoading(false);
      return;
    }
    fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${stored}` }
    }).then((res) => res.ok ? res.json() : Promise.reject()).then((data) => {
      setUser(data);
      setToken(stored);
      setProjects(data.projects ?? []);
    }).catch(() => {
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
    }).finally(() => setIsLoading(false));
  }, []);
  const _persist = (t, u, p = []) => {
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
      headers: { Authorization: `Bearer ${activeToken}` }
    });
    if (!res.ok) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(PROJECT_KEY);
      setUser(null);
      setToken(null);
      setProjects([]);
      throw new Error("Sess\xE3o expirada. Fa\xE7a login novamente.");
    }
    const data = await res.json();
    setUser(data);
    setToken(activeToken);
    setProjects(data.projects ?? []);
  }, []);
  const login = useCallback(async (email, password) => {
    const { access_token, user: u, projects: p } = await authFetch("/auth/login", { email, password });
    localStorage.removeItem(PROJECT_KEY);
    _persist(access_token, u, p ?? []);
  }, []);
  const register = useCallback(async (name, email, password, username) => {
    const { access_token, user: u, projects: p } = await authFetch("/auth/register", { name, email, password, username: username || void 0 });
    localStorage.removeItem(PROJECT_KEY);
    _persist(access_token, u, p ?? []);
  }, []);
  const updateUser = useCallback((nextUser) => {
    setUser(nextUser);
  }, []);
  const upsertProject = useCallback((project) => {
    setProjects((prev) => {
      const exists = prev.some((item) => item.id === project.id);
      return exists ? prev.map((item) => item.id === project.id ? project : item) : [...prev, project];
    });
  }, []);
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(PROJECT_KEY);
    setToken(null);
    setUser(null);
    setProjects([]);
  }, []);
  return /* @__PURE__ */ jsx(
    AuthContext.Provider,
    {
      value: {
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
        logout
      },
      children
    }
  );
}
function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
export {
  AuthProvider,
  useAuth
};
