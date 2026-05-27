import { jsx } from "react/jsx-runtime";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
const STORAGE_KEY = "venkern_project_id";
const ProjectContext = createContext(null);
function ProjectProvider({ children }) {
  const { projects, isLoading } = useAuth();
  const [currentProject, setCurrentProjectState] = useState(() => {
    const storedId = localStorage.getItem(STORAGE_KEY);
    if (!storedId) return null;
    return { id: Number(storedId) };
  });
  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (projects.length === 0) {
      localStorage.removeItem(STORAGE_KEY);
      setCurrentProjectState(null);
      return;
    }
    const storedId = localStorage.getItem(STORAGE_KEY);
    if (storedId) {
      const found = projects.find((p) => p.id === Number(storedId));
      if (found) {
        setCurrentProjectState(found);
        return;
      }
    }
    if (currentProject) {
      const hydrated = projects.find((project) => project.id === currentProject.id);
      if (hydrated) {
        setCurrentProjectState(hydrated);
        localStorage.setItem(STORAGE_KEY, String(hydrated.id));
        return;
      }
    }
    const fallback = projects[0];
    setCurrentProjectState(fallback);
    localStorage.setItem(STORAGE_KEY, String(fallback.id));
  }, [currentProject, isLoading, projects]);
  const setCurrentProject = useCallback((project) => {
    localStorage.setItem(STORAGE_KEY, String(project.id));
    setCurrentProjectState(project);
  }, []);
  return /* @__PURE__ */ jsx(ProjectContext.Provider, { value: { currentProject, setCurrentProject }, children });
}
function useProject() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error("useProject must be used within ProjectProvider");
  return ctx;
}
export {
  ProjectProvider,
  useProject
};
