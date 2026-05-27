import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback, useRef } from "react";
import { Plus, Users, Pencil, Trash2, UserPlus, UserMinus, Search, AtSign, Loader2 } from "../components/ui/Icons";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";
import { useProject } from "../context/ProjectContext";
import { Avatar } from "../components/ui/Avatar";
import { Modal, ConfirmModal } from "../components/ui/Modal";
import { teamsApi } from "../services/api";
const emptyForm = { name: "", description: "", color: "#6366f1" };
const PRESET_COLORS = [
  "#6366f1",
  "#ec4899",
  "#10b981",
  "#8b5cf6",
  "#f59e0b",
  "#3b82f6"
];
const inputCls = "w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-400 transition-all placeholder:text-gray-400";
const labelCls = "block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5";
function Teams() {
  const { currentUser } = useApp();
  const { currentProject } = useProject();
  const isAdmin = currentUser.role === "admin";
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTeam, setEditTeam] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteTeamId, setInviteTeamId] = useState(null);
  const [inviteQuery, setInviteQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [inviting, setInviting] = useState(false);
  const searchTimer = useRef(null);
  const selectedTeam = teams.find((t) => t.id === selectedTeamId) ?? null;
  const loadTeams = useCallback(async () => {
    if (!currentProject) {
      setTeams([]);
      setIsLoading(false);
      return;
    }
    try {
      const data = await teamsApi.list({ project_id: currentProject.id });
      setTeams(data);
    } catch {
      toast.error("Erro ao carregar equipes.");
    } finally {
      setIsLoading(false);
    }
  }, [currentProject]);
  useEffect(() => {
    loadTeams();
  }, [loadTeams]);
  const openCreate = () => {
    setEditTeam(null);
    setForm(emptyForm);
    setModalOpen(true);
  };
  const openEdit = (t, e) => {
    e.stopPropagation();
    setEditTeam(t);
    setForm({ name: t.name, description: t.description ?? "", color: t.color ?? "#6366f1" });
    setModalOpen(true);
  };
  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Nome \xE9 obrigat\xF3rio!");
      return;
    }
    setSaving(true);
    try {
      if (editTeam) {
        const updated = await teamsApi.update(String(editTeam.id), form);
        setTeams((prev) => prev.map((t) => t.id === updated.id ? updated : t));
        toast.success("Equipe atualizada!");
      } else {
        const created = await teamsApi.create({ ...form, project_id: currentProject?.id });
        setTeams((prev) => [...prev, created]);
        toast.success("Equipe criada!");
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(err.message ?? "Erro ao salvar equipe.");
    } finally {
      setSaving(false);
    }
  };
  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await teamsApi.remove(String(deleteId));
      setTeams((prev) => prev.filter((t) => t.id !== deleteId));
      if (selectedTeamId === deleteId) setSelectedTeamId(null);
      toast.success("Equipe removida.");
      setDeleteId(null);
    } catch (err) {
      toast.error(err.message ?? "Erro ao excluir equipe.");
    } finally {
      setDeleting(false);
    }
  };
  const openInvite = (teamId, e) => {
    e.stopPropagation();
    setInviteTeamId(teamId);
    setInviteQuery("");
    setSearchResults([]);
    setInviteOpen(true);
  };
  const handleInviteSearch = (q) => {
    setInviteQuery(q);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    const clean = q.trim();
    if (clean.length < 2) {
      setSearchResults([]);
      return;
    }
    searchTimer.current = setTimeout(async () => {
      setSearching(true);
      try {
        if (!inviteTeamId) {
          setSearchResults([]);
          return;
        }
        const results = await teamsApi.searchCandidates(String(inviteTeamId), clean);
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
  };
  const handleInviteUser = async (user) => {
    if (!inviteTeamId) return;
    setInviting(true);
    try {
      const updated = await teamsApi.addMember(
        String(inviteTeamId),
        user.kind === "contact" ? { contact_id: user.contact_id ?? user.id } : { user_id: user.id }
      );
      setTeams((prev) => prev.map((t) => t.id === updated.id ? updated : t));
      toast.success(`${user.name} adicionado \xE0 equipe!`);
      setInviteOpen(false);
    } catch (err) {
      toast.error(err.message ?? "Erro ao convidar usu\xE1rio.");
    } finally {
      setInviting(false);
    }
  };
  const handleRemoveMember = async (teamId, contactId, e) => {
    e.stopPropagation();
    try {
      const updated = await teamsApi.removeMember(String(teamId), String(contactId));
      setTeams((prev) => prev.map((t) => t.id === updated.id ? updated : t));
      toast.success("Membro removido da equipe.");
    } catch (err) {
      toast.error(err.message ?? "Erro ao remover membro.");
    }
  };
  if (isLoading) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-64", children: /* @__PURE__ */ jsx(Loader2, { className: "w-8 h-8 animate-spin text-indigo-400" }) });
  }
  const inviteTeam = teams.find((t) => t.id === inviteTeamId);
  return /* @__PURE__ */ jsxs("div", { className: "p-4 lg:p-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-5", children: [
      /* @__PURE__ */ jsx("div", {}),
      isAdmin && /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: openCreate,
          className: "flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium shadow-md hover:opacity-90 hover:scale-[1.02] transition-all",
          children: [
            /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }),
            " Nova Equipe"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "lg:col-span-1 space-y-3", children: [
        teams.length === 0 && /* @__PURE__ */ jsx("div", { className: "bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-10 text-center", children: /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-400", children: "Nenhuma equipe cadastrada." }) }),
        teams.map((t) => {
          const isSelected = t.id === selectedTeamId;
          const color = t.color ?? "#6366f1";
          return /* @__PURE__ */ jsxs(
            motion.div,
            {
              whileHover: { scale: 1.01 },
              onClick: () => setSelectedTeamId(isSelected ? null : t.id),
              className: `group bg-white dark:bg-gray-900 rounded-2xl border shadow-sm p-5 cursor-pointer transition-all ${isSelected ? "border-indigo-300 dark:border-indigo-700 ring-2 ring-indigo-200 dark:ring-indigo-900" : "border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700"}`,
              children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between mb-3", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                    /* @__PURE__ */ jsx(
                      "div",
                      {
                        className: "w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-sm",
                        style: { background: `linear-gradient(135deg, ${color}, ${color}bb)` },
                        children: t.name[0]
                      }
                    ),
                    /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-900 dark:text-white text-sm", children: t.name }),
                      /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-400", children: [
                        t.members_count,
                        " membro",
                        t.members_count !== 1 ? "s" : ""
                      ] })
                    ] })
                  ] }),
                  isAdmin && /* @__PURE__ */ jsxs("div", { className: "flex gap-1 opacity-0 group-hover:opacity-100", children: [
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        onClick: (e) => openInvite(t.id, e),
                        className: "p-1.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/30 text-green-500 transition-colors",
                        title: "Convidar usu\xE1rio",
                        children: /* @__PURE__ */ jsx(UserPlus, { className: "w-3.5 h-3.5" })
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        onClick: (e) => openEdit(t, e),
                        className: "p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-400 transition-colors",
                        children: /* @__PURE__ */ jsx(Pencil, { className: "w-3.5 h-3.5" })
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        onClick: (e) => {
                          e.stopPropagation();
                          setDeleteId(t.id);
                        },
                        className: "p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-400 transition-colors",
                        children: /* @__PURE__ */ jsx(Trash2, { className: "w-3.5 h-3.5" })
                      }
                    )
                  ] })
                ] }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-400 mb-3 line-clamp-2", children: t.description }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center mt-1 -space-x-2", children: [
                  t.members.slice(0, 5).map((m) => /* @__PURE__ */ jsx(Avatar, { name: m.full_name, size: "xs", className: "ring-2 ring-white dark:ring-gray-900" }, m.id)),
                  t.members_count > 5 && /* @__PURE__ */ jsxs("div", { className: "w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[10px] font-bold text-gray-600 dark:text-gray-300 ring-2 ring-white dark:ring-gray-900", children: [
                    "+",
                    t.members_count - 5
                  ] })
                ] })
              ]
            },
            t.id
          );
        })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "lg:col-span-2", children: /* @__PURE__ */ jsx(AnimatePresence, { mode: "wait", children: selectedTeam ? /* @__PURE__ */ jsxs(
        motion.div,
        {
          initial: { opacity: 0, x: 16 },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: -16 },
          className: "bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden",
          children: [
            /* @__PURE__ */ jsx("div", { className: "h-2", style: { background: selectedTeam.color ?? "#6366f1" } }),
            /* @__PURE__ */ jsxs("div", { className: "p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: "w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-sm",
                    style: { background: `linear-gradient(135deg, ${selectedTeam.color ?? "#6366f1"}, ${selectedTeam.color ?? "#6366f1"}bb)` },
                    children: selectedTeam.name[0]
                  }
                ),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold text-gray-900 dark:text-white", children: selectedTeam.name }),
                  /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-400", children: selectedTeam.description })
                ] })
              ] }),
              isAdmin && /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: (e) => openInvite(selectedTeam.id, e),
                  className: "flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-sm font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors",
                  children: [
                    /* @__PURE__ */ jsx(UserPlus, { className: "w-4 h-4" }),
                    " Convidar"
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "p-5", children: [
              /* @__PURE__ */ jsxs("h3", { className: "text-sm font-semibold text-gray-900 dark:text-white mb-3", children: [
                "Membros (",
                selectedTeam.members_count,
                ")"
              ] }),
              selectedTeam.members.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-400 text-center py-6", children: "Nenhum membro nesta equipe ainda." }) : /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: selectedTeam.members.map((m) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group/member", children: [
                /* @__PURE__ */ jsx(Avatar, { name: m.full_name, size: "md" }),
                /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-gray-900 dark:text-white truncate", children: m.full_name }),
                  /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-400 truncate", children: m.role })
                ] }),
                isAdmin && /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: (e) => handleRemoveMember(selectedTeam.id, m.id, e),
                    className: "p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-400 opacity-0 group-hover/member:opacity-100 transition-all",
                    title: "Remover da equipe",
                    children: /* @__PURE__ */ jsx(UserMinus, { className: "w-3.5 h-3.5" })
                  }
                )
              ] }, m.id)) })
            ] })
          ]
        },
        selectedTeam.id
      ) : /* @__PURE__ */ jsxs(
        motion.div,
        {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          className: "bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center p-16 text-center",
          children: [
            /* @__PURE__ */ jsx("div", { className: "w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mb-4", children: /* @__PURE__ */ jsx(Users, { className: "w-8 h-8 text-indigo-300" }) }),
            /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-900 dark:text-white mb-1", children: "Selecione uma equipe" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-400", children: "Clique em uma equipe para ver os detalhes e membros" })
          ]
        },
        "empty"
      ) }) })
    ] }),
    /* @__PURE__ */ jsx(
      Modal,
      {
        isOpen: modalOpen,
        onClose: () => setModalOpen(false),
        title: editTeam ? "Editar Equipe" : "Nova Equipe",
        maxWidth: "max-w-lg",
        footer: /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setModalOpen(false),
              className: "flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800",
              children: "Cancelar"
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: handleSave,
              disabled: saving,
              className: "flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium hover:opacity-90 shadow-md disabled:opacity-60 flex items-center justify-center gap-2",
              children: [
                saving && /* @__PURE__ */ jsx(Loader2, { className: "w-4 h-4 animate-spin" }),
                editTeam ? "Salvar" : "Criar"
              ]
            }
          )
        ] }),
        children: /* @__PURE__ */ jsxs("div", { className: "space-y-4 pb-2", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: labelCls, children: "Nome *" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: form.name,
                onChange: (e) => setForm((p) => ({ ...p, name: e.target.value })),
                placeholder: "Ex: Desenvolvimento",
                className: inputCls
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: labelCls, children: "Descri\xE7\xE3o" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: form.description,
                onChange: (e) => setForm((p) => ({ ...p, description: e.target.value })),
                placeholder: "Descri\xE7\xE3o da equipe",
                className: inputCls
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: labelCls, children: "Cor" }),
            /* @__PURE__ */ jsx("div", { className: "flex gap-2", children: PRESET_COLORS.map((color) => /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => setForm((p) => ({ ...p, color })),
                className: `w-8 h-8 rounded-full ring-offset-2 transition-all ${form.color === color ? "ring-2 ring-gray-400 scale-110" : ""}`,
                style: { backgroundColor: color }
              },
              color
            )) })
          ] })
        ] })
      }
    ),
    /* @__PURE__ */ jsx(
      Modal,
      {
        isOpen: inviteOpen,
        onClose: () => setInviteOpen(false),
        title: `Convidar para ${inviteTeam?.name ?? "equipe"}`,
        maxWidth: "max-w-md",
        footer: /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setInviteOpen(false),
            className: "w-full py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800",
            children: "Fechar"
          }
        ),
        children: /* @__PURE__ */ jsxs("div", { className: "space-y-4 pb-2", children: [
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: [
            "Busque pelo ",
            /* @__PURE__ */ jsx("span", { className: "font-semibold text-indigo-600 dark:text-indigo-400", children: "@username" }),
            " ou nome de um usu\xE1rio cadastrado na plataforma."
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(AtSign, { className: "absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                value: inviteQuery,
                onChange: (e) => handleInviteSearch(e.target.value),
                placeholder: "@username ou nome...",
                className: `${inputCls} pl-10 pr-10`,
                autoFocus: true
              }
            ),
            searching && /* @__PURE__ */ jsx(Loader2, { className: "absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-indigo-400" }),
            !searching && inviteQuery.trim().length >= 2 && /* @__PURE__ */ jsx(Search, { className: "absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2 max-h-56 overflow-y-auto", children: [
            inviteQuery.trim().length >= 2 && !searching && searchResults.length === 0 && /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-400 text-center py-4", children: "Nenhum usu\xE1rio encontrado." }),
            searchResults.map((u) => {
              const alreadyMember = u.already_member || inviteTeam?.members.some((m) => m.id === (u.contact_id ?? u.id)) || false;
              return /* @__PURE__ */ jsxs(
                "div",
                {
                  className: "flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors",
                  children: [
                    /* @__PURE__ */ jsx(Avatar, { name: u.name, size: "md" }),
                    /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                      /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-gray-900 dark:text-white truncate", children: u.name }),
                      /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-400 truncate", children: [
                        u.username ? `@${u.username}` : u.email,
                        " \xB7 ",
                        /* @__PURE__ */ jsx("span", { className: u.kind === "contact" ? "text-emerald-500" : u.role === "admin" ? "text-indigo-500" : "text-gray-400", children: u.kind === "contact" ? "Contato" : u.role === "admin" ? "Admin" : "Profissional" })
                      ] })
                    ] }),
                    alreadyMember ? /* @__PURE__ */ jsx("span", { className: "text-xs text-emerald-600 dark:text-emerald-400 font-medium px-2 py-1 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg", children: "J\xE1 \xE9 membro" }) : /* @__PURE__ */ jsxs(
                      "button",
                      {
                        onClick: () => handleInviteUser(u),
                        disabled: inviting,
                        className: "flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 disabled:opacity-60 transition-colors",
                        children: [
                          inviting ? /* @__PURE__ */ jsx(Loader2, { className: "w-3 h-3 animate-spin" }) : /* @__PURE__ */ jsx(UserPlus, { className: "w-3 h-3" }),
                          "Adicionar"
                        ]
                      }
                    )
                  ]
                },
                u.id
              );
            })
          ] })
        ] })
      }
    ),
    /* @__PURE__ */ jsx(
      ConfirmModal,
      {
        isOpen: !!deleteId,
        onClose: () => setDeleteId(null),
        onConfirm: handleDelete,
        title: "Excluir equipe?",
        message: "Todos os membros ser\xE3o desvinculados. Esta a\xE7\xE3o n\xE3o pode ser desfeita.",
        confirmLabel: deleting ? "Excluindo..." : "Excluir",
        danger: true
      }
    )
  ] });
}
export {
  Teams as default
};
