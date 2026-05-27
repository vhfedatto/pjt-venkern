import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Plus, Calendar, Clock, MapPin, Send, Pencil, Trash2, Users, CheckCircle2, Image, Loader2 } from "../components/ui/Icons";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";
import { useEvents } from "../hooks/useEvents";
import { EventStatusBadge } from "../components/ui/Badge";
import { Modal, ConfirmModal } from "../components/ui/Modal";
const emptyForm = {
  title: "",
  description: "",
  date: "",
  time: "",
  location: "",
  bannerUrl: "",
  targetAudience: ["all"],
  status: "draft"
};
function Events() {
  const { currentUser } = useApp();
  const { events, teams, loading, error, createEvent, updateEvent, deleteEvent, sendEvent } = useEvents();
  const [filter, setFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editEvent, setEditEvent] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const filtered = filter === "all" ? events : events.filter((e) => e.status === filter);
  const openCreate = () => {
    setEditEvent(null);
    setForm(emptyForm);
    setModalOpen(true);
  };
  const openEdit = (ev) => {
    setEditEvent(ev);
    setForm({ title: ev.title, description: ev.description, date: ev.date, time: ev.time, location: ev.location, bannerUrl: ev.bannerUrl, targetAudience: ev.targetAudience, status: ev.status });
    setModalOpen(true);
  };
  const handleSave = async () => {
    if (!form.title.trim() || !form.date) {
      toast.error("Preencha t\xEDtulo e data!");
      return;
    }
    if (form.date < today) {
      toast.error("A data do evento n\xE3o pode ser anterior \xE0 data atual.");
      return;
    }
    setSaving(true);
    try {
      if (editEvent) {
        await updateEvent(editEvent.id, form);
        toast.success("Evento atualizado!");
      } else {
        await createEvent(form);
        toast.success("Evento criado!");
      }
      setModalOpen(false);
    } catch (e) {
      toast.error(e?.message ?? "Erro ao salvar evento");
    } finally {
      setSaving(false);
    }
  };
  const handleSend = async (id) => {
    try {
      await sendEvent(id);
      toast.success("Evento enviado para os grupos!");
    } catch (e) {
      toast.error(e?.message ?? "Erro ao enviar evento");
    }
  };
  const handleDelete = async (id) => {
    try {
      await deleteEvent(id);
      toast.success("Evento removido.");
    } catch (e) {
      toast.error(e?.message ?? "Erro ao remover evento");
    }
    setDeleteId(null);
  };
  const inputCls = "w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-400 transition-all placeholder:text-gray-400";
  const labelCls = "block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5";
  const toggleAudience = (id) => {
    setForm((p) => {
      if (id === "all") return { ...p, targetAudience: ["all"] };
      const without = p.targetAudience.filter((x) => x !== "all" && x !== id);
      const newArr = p.targetAudience.includes(id) ? without : [...without, id];
      return { ...p, targetAudience: newArr.length === 0 ? ["all"] : newArr };
    });
  };
  const getAudienceLabel = (ta) => {
    if (ta.includes("all")) return "Todos";
    return ta.map((id) => teams.find((t) => t.id === id)?.name.split(" ")[0] ?? id).join(", ");
  };
  const FILTERS = [
    { value: "all", label: "Todos" },
    { value: "draft", label: "Rascunho" },
    { value: "scheduled", label: "Agendados" },
    { value: "sent", label: "Enviados" },
    { value: "completed", label: "Conclu\xEDdos" }
  ];
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-64", children: /* @__PURE__ */ jsx(Loader2, { className: "w-8 h-8 animate-spin text-indigo-500" }) });
  }
  if (error) {
    return /* @__PURE__ */ jsx("div", { className: "p-6 text-center text-red-500 text-sm", children: error });
  }
  return /* @__PURE__ */ jsxs("div", { className: "p-4 lg:p-6", children: [
    /* @__PURE__ */ jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: -12 },
        animate: { opacity: 1, y: 0 },
        className: "bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4 mb-5 flex flex-wrap gap-3 items-center",
        children: [
          /* @__PURE__ */ jsx("div", { className: "flex gap-2 flex-wrap", children: FILTERS.map((f) => /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setFilter(f.value),
              className: `px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${filter === f.value ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"}`,
              children: f.label
            },
            f.value
          )) }),
          /* @__PURE__ */ jsxs("span", { className: "text-xs text-gray-400", children: [
            filtered.length,
            " evento",
            filtered.length !== 1 ? "s" : ""
          ] }),
          currentUser.role === "admin" && /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: openCreate,
              className: "ml-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium shadow-md hover:opacity-90 hover:scale-[1.02] transition-all",
              children: [
                /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }),
                " Novo Evento"
              ]
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: /* @__PURE__ */ jsx(AnimatePresence, { children: filtered.map((ev) => /* @__PURE__ */ jsxs(
      motion.div,
      {
        layout: true,
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, scale: 0.9 },
        whileHover: { y: -3 },
        className: "bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all overflow-hidden group",
        children: [
          /* @__PURE__ */ jsxs("div", { className: "relative h-36 overflow-hidden", children: [
            ev.bannerUrl ? /* @__PURE__ */ jsx("img", { src: ev.bannerUrl, alt: ev.title, className: "w-full h-full object-cover" }) : /* @__PURE__ */ jsx("div", { className: "w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center", children: /* @__PURE__ */ jsx(Image, { className: "w-12 h-12 text-indigo-300" }) }),
            /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" }),
            /* @__PURE__ */ jsxs("div", { className: "absolute bottom-3 left-3 right-3 flex items-center justify-between", children: [
              /* @__PURE__ */ jsx(EventStatusBadge, { status: ev.status }),
              currentUser.role === "admin" && /* @__PURE__ */ jsxs("div", { className: "flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity", children: [
                /* @__PURE__ */ jsx("button", { onClick: () => openEdit(ev), className: "p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm transition-colors", children: /* @__PURE__ */ jsx(Pencil, { className: "w-3.5 h-3.5" }) }),
                /* @__PURE__ */ jsx("button", { onClick: () => setDeleteId(ev.id), className: "p-1.5 rounded-lg bg-red-500/80 hover:bg-red-600/90 text-white backdrop-blur-sm transition-colors", children: /* @__PURE__ */ jsx(Trash2, { className: "w-3.5 h-3.5" }) })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "p-4", children: [
            /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-900 dark:text-white text-sm mb-1 line-clamp-1", children: ev.title }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-400 line-clamp-2 mb-3", children: ev.description }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-1.5 mb-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400", children: [
                /* @__PURE__ */ jsx(Calendar, { className: "w-3.5 h-3.5 text-indigo-400 flex-shrink-0" }),
                (/* @__PURE__ */ new Date(ev.date + "T00:00:00")).toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "long" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400", children: [
                /* @__PURE__ */ jsx(Clock, { className: "w-3.5 h-3.5 text-indigo-400 flex-shrink-0" }),
                ev.time
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400", children: [
                /* @__PURE__ */ jsx(MapPin, { className: "w-3.5 h-3.5 text-indigo-400 flex-shrink-0" }),
                /* @__PURE__ */ jsx("span", { className: "truncate", children: ev.location })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400", children: [
                /* @__PURE__ */ jsx(Users, { className: "w-3.5 h-3.5 text-indigo-400 flex-shrink-0" }),
                getAudienceLabel(ev.targetAudience)
              ] })
            ] }),
            currentUser.role === "admin" && ev.status !== "sent" && ev.status !== "completed" && /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => handleSend(ev.id),
                className: "w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-medium hover:opacity-90 transition-opacity shadow-sm",
                children: [
                  /* @__PURE__ */ jsx(Send, { className: "w-3.5 h-3.5" }),
                  " Enviar para Grupos"
                ]
              }
            ),
            (ev.status === "sent" || ev.status === "completed") && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium", children: [
              /* @__PURE__ */ jsx(CheckCircle2, { className: "w-3.5 h-3.5" }),
              " ",
              ev.status === "sent" ? "Enviado" : "Conclu\xEDdo",
              ev.sentAt && /* @__PURE__ */ jsxs("span", { className: "text-gray-400", children: [
                "\xB7 ",
                new Date(ev.sentAt).toLocaleDateString("pt-BR")
              ] })
            ] })
          ] })
        ]
      },
      ev.id
    )) }) }),
    /* @__PURE__ */ jsx(
      Modal,
      {
        isOpen: modalOpen,
        onClose: () => setModalOpen(false),
        title: editEvent ? "Editar Evento" : "Novo Evento",
        maxWidth: "max-w-xl",
        footer: /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
          /* @__PURE__ */ jsx("button", { onClick: () => setModalOpen(false), className: "flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800", children: "Cancelar" }),
          /* @__PURE__ */ jsxs("button", { onClick: handleSave, disabled: saving, className: "flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium hover:opacity-90 shadow-md disabled:opacity-60 flex items-center justify-center gap-2", children: [
            saving && /* @__PURE__ */ jsx(Loader2, { className: "w-4 h-4 animate-spin" }),
            editEvent ? "Salvar" : "Criar Evento"
          ] })
        ] }),
        children: /* @__PURE__ */ jsxs("div", { className: "space-y-4 pb-2", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: labelCls, children: "T\xEDtulo *" }),
            /* @__PURE__ */ jsx("input", { type: "text", value: form.title, onChange: (e) => setForm((p) => ({ ...p, title: e.target.value })), placeholder: "Ex: Kickoff Q2", className: inputCls })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: labelCls, children: "Descri\xE7\xE3o" }),
            /* @__PURE__ */ jsx("textarea", { value: form.description, onChange: (e) => setForm((p) => ({ ...p, description: e.target.value })), rows: 3, className: `${inputCls} resize-none`, placeholder: "Descri\xE7\xE3o do evento..." })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: labelCls, children: "Data *" }),
              /* @__PURE__ */ jsx("input", { type: "date", min: today, value: form.date, onChange: (e) => setForm((p) => ({ ...p, date: e.target.value })), className: inputCls })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: labelCls, children: "Hor\xE1rio" }),
              /* @__PURE__ */ jsx("input", { type: "time", value: form.time, onChange: (e) => setForm((p) => ({ ...p, time: e.target.value })), className: inputCls })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: labelCls, children: "Local" }),
            /* @__PURE__ */ jsx("input", { type: "text", value: form.location, onChange: (e) => setForm((p) => ({ ...p, location: e.target.value })), placeholder: "Ex: Audit\xF3rio Principal", className: inputCls })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: labelCls, children: "URL do Banner" }),
            /* @__PURE__ */ jsx("input", { type: "url", value: form.bannerUrl, onChange: (e) => setForm((p) => ({ ...p, bannerUrl: e.target.value })), placeholder: "https://...", className: inputCls })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: labelCls, children: "P\xFAblico-alvo" }),
            /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: [{ id: "all", name: "Todos" }, ...teams].map((t) => /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => toggleAudience(t.id),
                className: `px-3 py-1.5 rounded-full text-xs font-medium transition-all ${form.targetAudience.includes(t.id) ? "bg-indigo-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"}`,
                children: t.name
              },
              t.id
            )) })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: labelCls, children: "Status" }),
            /* @__PURE__ */ jsxs("select", { value: form.status, onChange: (e) => setForm((p) => ({ ...p, status: e.target.value })), className: inputCls, children: [
              /* @__PURE__ */ jsx("option", { value: "draft", children: "Rascunho" }),
              /* @__PURE__ */ jsx("option", { value: "scheduled", children: "Agendado" }),
              /* @__PURE__ */ jsx("option", { value: "sent", children: "Enviado" }),
              /* @__PURE__ */ jsx("option", { value: "completed", children: "Conclu\xEDdo" })
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
        title: "Excluir evento?",
        message: "Esta a\xE7\xE3o n\xE3o pode ser desfeita.",
        confirmLabel: "Excluir",
        danger: true
      }
    )
  ] });
}
export {
  Events as default
};
