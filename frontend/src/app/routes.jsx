import { Fragment, jsx } from "react/jsx-runtime";
import { createBrowserRouter, Navigate, useParams } from "react-router";
import { Root } from "./components/layout/Root";
import Dashboard from "./pages/Dashboard";
import Contacts from "./pages/Contacts";
import ContactDetails from "./pages/ContactDetails";
import Kanban from "./pages/Kanban";
import Groups from "./pages/Groups";
import PrivateChat from "./pages/PrivateChat";
import Events from "./pages/Events";
import Teams from "./pages/Teams";
import Moderation from "./pages/Moderation";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ProjectMembers from "./pages/ProjectMembers";
import Invitations from "./pages/Invitations";
import InviteAcceptPage from "./pages/InviteAccept";
import ProjectSelection from "./pages/ProjectSelection";
import { useAuth } from "./context/AuthContext";
import { useProject } from "./context/ProjectContext";
function PrivateRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center", children: /* @__PURE__ */ jsx("div", { className: "h-8 w-8 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" }) });
  }
  return isAuthenticated ? /* @__PURE__ */ jsx(Fragment, { children }) : /* @__PURE__ */ jsx(Navigate, { to: "/login", replace: true });
}
function PublicRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const { currentProject } = useProject();
  if (isLoading) return null;
  return isAuthenticated ? /* @__PURE__ */ jsx(Navigate, { to: currentProject ? "/" : "/empresas", replace: true }) : /* @__PURE__ */ jsx(Fragment, { children });
}
function ProjectRoute({ children }) {
  const { currentProject } = useProject();
  return currentProject ? /* @__PURE__ */ jsx(Fragment, { children }) : /* @__PURE__ */ jsx(Navigate, { to: "/empresas", replace: true });
}
function ProjectSelectionRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const { currentProject } = useProject();
  if (isLoading) return null;
  if (!isAuthenticated) return /* @__PURE__ */ jsx(Navigate, { to: "/login", replace: true });
  return currentProject ? /* @__PURE__ */ jsx(Navigate, { to: "/", replace: true }) : /* @__PURE__ */ jsx(ProjectSelection, {});
}
function InviteAcceptRoute() {
  const { token } = useParams();
  return /* @__PURE__ */ jsx(InviteAcceptPage, { token: token ?? "" });
}
const router = createBrowserRouter([
  // ── Public routes ──────────────────────────────────────────────────────────
  {
    path: "/login",
    element: /* @__PURE__ */ jsx(PublicRoute, { children: /* @__PURE__ */ jsx(Login, {}) })
  },
  {
    path: "/cadastro",
    element: /* @__PURE__ */ jsx(PublicRoute, { children: /* @__PURE__ */ jsx(Register, {}) })
  },
  {
    path: "/esqueceu-senha",
    element: /* @__PURE__ */ jsx(PublicRoute, { children: /* @__PURE__ */ jsx(ForgotPassword, {}) })
  },
  // Public standalone invite page (no layout wrapper, no auth required)
  {
    path: "/invite/:token",
    element: /* @__PURE__ */ jsx(InviteAcceptRoute, {})
  },
  {
    path: "/empresas",
    element: /* @__PURE__ */ jsx(ProjectSelectionRoute, {})
  },
  // ── Protected routes ───────────────────────────────────────────────────────
  {
    path: "/",
    element: /* @__PURE__ */ jsx(PrivateRoute, { children: /* @__PURE__ */ jsx(ProjectRoute, { children: /* @__PURE__ */ jsx(Root, {}) }) }),
    children: [
      { index: true, Component: Dashboard },
      { path: "contatos", Component: Contacts },
      { path: "contatos/:id", Component: ContactDetails },
      { path: "kanban", Component: Kanban },
      { path: "grupos", Component: Groups },
      { path: "chat", Component: PrivateChat },
      { path: "eventos", Component: Events },
      { path: "equipes", Component: Teams },
      { path: "moderacao", Component: Moderation },
      { path: "relatorios", Component: Reports },
      { path: "configuracoes", Component: Settings },
      { path: "membros", Component: ProjectMembers },
      { path: "convites", Component: Invitations }
    ]
  }
]);
export {
  router
};
