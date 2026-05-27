import { jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { contactsApi } from "../services/api";
import { mapApiContactToUi } from "../services/mappers";
import { useAuth } from "./AuthContext";
import { useProject } from "./ProjectContext";
const THEME_KEY = "venkern_dark_mode";
const emptyUser = {
  id: "",
  contactId: void 0,
  name: "",
  email: "",
  username: void 0,
  role: "professional",
  teamId: "",
  position: "",
  status: "offline"
};
const AppContext = createContext(null);
function AppProvider({ children }) {
  const { currentProject } = useProject();
  const { user: authUser } = useAuth();
  const baseUser = useMemo(() => authUser ? {
    id: String(authUser.id),
    contactId: void 0,
    name: authUser.name,
    email: authUser.email,
    username: authUser.username,
    role: authUser.role,
    teamId: "",
    position: "",
    status: "online"
  } : emptyUser, [authUser]);
  const [currentUser, setCurrentUser] = useState(baseUser);
  const [darkMode, setDarkModeState] = useState(() => localStorage.getItem(THEME_KEY) === "true");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useEffect(() => {
    setCurrentUser((prev) => {
      if (!authUser) {
        return emptyUser;
      }
      return {
        ...prev,
        ...baseUser,
        contactId: prev.contactId,
        teamId: prev.teamId,
        position: prev.position,
        status: "online"
      };
    });
  }, [authUser, baseUser]);
  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [darkMode]);
  useEffect(() => {
    let cancelled = false;
    async function hydrateContactProfile() {
      if (!authUser || !currentProject) {
        setCurrentUser((prev) => ({
          ...prev,
          contactId: void 0,
          teamId: "",
          position: "",
          status: authUser ? "online" : "offline"
        }));
        return;
      }
      try {
        const response = await contactsApi.list({
          project_id: currentProject.id,
          per_page: 200,
          search: authUser.email
        });
        const matches = (response.data ?? []).map(mapApiContactToUi).filter((contact) => contact.email === authUser.email);
        if (cancelled) return;
        const linkedContact = matches[0];
        setCurrentUser((prev) => ({
          ...prev,
          contactId: linkedContact?.id,
          teamId: linkedContact?.teamId ?? "",
          position: linkedContact?.position ?? "",
          status: "online"
        }));
      } catch {
        if (cancelled) return;
        setCurrentUser((prev) => ({
          ...prev,
          contactId: void 0,
          teamId: "",
          position: "",
          status: "online"
        }));
      }
    }
    hydrateContactProfile();
    return () => {
      cancelled = true;
    };
  }, [authUser, currentProject]);
  const setDarkMode = (v) => {
    setDarkModeState(v);
    localStorage.setItem(THEME_KEY, String(v));
  };
  return /* @__PURE__ */ jsx(AppContext.Provider, { value: {
    currentUser,
    darkMode,
    sidebarOpen,
    setDarkMode,
    setSidebarOpen,
    setCurrentUser
  }, children });
}
function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
export {
  AppProvider,
  useApp
};
