import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Sun, Moon, User, Bell, Palette, ChevronRight, Check } from "../components/ui/Icons";
import { motion } from "motion/react";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { useTeams } from "../hooks/useTeams";
import { Avatar } from "../components/ui/Avatar";
import { RoleBadge, StatusBadge } from "../components/ui/Badge";
import { usersApi } from "../services/api";
function Settings() {
  const { currentUser, setCurrentUser, darkMode, setDarkMode } = useApp();
  const { updateUser } = useAuth();
  const { teams } = useTeams();
  const [profileForm, setProfileForm] = useState({ name: currentUser.name, email: currentUser.email, position: currentUser.position });
  const [activeSection, setActiveSection] = useState("perfil");
  const [savingProfile, setSavingProfile] = useState(false);
  const team = teams.find((t) => t.id === currentUser.teamId);
  const handleSaveProfile = async () => {
    if (!profileForm.name.trim() || !profileForm.email.trim()) {
      toast.error("Nome e e-mail s\xE3o obrigat\xF3rios.");
      return;
    }
    setSavingProfile(true);
    try {
      const updatedUser = await usersApi.updateMe({
        name: profileForm.name,
        email: profileForm.email
      });
      updateUser({
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        username: updatedUser.username,
        role: updatedUser.role,
        is_super_admin: updatedUser.is_super_admin,
        status: updatedUser.status
      });
      setCurrentUser({
        ...currentUser,
        ...profileForm,
        name: updatedUser.name,
        email: updatedUser.email
      });
      toast.success("Perfil atualizado!");
    } catch (error) {
      toast.error(error?.message ?? "Erro ao atualizar perfil.");
    } finally {
      setSavingProfile(false);
    }
  };
  const inputCls = "w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-400 transition-all";
  const labelCls = "block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5";
  const SECTIONS = [
    { id: "perfil", label: "Perfil", icon: User },
    { id: "aparencia", label: "Apar\xEAncia", icon: Palette },
    { id: "notificacoes", label: "Notifica\xE7\xF5es", icon: Bell }
  ];
  return /* @__PURE__ */ jsx("div", { className: "p-4 lg:p-6", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-4 gap-4", children: [
    /* @__PURE__ */ jsx("div", { className: "lg:col-span-1", children: /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden", children: [
      /* @__PURE__ */ jsxs("div", { className: "p-5 border-b border-gray-100 dark:border-gray-800 text-center", children: [
        /* @__PURE__ */ jsx("div", { className: "flex justify-center mb-3", children: /* @__PURE__ */ jsx(Avatar, { name: currentUser.name, size: "xl", status: currentUser.status }) }),
        /* @__PURE__ */ jsx("p", { className: "text-sm font-bold text-gray-900 dark:text-white", children: currentUser.name }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-400 mb-2", children: currentUser.position }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-center gap-2", children: [
          /* @__PURE__ */ jsx(RoleBadge, { role: currentUser.role }),
          /* @__PURE__ */ jsx(StatusBadge, { status: currentUser.status })
        ] }),
        team && /* @__PURE__ */ jsx("span", { className: `inline-block mt-2 text-xs px-2 py-0.5 rounded-full ${team.bgColor} ${team.textColor} font-medium`, children: team.name })
      ] }),
      /* @__PURE__ */ jsx("nav", { className: "p-2", children: SECTIONS.map(({ id, label, icon: Icon }) => /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setActiveSection(id),
          className: `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeSection === id ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400" : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"}`,
          children: [
            /* @__PURE__ */ jsx(Icon, { className: "w-4 h-4" }),
            /* @__PURE__ */ jsx("span", { className: "flex-1 text-left", children: label }),
            /* @__PURE__ */ jsx(ChevronRight, { className: `w-3.5 h-3.5 ${activeSection === id ? "text-indigo-400" : "text-gray-300"}` })
          ]
        },
        id
      )) })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "lg:col-span-3", children: /* @__PURE__ */ jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        className: "bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6",
        children: [
          activeSection === "perfil" && /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
            /* @__PURE__ */ jsx("h2", { className: "text-base font-bold text-gray-900 dark:text-white", children: "Meu Perfil" }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "sm:col-span-2", children: [
                /* @__PURE__ */ jsx("label", { className: labelCls, children: "Nome completo" }),
                /* @__PURE__ */ jsx("input", { type: "text", value: profileForm.name, onChange: (e) => setProfileForm((p) => ({ ...p, name: e.target.value })), className: inputCls })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: labelCls, children: "Email" }),
                /* @__PURE__ */ jsx("input", { type: "email", value: profileForm.email, onChange: (e) => setProfileForm((p) => ({ ...p, email: e.target.value })), className: inputCls })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { className: labelCls, children: "Cargo" }),
                /* @__PURE__ */ jsx("input", { type: "text", value: profileForm.position, onChange: (e) => setProfileForm((p) => ({ ...p, position: e.target.value })), className: inputCls })
              ] })
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: handleSaveProfile,
                disabled: savingProfile,
                className: "px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium hover:opacity-90 shadow-md transition-opacity disabled:opacity-60",
                children: savingProfile ? "Salvando\u2026" : "Salvar Altera\xE7\xF5es"
              }
            )
          ] }),
          activeSection === "aparencia" && /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
            /* @__PURE__ */ jsx("h2", { className: "text-base font-bold text-gray-900 dark:text-white", children: "Apar\xEAncia" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: labelCls, children: "Tema" }),
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3 max-w-sm", children: [
                /* @__PURE__ */ jsxs(
                  "button",
                  {
                    onClick: () => setDarkMode(false),
                    className: `flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${!darkMode ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30" : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"}`,
                    children: [
                      /* @__PURE__ */ jsx("div", { className: "w-12 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center shadow-sm", children: /* @__PURE__ */ jsx(Sun, { className: "w-4 h-4 text-amber-400" }) }),
                      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
                        !darkMode && /* @__PURE__ */ jsx(Check, { className: "w-3.5 h-3.5 text-indigo-600" }),
                        /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-gray-900 dark:text-white", children: "Claro" })
                      ] })
                    ]
                  }
                ),
                /* @__PURE__ */ jsxs(
                  "button",
                  {
                    onClick: () => setDarkMode(true),
                    className: `flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${darkMode ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30" : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"}`,
                    children: [
                      /* @__PURE__ */ jsx("div", { className: "w-12 h-8 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center shadow-sm", children: /* @__PURE__ */ jsx(Moon, { className: "w-4 h-4 text-indigo-400" }) }),
                      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
                        darkMode && /* @__PURE__ */ jsx(Check, { className: "w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" }),
                        /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-gray-900 dark:text-white", children: "Escuro" })
                      ] })
                    ]
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/40", children: [
              /* @__PURE__ */ jsxs("p", { className: "text-sm font-medium text-indigo-800 dark:text-indigo-300 mb-0.5", children: [
                "Tema atual: ",
                darkMode ? "\u{1F319} Escuro" : "\u2600\uFE0F Claro"
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-indigo-600/70 dark:text-indigo-400/70", children: "Sua prefer\xEAncia \xE9 salva automaticamente." })
            ] })
          ] }),
          activeSection === "notificacoes" && /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
            /* @__PURE__ */ jsx("h2", { className: "text-base font-bold text-gray-900 dark:text-white", children: "Notifica\xE7\xF5es" }),
            [
              { label: "Novas mensagens no grupo", sublabel: "Receba alertas de mensagens em grupos", defaultChecked: true },
              { label: "Mensagens privadas", sublabel: "Alertas de chat privado", defaultChecked: true },
              { label: "Eventos agendados", sublabel: "Lembretes antes dos eventos", defaultChecked: true },
              { label: "Tarefas atrasadas", sublabel: "Alertas de tarefas com prazo vencido", defaultChecked: true },
              { label: "Alertas de modera\xE7\xE3o", sublabel: "S\xF3 vis\xEDvel para admins", defaultChecked: currentUser.role === "admin" },
              { label: "Novos membros na equipe", sublabel: "Quando algu\xE9m entra na equipe", defaultChecked: false }
            ].map(({ label, sublabel, defaultChecked }) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-900 dark:text-white", children: label }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-400", children: sublabel })
              ] }),
              /* @__PURE__ */ jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [
                /* @__PURE__ */ jsx("input", { type: "checkbox", defaultChecked, className: "sr-only peer" }),
                /* @__PURE__ */ jsx("div", { className: "w-10 h-5 bg-gray-200 dark:bg-gray-700 peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:bg-indigo-600 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" })
              ] })
            ] }, label))
          ] })
        ]
      },
      activeSection
    ) })
  ] }) });
}
export {
  Settings as default
};
