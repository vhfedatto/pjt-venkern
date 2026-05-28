import React from 'react';
import { createBrowserRouter, Navigate, useParams } from 'react-router';
import { Root } from './components/layout/Root';
import Dashboard from './pages/Dashboard';
import Contacts from './pages/Contacts';
import ContactDetails from './pages/ContactDetails';
import Kanban from './pages/Kanban';
import Groups from './pages/Groups';
import PrivateChat from './pages/PrivateChat';
import Events from './pages/Events';
import Teams from './pages/Teams';
import Moderation from './pages/Moderation';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ProjectMembers from './pages/ProjectMembers';
import Invitations from './pages/Invitations';
import InviteAcceptPage from './pages/InviteAccept';
import ProjectSelection from './pages/ProjectSelection';
import { useAuth } from './context/AuthContext';
import { useProject } from './context/ProjectContext';
function PrivateRoute({
  children
}) {
  const {
    isAuthenticated,
    isLoading
  } = useAuth();
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
      </div>;
  }
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}
function PublicRoute({
  children
}) {
  const {
    isAuthenticated,
    isLoading
  } = useAuth();
  const {
    currentProject
  } = useProject();
  if (isLoading) return null;
  return isAuthenticated ? <Navigate to={currentProject ? "/" : "/empresas"} replace /> : <>{children}</>;
}
function ProjectRoute({
  children
}) {
  const {
    currentProject
  } = useProject();
  return currentProject ? <>{children}</> : <Navigate to="/empresas" replace />;
}
function ProjectSelectionRoute() {
  const {
    isAuthenticated,
    isLoading
  } = useAuth();
  const {
    currentProject
  } = useProject();
  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return currentProject ? <Navigate to="/" replace /> : <ProjectSelection />;
}

/** Standalone wrapper that reads :token param and passes it to InviteAcceptPage */
function InviteAcceptRoute() {
  const {
    token
  } = useParams();
  return <InviteAcceptPage token={token ?? ''} />;
}
export const router = createBrowserRouter([
// ── Public routes ──────────────────────────────────────────────────────────
{
  path: '/login',
  element: <PublicRoute><Login /></PublicRoute>
}, {
  path: '/cadastro',
  element: <PublicRoute><Register /></PublicRoute>
}, {
  path: '/esqueceu-senha',
  element: <PublicRoute><ForgotPassword /></PublicRoute>
},
// Public standalone invite page (no layout wrapper, no auth required)
{
  path: '/invite/:token',
  element: <InviteAcceptRoute />
}, {
  path: '/empresas',
  element: <ProjectSelectionRoute />
},
// ── Protected routes ───────────────────────────────────────────────────────
{
  path: '/',
  element: <PrivateRoute><ProjectRoute><Root /></ProjectRoute></PrivateRoute>,
  children: [{
    index: true,
    Component: Dashboard
  }, {
    path: 'contatos',
    Component: Contacts
  }, {
    path: 'contatos/:id',
    Component: ContactDetails
  }, {
    path: 'kanban',
    Component: Kanban
  }, {
    path: 'grupos',
    Component: Groups
  }, {
    path: 'chat',
    Component: PrivateChat
  }, {
    path: 'eventos',
    Component: Events
  }, {
    path: 'equipes',
    Component: Teams
  }, {
    path: 'moderacao',
    Component: Moderation
  }, {
    path: 'relatorios',
    Component: Reports
  }, {
    path: 'configuracoes',
    Component: Settings
  }, {
    path: 'membros',
    Component: ProjectMembers
  }, {
    path: 'convites',
    Component: Invitations
  }]
}]);