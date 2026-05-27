import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { NavLink, useNavigate } from "react-router";
import {
  LayoutDashboard,
  Users,
  Trello,
  MessageSquare,
  MessageCircle,
  CalendarDays,
  Building2,
  Shield,
  BarChart3,
  Settings,
  X,
  LogOut,
  ChevronRight,
  Boxes,
  ChevronDown,
  UserPlus,
  Mail
} from "../ui/Icons";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { Avatar } from "../ui/Avatar";
import { useApp } from "../../context/AppContext";
import { useProject } from "../../context/ProjectContext";
import { useAuth } from "../../context/AuthContext";
const NAV_ITEMS = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Contatos", path: "/contatos", icon: Users },
  { label: "Kanban", path: "/kanban", icon: Trello },
  { label: "Grupos", path: "/grupos", icon: MessageSquare },
  { label: "Chat Privado", path: "/chat", icon: MessageCircle },
  { label: "Eventos", path: "/eventos", icon: CalendarDays },
  { label: "Equipes", path: "/equipes", icon: Building2 }
];
const ADMIN_ITEMS = [
  { label: "Modera\xE7\xE3o", path: "/moderacao", icon: Shield },
  { label: "Relat\xF3rios", path: "/relatorios", icon: BarChart3 }
];
function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useApp();
  const { user: currentUser, projects, logout } = useAuth();
  const { currentProject, setCurrentProject } = useProject();
  const navigate = useNavigate();
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const isAdmin = currentProject?.role === "ADMIN" || currentUser?.is_super_admin;
  const content = /* @__PURE__ */ jsxs("div", { className: "flex flex-col h-full", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 px-6 py-5 flex-shrink-0", children: [
      /* @__PURE__ */ jsx("div", { className: "w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg flex-shrink-0", children: /* @__PURE__ */ jsx(Boxes, { className: "w-5 h-5 text-white" }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "font-bold text-gray-900 dark:text-white text-sm leading-tight", children: "Venkern" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-400", children: "v2.0 \u2014 SaaS" })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          className: "lg:hidden ml-auto p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400",
          onClick: () => setSidebarOpen(false),
          children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" })
        }
      )
    ] }),
    projects.length > 0 && /* @__PURE__ */ jsxs("div", { className: "px-4 mb-3 relative", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setProjectDropdownOpen((v) => !v),
          className: "w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors text-left",
          children: [
            /* @__PURE__ */ jsx("div", { className: "w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsx("span", { className: "text-white text-[10px] font-bold", children: currentProject?.name?.[0] ?? "?" }) }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-indigo-700 dark:text-indigo-300 truncate", children: currentProject?.name ?? "Selecionar projeto" }),
              /* @__PURE__ */ jsx("p", { className: "text-[10px] text-indigo-400", children: currentProject?.role ?? "" })
            ] }),
            /* @__PURE__ */ jsx(ChevronDown, { className: `w-3.5 h-3.5 text-indigo-400 transition-transform ${projectDropdownOpen ? "rotate-180" : ""}` })
          ]
        }
      ),
      projectDropdownOpen && /* @__PURE__ */ jsx("div", { className: "absolute left-4 right-4 top-full mt-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 z-50 overflow-hidden", children: projects.map((p) => /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => {
            setCurrentProject(p);
            setProjectDropdownOpen(false);
          },
          className: `w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${currentProject?.id === p.id ? "bg-indigo-50 dark:bg-indigo-900/30" : ""}`,
          children: [
            /* @__PURE__ */ jsx("div", { className: "w-5 h-5 rounded-md bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsx("span", { className: "text-white text-[9px] font-bold", children: p.name[0] }) }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs font-medium text-gray-800 dark:text-gray-200 truncate", children: p.name }),
              /* @__PURE__ */ jsx("p", { className: "text-[10px] text-gray-400", children: p.role })
            ] })
          ]
        },
        p.id
      )) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "border-t border-gray-100 dark:border-gray-800 mx-4 mb-3" }),
    /* @__PURE__ */ jsxs("nav", { className: "flex-1 overflow-y-auto px-3 space-y-0.5", children: [
      /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-gray-400 uppercase tracking-widest px-3 mb-2", children: "Navega\xE7\xE3o" }),
      NAV_ITEMS.map(({ label, path, icon: Icon }) => /* @__PURE__ */ jsx(
        NavLink,
        {
          to: path,
          end: path === "/",
          onClick: () => setSidebarOpen(false),
          className: ({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${isActive ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-200 dark:shadow-none" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"}`,
          children: ({ isActive }) => /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Icon, { className: `w-4 h-4 flex-shrink-0 ${isActive ? "text-white" : "text-gray-400 group-hover:text-indigo-500"}` }),
            /* @__PURE__ */ jsx("span", { className: "flex-1", children: label }),
            isActive && /* @__PURE__ */ jsx(ChevronRight, { className: "w-3.5 h-3.5 text-white/70" })
          ] })
        },
        path
      )),
      isAdmin && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("div", { className: "border-t border-gray-100 dark:border-gray-800 mx-1 my-3" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-gray-400 uppercase tracking-widest px-3 mb-2", children: "Admin" }),
        ADMIN_ITEMS.map(({ label, path, icon: Icon }) => /* @__PURE__ */ jsx(
          NavLink,
          {
            to: path,
            onClick: () => setSidebarOpen(false),
            className: ({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${isActive ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-200 dark:shadow-none" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"}`,
            children: ({ isActive }) => /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Icon, { className: `w-4 h-4 flex-shrink-0 ${isActive ? "text-white" : "text-gray-400 group-hover:text-indigo-500"}` }),
              /* @__PURE__ */ jsx("span", { className: "flex-1", children: label }),
              label === "Modera\xE7\xE3o" && /* @__PURE__ */ jsx("span", { className: `text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${isActive ? "bg-white/20 text-white" : "bg-red-500 text-white"} hidden`, children: "!" }),
              isActive && /* @__PURE__ */ jsx(ChevronRight, { className: "w-3.5 h-3.5 text-white/70" })
            ] })
          },
          path
        ))
      ] }),
      currentProject && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("div", { className: "border-t border-gray-100 dark:border-gray-800 mx-1 my-3" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-gray-400 uppercase tracking-widest px-3 mb-2", children: "Projeto" }),
        isAdmin && /* @__PURE__ */ jsx(
          NavLink,
          {
            to: "/membros",
            onClick: () => setSidebarOpen(false),
            className: ({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${isActive ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-200 dark:shadow-none" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"}`,
            children: ({ isActive }) => /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(UserPlus, { className: `w-4 h-4 flex-shrink-0 ${isActive ? "text-white" : "text-gray-400 group-hover:text-indigo-500"}` }),
              /* @__PURE__ */ jsx("span", { className: "flex-1", children: "Membros" }),
              isActive && /* @__PURE__ */ jsx(ChevronRight, { className: "w-3.5 h-3.5 text-white/70" })
            ] })
          }
        ),
        /* @__PURE__ */ jsx(
          NavLink,
          {
            to: "/convites",
            onClick: () => setSidebarOpen(false),
            className: ({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${isActive ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-200 dark:shadow-none" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"}`,
            children: ({ isActive }) => /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Mail, { className: `w-4 h-4 flex-shrink-0 ${isActive ? "text-white" : "text-gray-400 group-hover:text-indigo-500"}` }),
              /* @__PURE__ */ jsx("span", { className: "flex-1", children: "Convites" }),
              isActive && /* @__PURE__ */ jsx(ChevronRight, { className: "w-3.5 h-3.5 text-white/70" })
            ] })
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "border-t border-gray-100 dark:border-gray-800 mx-1 my-3" }),
      /* @__PURE__ */ jsx(
        NavLink,
        {
          to: "/configuracoes",
          onClick: () => setSidebarOpen(false),
          className: ({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${isActive ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-200 dark:shadow-none" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"}`,
          children: ({ isActive }) => /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Settings, { className: `w-4 h-4 flex-shrink-0 ${isActive ? "text-white" : "text-gray-400 group-hover:text-indigo-500"}` }),
            /* @__PURE__ */ jsx("span", { className: "flex-1", children: "Configura\xE7\xF5es" }),
            isActive && /* @__PURE__ */ jsx(ChevronRight, { className: "w-3.5 h-3.5 text-white/70" })
          ] })
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "border-t border-gray-100 dark:border-gray-800 mx-4 mt-2 mb-0" }),
    /* @__PURE__ */ jsx("div", { className: "p-4", children: /* @__PURE__ */ jsxs(
      "div",
      {
        className: "flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
        onClick: () => {
          navigate("/configuracoes");
          setSidebarOpen(false);
        },
        children: [
          /* @__PURE__ */ jsx(Avatar, { name: currentUser?.name ?? "User", size: "sm" }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-gray-900 dark:text-white truncate", children: currentUser?.name ?? "Usu\xE1rio" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-400 truncate", children: isAdmin ? "Admin" : "Profissional" })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: (e) => {
                e.stopPropagation();
                logout();
              },
              className: "p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-400 transition-colors",
              title: "Sair",
              children: /* @__PURE__ */ jsx(LogOut, { className: "w-4 h-4" })
            }
          )
        ]
      }
    ) })
  ] });
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("aside", { className: "hidden lg:flex flex-col w-64 h-screen bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex-shrink-0 sticky top-0", children: content }),
    /* @__PURE__ */ jsx(AnimatePresence, { children: sidebarOpen && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(
        motion.div,
        {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          className: "lg:hidden fixed inset-0 bg-black/50 z-40",
          onClick: () => setSidebarOpen(false)
        }
      ),
      /* @__PURE__ */ jsx(
        motion.aside,
        {
          initial: { x: -280 },
          animate: { x: 0 },
          exit: { x: -280 },
          transition: { type: "spring", damping: 30, stiffness: 300 },
          className: "lg:hidden fixed left-0 top-0 h-full w-72 bg-white dark:bg-gray-900 z-50 flex flex-col shadow-2xl",
          children: content
        }
      )
    ] }) })
  ] });
}
export {
  Sidebar
};
