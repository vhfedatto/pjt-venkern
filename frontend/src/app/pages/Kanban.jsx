import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from "react";
import { Plus, Pencil, Trash2, Calendar, GripVertical, AlertTriangle, Loader2, Check, Send, FileText } from "../components/ui/Icons";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { useProject } from "../context/ProjectContext";
import { useTasks } from "../hooks/useTasks";
import { teamsApi } from "../services/api";
import { Avatar } from "../components/ui/Avatar";
import { PriorityBadge } from "../components/ui/Badge";
import { Modal, ConfirmModal } from "../components/ui/Modal";
const COLUMNS = [
  { id: "todo", label: "A Fazer", color: "text-gray-600 dark:text-gray-400", bg: "bg-gray-50 dark:bg-gray-800/40", border: "border-gray-200 dark:border-gray-700" },
  { id: "in_progress", label: "Em Andamento", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20", border: "border-blue-200 dark:border-blue-800" },
  { id: "review", label: "Em Revis\xE3o", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20", border: "border-amber-200 dark:border-amber-800" },
  { id: "done", label: "Conclu\xEDdo", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20", border: "border-emerald-200 dark:border-emerald-800" },
  { id: "late", label: "Atrasado", color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/20", border: "border-red-200 dark:border-red-800" }
];
const emptyTask = {
  title: "",
  description: "",
  column: "todo",
  teamId: "",
  assigneeId: "",
  priority: "medium",
  dueDate: "",
  tags: []
};
function Kanban() {
  const { currentUser } = useApp();
  const { user: authUser } = useAuth();
  const { currentProject } = useProject();
  const { kanban, contacts, loading, createTask, updateTask, deleteTask, moveTask, acceptTask, completeTask } = useTasks();
  const currentUserContactId = contacts.find((c) => c.email === authUser?.email)?.id ?? null;
  const [selectedTeam, setSelectedTeam] = useState("general");
  const [teamTabs, setTeamTabs] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState(emptyTask);
  const [dragging, setDragging] = useState(null);
  const [saving, setSaving] = useState(false);
  const [completeTarget, setCompleteTarget] = useState(null);
  const [completeNote, setCompleteNote] = useState("");
  const [completeFile, setCompleteFile] = useState(null);
  const [completing, setCompleting] = useState(false);
  const fileInputRef = useRef(null);
  const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  useEffect(() => {
    if (!currentProject) {
      setTeamTabs([]);
      return;
    }
    teamsApi.list({ project_id: currentProject.id }).then((data) => {
      const tabs = data.map((t) => ({ id: String(t.id), name: t.name, color: t.color ?? "#6366f1" }));
      setTeamTabs(
        currentUser.role === "admin" ? tabs : tabs.filter((t) => t.id === currentUser.teamId)
      );
    }).catch(() => {
    });
  }, [currentProject, currentUser.role, currentUser.teamId]);
  const availableTeams = [
    { id: "general", name: "Kanban Geral", color: "#6366f1" },
    ...teamTabs
  ];
  const getColTasks = (colId) => {
    const colTasks = kanban[colId] ?? [];
    return selectedTeam === "general" ? colTasks : colTasks.filter((t) => t.teamId === selectedTeam);
  };
  const inputCls = "w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-400 transition-all placeholder:text-gray-400";
  const labelCls = "block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5";
  const openCreate = (col) => {
    setEditTask(null);
    setForm({ ...emptyTask, column: col, teamId: selectedTeam === "general" ? "" : selectedTeam });
    setModalOpen(true);
  };
  const openEdit = (task) => {
    setEditTask(task);
    setForm({ title: task.title, description: task.description, column: task.column, teamId: task.teamId, assigneeId: task.assigneeId, priority: task.priority, dueDate: task.dueDate, tags: task.tags });
    setModalOpen(true);
  };
  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error("T\xEDtulo \xE9 obrigat\xF3rio!");
      return;
    }
    if (form.dueDate && form.dueDate < today) {
      toast.error("A data da task n\xE3o pode ser anterior \xE0 data atual.");
      return;
    }
    setSaving(true);
    try {
      if (editTask) {
        await updateTask(editTask.id, form);
        toast.success("Tarefa atualizada!");
      } else {
        await createTask(form);
        toast.success("Tarefa criada!");
      }
      setModalOpen(false);
    } catch (e) {
      toast.error(e?.message ?? "Erro ao salvar tarefa");
    } finally {
      setSaving(false);
    }
  };
  const handleDelete = async (id) => {
    try {
      await deleteTask(id);
      toast.success("Tarefa removida.");
    } catch (e) {
      toast.error(e?.message ?? "Erro ao remover tarefa");
    }
    setDeleteId(null);
  };
  const handleAccept = async (task) => {
    try {
      await acceptTask(task.id);
      toast.success("Tarefa aceita! Movida para Em Andamento.");
    } catch (e) {
      toast.error(e?.message ?? "Erro ao aceitar tarefa");
    }
  };
  const openCompleteModal = (task) => {
    setCompleteTarget(task);
    setCompleteNote("");
    setCompleteFile(null);
  };
  const handleComplete = async () => {
    if (!completeTarget) return;
    setCompleting(true);
    try {
      const fd = new FormData();
      fd.append("note", completeNote);
      if (completeFile) fd.append("file", completeFile);
      await completeTask(completeTarget.id, fd);
      toast.success("Tarefa enviada para revis\xE3o!");
      setCompleteTarget(null);
    } catch (e) {
      toast.error(e?.message ?? "Erro ao enviar para revis\xE3o");
    } finally {
      setCompleting(false);
    }
  };
  const onDragStart = (e, taskId) => {
    e.dataTransfer.setData("taskId", taskId);
    setDragging(taskId);
  };
  const onDragEnd = () => setDragging(null);
  const onDrop = async (e, col) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("taskId");
    if (id) {
      try {
        await moveTask(id, col);
      } catch (e2) {
        toast.error(e2?.message ?? "Erro ao mover tarefa");
      }
    }
    setDragging(null);
  };
  const onDragOver = (e) => e.preventDefault();
  const isLate = (dueDate) => dueDate && new Date(dueDate) < /* @__PURE__ */ new Date();
  const totalVisible = COLUMNS.reduce((acc, col) => acc + getColTasks(col.id).length, 0);
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-64", children: /* @__PURE__ */ jsx(Loader2, { className: "w-8 h-8 animate-spin text-indigo-500" }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "p-4 lg:p-6", children: [
    /* @__PURE__ */ jsx(
      motion.div,
      {
        initial: { opacity: 0, y: -12 },
        animate: { opacity: 1, y: 0 },
        className: "bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4 mb-5",
        children: /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-3 items-center", children: [
          /* @__PURE__ */ jsx("div", { className: "flex gap-2 flex-wrap", children: availableTeams.map((t) => /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setSelectedTeam(t.id),
              className: `px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedTeam === t.id ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"}`,
              children: t.name
            },
            t.id
          )) }),
          /* @__PURE__ */ jsxs("div", { className: "ml-auto text-xs text-gray-400", children: [
            totalVisible,
            " tarefa",
            totalVisible !== 1 ? "s" : ""
          ] })
        ] })
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "flex gap-4 overflow-x-auto pb-4", children: COLUMNS.map((col) => {
      const colTasks = getColTasks(col.id);
      return /* @__PURE__ */ jsxs(
        "div",
        {
          className: `flex-shrink-0 w-72 rounded-2xl border ${col.border} ${col.bg} flex flex-col`,
          onDrop: (e) => onDrop(e, col.id),
          onDragOver,
          children: [
            /* @__PURE__ */ jsxs("div", { className: "p-4 pb-2 flex items-center justify-between", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("span", { className: `text-sm font-bold ${col.color}`, children: col.label }),
                /* @__PURE__ */ jsx("span", { className: "w-5 h-5 flex items-center justify-center rounded-full bg-white dark:bg-gray-700 text-xs font-bold text-gray-600 dark:text-gray-300 shadow-sm", children: colTasks.length })
              ] }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => openCreate(col.id),
                  className: "p-1.5 rounded-lg hover:bg-white dark:hover:bg-gray-700 text-gray-400 hover:text-indigo-600 transition-colors",
                  children: /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" })
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1 p-3 pt-1 space-y-2 min-h-20", children: [
              /* @__PURE__ */ jsx(AnimatePresence, { children: colTasks.map((task) => {
                const overdue = isLate(task.dueDate) && task.column !== "done";
                const isDraggingThis = dragging === task.id;
                return /* @__PURE__ */ jsxs(
                  motion.div,
                  {
                    layout: true,
                    initial: { opacity: 0, y: 8 },
                    animate: { opacity: isDraggingThis ? 0.4 : 1, y: 0 },
                    exit: { opacity: 0, scale: 0.9 },
                    draggable: true,
                    onDragStart: (e) => onDragStart(e, task.id),
                    onDragEnd,
                    className: "bg-white dark:bg-gray-900 rounded-xl p-3.5 shadow-sm border border-gray-100 dark:border-gray-800 cursor-grab active:cursor-grabbing hover:shadow-md transition-all group",
                    children: [
                      /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-2 mb-2", children: [
                        /* @__PURE__ */ jsx(GripVertical, { className: "w-3.5 h-3.5 text-gray-300 flex-shrink-0 mt-0.5" }),
                        /* @__PURE__ */ jsx("p", { className: "flex-1 text-sm font-semibold text-gray-900 dark:text-white leading-snug", children: task.title }),
                        /* @__PURE__ */ jsxs("div", { className: "flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0", children: [
                          /* @__PURE__ */ jsx("button", { onClick: () => openEdit(task), className: "p-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-400", children: /* @__PURE__ */ jsx(Pencil, { className: "w-3 h-3" }) }),
                          /* @__PURE__ */ jsx("button", { onClick: () => setDeleteId(task.id), className: "p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/40 text-red-400", children: /* @__PURE__ */ jsx(Trash2, { className: "w-3 h-3" }) })
                        ] })
                      ] }),
                      task.description && /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-400 mb-2 line-clamp-2", children: task.description }),
                      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-1 mb-2", children: [
                        /* @__PURE__ */ jsx(PriorityBadge, { priority: task.priority }),
                        task.tags.slice(0, 2).map((tag) => /* @__PURE__ */ jsx("span", { className: "text-xs px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400", children: tag }, tag))
                      ] }),
                      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-gray-800", children: [
                        task.assigneeName ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
                          /* @__PURE__ */ jsx(Avatar, { name: task.assigneeName, size: "xs" }),
                          /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-400", children: task.assigneeName.split(" ")[0] })
                        ] }) : /* @__PURE__ */ jsx("span", {}),
                        task.dueDate && /* @__PURE__ */ jsxs("div", { className: `flex items-center gap-1 text-xs ${overdue ? "text-red-500 font-medium" : "text-gray-400"}`, children: [
                          overdue ? /* @__PURE__ */ jsx(AlertTriangle, { className: "w-3 h-3" }) : /* @__PURE__ */ jsx(Calendar, { className: "w-3 h-3" }),
                          (/* @__PURE__ */ new Date(task.dueDate + "T00:00:00")).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
                        ] })
                      ] }),
                      col.id === "todo" && currentUserContactId && task.assigneeId === currentUserContactId && /* @__PURE__ */ jsxs(
                        "button",
                        {
                          onClick: (e) => {
                            e.stopPropagation();
                            handleAccept(task);
                          },
                          className: "mt-2 w-full py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors flex items-center justify-center gap-1.5",
                          children: [
                            /* @__PURE__ */ jsx(Check, { className: "w-3.5 h-3.5" }),
                            " Aceitar tarefa"
                          ]
                        }
                      ),
                      col.id === "in_progress" && currentUserContactId && task.assigneeId === currentUserContactId && /* @__PURE__ */ jsxs(
                        "button",
                        {
                          onClick: (e) => {
                            e.stopPropagation();
                            openCompleteModal(task);
                          },
                          className: "mt-2 w-full py-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs font-semibold hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors flex items-center justify-center gap-1.5",
                          children: [
                            /* @__PURE__ */ jsx(Send, { className: "w-3.5 h-3.5" }),
                            " Enviar para Revis\xE3o"
                          ]
                        }
                      ),
                      col.id === "review" && /* @__PURE__ */ jsxs("div", { className: "mt-2 w-full py-1.5 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 text-xs font-semibold flex items-center justify-center gap-1.5", children: [
                        /* @__PURE__ */ jsx(FileText, { className: "w-3.5 h-3.5" }),
                        " Aguardando revis\xE3o"
                      ] })
                    ]
                  },
                  task.id
                );
              }) }),
              colTasks.length === 0 && /* @__PURE__ */ jsx("div", { className: "border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-4 text-center", children: /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-400", children: "Arraste tarefas aqui" }) })
            ] }),
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => openCreate(col.id),
                className: "mx-3 mb-3 py-2 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 text-xs text-gray-400 hover:border-indigo-400 hover:text-indigo-500 hover:bg-white dark:hover:bg-gray-800 transition-all flex items-center justify-center gap-1",
                children: [
                  /* @__PURE__ */ jsx(Plus, { className: "w-3.5 h-3.5" }),
                  " Adicionar"
                ]
              }
            )
          ]
        },
        col.id
      );
    }) }),
    /* @__PURE__ */ jsx(
      Modal,
      {
        isOpen: modalOpen,
        onClose: () => setModalOpen(false),
        title: editTask ? "Editar Tarefa" : "Nova Tarefa",
        footer: /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
          /* @__PURE__ */ jsx("button", { onClick: () => setModalOpen(false), className: "flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors", children: "Cancelar" }),
          /* @__PURE__ */ jsx("button", { onClick: handleSave, disabled: saving, className: "flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium hover:opacity-90 shadow-md disabled:opacity-60", children: saving ? "..." : editTask ? "Salvar" : "Criar" })
        ] }),
        children: /* @__PURE__ */ jsxs("div", { className: "space-y-4 pb-2", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: labelCls, children: "T\xEDtulo *" }),
            /* @__PURE__ */ jsx("input", { type: "text", value: form.title, onChange: (e) => setForm((p) => ({ ...p, title: e.target.value })), placeholder: "Ex: Implementar autentica\xE7\xE3o", className: inputCls })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: labelCls, children: "Descri\xE7\xE3o" }),
            /* @__PURE__ */ jsx("textarea", { value: form.description, onChange: (e) => setForm((p) => ({ ...p, description: e.target.value })), rows: 2, className: `${inputCls} resize-none`, placeholder: "Detalhes da tarefa..." })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: labelCls, children: "Coluna" }),
              /* @__PURE__ */ jsx("select", { value: form.column, onChange: (e) => setForm((p) => ({ ...p, column: e.target.value })), className: inputCls, children: COLUMNS.map((c) => /* @__PURE__ */ jsx("option", { value: c.id, children: c.label }, c.id)) })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: labelCls, children: "Prioridade" }),
              /* @__PURE__ */ jsxs("select", { value: form.priority, onChange: (e) => setForm((p) => ({ ...p, priority: e.target.value })), className: inputCls, children: [
                /* @__PURE__ */ jsx("option", { value: "low", children: "Baixa" }),
                /* @__PURE__ */ jsx("option", { value: "medium", children: "M\xE9dia" }),
                /* @__PURE__ */ jsx("option", { value: "high", children: "Alta" }),
                /* @__PURE__ */ jsx("option", { value: "urgent", children: "Urgente" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: labelCls, children: "Respons\xE1vel" }),
              /* @__PURE__ */ jsxs("select", { value: form.assigneeId, onChange: (e) => setForm((p) => ({ ...p, assigneeId: e.target.value })), className: inputCls, children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "Nenhum" }),
                contacts.map((c) => /* @__PURE__ */ jsx("option", { value: c.id, children: c.name }, c.id))
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: labelCls, children: "Prazo" }),
              /* @__PURE__ */ jsx("input", { type: "date", min: today, value: form.dueDate, onChange: (e) => setForm((p) => ({ ...p, dueDate: e.target.value })), className: inputCls })
            ] })
          ] })
        ] })
      }
    ),
    /* @__PURE__ */ jsx(
      ConfirmModal,
      {
        isOpen: !!deleteId,
        onClose: () => setDeleteId(null),
        onConfirm: () => deleteId && handleDelete(deleteId),
        title: "Excluir tarefa?",
        message: "Esta a\xE7\xE3o n\xE3o pode ser desfeita.",
        confirmLabel: "Excluir",
        danger: true
      }
    ),
    /* @__PURE__ */ jsx(
      Modal,
      {
        isOpen: !!completeTarget,
        onClose: () => setCompleteTarget(null),
        title: "Enviar para Revis\xE3o",
        footer: /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
          /* @__PURE__ */ jsx("button", { onClick: () => setCompleteTarget(null), className: "flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors", children: "Cancelar" }),
          /* @__PURE__ */ jsxs("button", { onClick: handleComplete, disabled: completing, className: "flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium hover:opacity-90 shadow-md disabled:opacity-60 flex items-center justify-center gap-2", children: [
            completing ? /* @__PURE__ */ jsx(Loader2, { className: "w-4 h-4 animate-spin" }) : /* @__PURE__ */ jsx(Send, { className: "w-4 h-4" }),
            completing ? "Enviando..." : "Enviar para Revis\xE3o"
          ] })
        ] }),
        children: /* @__PURE__ */ jsxs("div", { className: "space-y-4 pb-2", children: [
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: [
            "Descreva o que foi feito em ",
            /* @__PURE__ */ jsx("span", { className: "font-semibold text-gray-900 dark:text-white", children: completeTarget?.title }),
            "."
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: labelCls, children: "Descri\xE7\xE3o do que foi feito *" }),
            /* @__PURE__ */ jsx(
              "textarea",
              {
                value: completeNote,
                onChange: (e) => setCompleteNote(e.target.value),
                rows: 4,
                placeholder: "Descreva detalhadamente o que foi realizado...",
                className: `${inputCls} resize-none`
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: labelCls, children: "Arquivo comprobat\xF3rio (opcional)" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                ref: fileInputRef,
                type: "file",
                className: "hidden",
                onChange: (e) => setCompleteFile(e.target.files?.[0] ?? null)
              }
            ),
            /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                onClick: () => fileInputRef.current?.click(),
                className: "w-full py-2.5 px-4 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 text-sm text-gray-500 hover:border-amber-400 hover:text-amber-600 transition-colors flex items-center justify-center gap-2",
                children: [
                  /* @__PURE__ */ jsx(FileText, { className: "w-4 h-4" }),
                  completeFile ? completeFile.name : "Selecionar arquivo"
                ]
              }
            )
          ] })
        ] })
      }
    )
  ] });
}
export {
  Kanban as default
};
