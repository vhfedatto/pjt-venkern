import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Phone,
  Mail,
  Building2,
  CalendarClock,
  FileText,
  MessageCircle,
  Plus,
  Clock,
  ClipboardList,
  Download,
  Send,
  Loader2,
  Trash2
} from "../components/ui/Icons";
import { useApp } from "../context/AppContext";
import { useContactDetails } from "../hooks/useContactDetails";
import { useTeams } from "../hooks/useTeams";
import { useTasks } from "../hooks/useTasks";
import { Avatar } from "../components/ui/Avatar";
import { StatusBadge, RoleBadge } from "../components/ui/Badge";
import { documentsApi } from "../services/api";
const interactionLabels = {
  call: "Liga\xE7\xE3o",
  whatsapp: "WhatsApp",
  email: "E-mail",
  meeting: "Reuni\xE3o",
  note: "Nota"
};
const originLabels = {
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  email: "E-mail",
  indicacao: "Indica\xE7\xE3o",
  evento: "Evento",
  manual: "Manual"
};
function ContactDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useApp();
  const { teams } = useTeams();
  const { tasks } = useTasks();
  const { contact, contacts, interactions, documents, loading, error, addInteraction, uploadDocument, removeDocument } = useContactDetails(id);
  const [interactionType, setInteractionType] = useState("note");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingDocId, setDeletingDocId] = useState(null);
  const fileInputRef = useRef(null);
  const team = teams.find((t) => t.id === contact?.teamId);
  const responsible = contacts.find((c) => c.id === contact?.responsibleId);
  const contactTasks = tasks.filter((t) => t.assigneeId === id);
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "p-6 flex items-center justify-center py-20", children: /* @__PURE__ */ jsx(Loader2, { className: "w-8 h-8 animate-spin text-indigo-500" }) });
  }
  if (error || !contact) {
    return /* @__PURE__ */ jsxs("div", { className: "p-6", children: [
      /* @__PURE__ */ jsxs("button", { onClick: () => navigate("/contatos"), className: "mb-4 inline-flex items-center gap-2 text-sm text-indigo-500 hover:text-indigo-600", children: [
        /* @__PURE__ */ jsx(ArrowLeft, { className: "w-4 h-4" }),
        " Voltar para contatos"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-12 text-center", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold text-gray-900 dark:text-white", children: "Contato n\xE3o encontrado" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-400 mt-2", children: error ?? "Esse registro n\xE3o existe ou foi removido." })
      ] })
    ] });
  }
  const handleAddInteraction = async () => {
    if (!description.trim()) {
      toast.error("Escreva uma descri\xE7\xE3o para registrar no hist\xF3rico.");
      return;
    }
    setSubmitting(true);
    try {
      await addInteraction(interactionType, description, currentUser.contactId);
      setDescription("");
      toast.success("Hist\xF3rico atualizado.");
    } catch (e) {
      toast.error(e?.message ?? "Erro ao registrar intera\xE7\xE3o");
    } finally {
      setSubmitting(false);
    }
  };
  const handleAddDocument = async () => {
    fileInputRef.current?.click();
  };
  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setUploading(true);
    try {
      await uploadDocument(file);
      toast.success("Documento anexado com sucesso.");
    } catch (err) {
      toast.error(err?.message ?? "Erro ao fazer upload do documento");
    } finally {
      setUploading(false);
    }
  };
  const handleDownload = async (docId, filename) => {
    try {
      await documentsApi.download(docId, filename);
    } catch (err) {
      toast.error(err?.message ?? "Erro ao baixar documento");
    }
  };
  const handleDeleteDocument = async (docId) => {
    if (!window.confirm("Remover este documento? Essa a\xE7\xE3o n\xE3o pode ser desfeita.")) return;
    setDeletingDocId(docId);
    try {
      await removeDocument(docId);
      toast.success("Documento removido.");
    } catch (err) {
      toast.error(err?.message ?? "Erro ao remover documento");
    } finally {
      setDeletingDocId(null);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "p-4 lg:p-6 space-y-5", children: [
    /* @__PURE__ */ jsxs("button", { onClick: () => navigate("/contatos"), className: "inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400", children: [
      /* @__PURE__ */ jsx(ArrowLeft, { className: "w-4 h-4" }),
      " Voltar para contatos"
    ] }),
    /* @__PURE__ */ jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        className: "rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm",
        children: [
          /* @__PURE__ */ jsx("div", { className: "h-2", style: { background: team?.color ?? "#6366f1" } }),
          /* @__PURE__ */ jsxs("div", { className: "p-5 lg:p-6 flex flex-col lg:flex-row gap-5 lg:items-center justify-between", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
              /* @__PURE__ */ jsx(Avatar, { name: contact.name, size: "lg", status: contact.status }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2 items-center mb-1", children: [
                  /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: contact.name }),
                  /* @__PURE__ */ jsx(StatusBadge, { status: contact.status }),
                  /* @__PURE__ */ jsx(RoleBadge, { role: contact.role })
                ] }),
                /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: [
                  contact.position || "Sem cargo definido",
                  " \xB7 ",
                  team?.name ?? "Sem equipe"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs", children: [
              /* @__PURE__ */ jsxs("a", { href: `tel:${contact.phone}`, className: "rounded-2xl bg-gray-50 dark:bg-gray-800 p-3 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors", children: [
                /* @__PURE__ */ jsx(Phone, { className: "w-4 h-4 text-indigo-500 mb-1" }),
                contact.phone
              ] }),
              /* @__PURE__ */ jsxs("a", { href: `mailto:${contact.email}`, className: "rounded-2xl bg-gray-50 dark:bg-gray-800 p-3 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors truncate", children: [
                /* @__PURE__ */ jsx(Mail, { className: "w-4 h-4 text-indigo-500 mb-1" }),
                contact.email
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "rounded-2xl bg-gray-50 dark:bg-gray-800 p-3", children: [
                /* @__PURE__ */ jsx(Building2, { className: "w-4 h-4 text-indigo-500 mb-1" }),
                originLabels[contact.origin ?? "manual"] ?? "Manual"
              ] }),
              /* @__PURE__ */ jsxs("button", { onClick: () => navigate("/chat"), className: "rounded-2xl bg-indigo-600 text-white p-3 hover:bg-indigo-700 transition-colors text-left", children: [
                /* @__PURE__ */ jsx(MessageCircle, { className: "w-4 h-4 mb-1" }),
                "Abrir chat"
              ] })
            ] })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 xl:grid-cols-[1.35fr_.65fr] gap-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
        /* @__PURE__ */ jsxs("section", { className: "rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-900 dark:text-white", children: "Hist\xF3rico de intera\xE7\xF5es" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-400", children: "Timeline operacional do contato." })
            ] }),
            /* @__PURE__ */ jsx(Clock, { className: "w-5 h-5 text-indigo-400" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "rounded-2xl bg-gray-50 dark:bg-gray-800/60 p-3 mb-4 space-y-3", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-[160px_1fr_auto] gap-2", children: [
            /* @__PURE__ */ jsx(
              "select",
              {
                value: interactionType,
                onChange: (e) => setInteractionType(e.target.value),
                className: "px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-200 outline-none",
                children: Object.entries(interactionLabels).map(([value, label]) => /* @__PURE__ */ jsx("option", { value, children: label }, value))
              }
            ),
            /* @__PURE__ */ jsx(
              "input",
              {
                value: description,
                onChange: (e) => setDescription(e.target.value),
                placeholder: "Ex: cliente pediu retorno amanh\xE3 \xE0s 10h",
                className: "px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-200 outline-none"
              }
            ),
            /* @__PURE__ */ jsxs("button", { onClick: handleAddInteraction, disabled: submitting, className: "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-60", children: [
              submitting ? /* @__PURE__ */ jsx(Loader2, { className: "w-4 h-4 animate-spin" }) : /* @__PURE__ */ jsx(Send, { className: "w-4 h-4" }),
              " Registrar"
            ] })
          ] }) }),
          interactions.length === 0 ? /* @__PURE__ */ jsx("div", { className: "rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 p-8 text-center text-sm text-gray-400", children: "Nenhuma intera\xE7\xE3o registrada ainda." }) : /* @__PURE__ */ jsx("div", { className: "space-y-3", children: interactions.map((item) => {
            const creator = contacts.find((c) => c.id === item.createdBy);
            return /* @__PURE__ */ jsxs("div", { className: "relative pl-6 pb-4 border-l border-indigo-100 dark:border-indigo-900 last:pb-0", children: [
              /* @__PURE__ */ jsx("span", { className: "absolute -left-2 top-0 w-4 h-4 rounded-full bg-indigo-600 ring-4 ring-indigo-50 dark:ring-indigo-900/30" }),
              /* @__PURE__ */ jsxs("div", { className: "rounded-2xl bg-gray-50 dark:bg-gray-800/60 p-4", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2 items-center justify-between mb-1", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold text-gray-900 dark:text-white", children: interactionLabels[item.type] }),
                  /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-400", children: new Date(item.createdAt).toLocaleString("pt-BR") })
                ] }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 dark:text-gray-300", children: item.description }),
                /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-400 mt-2", children: [
                  "Registrado por ",
                  creator?.name ?? "Usu\xE1rio"
                ] })
              ] })
            ] }, item.id);
          }) })
        ] }),
        /* @__PURE__ */ jsxs("section", { className: "rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-900 dark:text-white", children: "Tarefas vinculadas" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-400", children: "Atividades em que esse contato \xE9 respons\xE1vel." })
            ] }),
            /* @__PURE__ */ jsx(ClipboardList, { className: "w-5 h-5 text-indigo-400" })
          ] }),
          contactTasks.length === 0 ? /* @__PURE__ */ jsx("div", { className: "rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 p-8 text-center text-sm text-gray-400", children: "Nenhuma tarefa vinculada." }) : /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: contactTasks.map((task) => /* @__PURE__ */ jsxs("div", { className: "rounded-2xl bg-gray-50 dark:bg-gray-800/60 p-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3 mb-2", children: [
              /* @__PURE__ */ jsx("h4", { className: "font-semibold text-sm text-gray-900 dark:text-white", children: task.title }),
              /* @__PURE__ */ jsx("span", { className: "text-[10px] uppercase tracking-wide px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300", children: task.priority })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-500 dark:text-gray-400 line-clamp-2", children: task.description }),
            /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-400 mt-3", children: [
              "Prazo: ",
              task.dueDate
            ] })
          ] }, task.id)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("aside", { className: "space-y-5", children: [
        /* @__PURE__ */ jsxs("section", { className: "rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-900 dark:text-white mb-4", children: "Pr\xF3xima a\xE7\xE3o" }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 p-4", children: [
            /* @__PURE__ */ jsx(CalendarClock, { className: "w-5 h-5 text-indigo-500 mb-2" }),
            /* @__PURE__ */ jsx("p", { className: "font-semibold text-gray-900 dark:text-white", children: contact.nextAction ?? "Definir pr\xF3xima a\xE7\xE3o" }),
            /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500 dark:text-gray-400 mt-1", children: [
              "Prazo: ",
              contact.nextActionDate ?? "Sem prazo"
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-400 mt-2", children: [
              "Respons\xE1vel: ",
              responsible?.name ?? "N\xE3o definido"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("section", { className: "rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
            /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-900 dark:text-white", children: "Documentos" }),
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: handleAddDocument,
                disabled: uploading,
                className: "inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 disabled:opacity-60",
                children: [
                  uploading ? /* @__PURE__ */ jsx(Loader2, { className: "w-3.5 h-3.5 animate-spin" }) : /* @__PURE__ */ jsx(Plus, { className: "w-3.5 h-3.5" }),
                  uploading ? "Enviando\u2026" : "Anexar"
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsx(
            "input",
            {
              ref: fileInputRef,
              type: "file",
              accept: ".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx,.txt",
              className: "hidden",
              onChange: handleFileSelected
            }
          ),
          documents.length === 0 ? /* @__PURE__ */ jsx("div", { className: "rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 p-6 text-center text-sm text-gray-400", children: "Nenhum documento anexado." }) : /* @__PURE__ */ jsx("div", { className: "space-y-2", children: documents.map((doc) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 rounded-2xl bg-gray-50 dark:bg-gray-800/60 p-3", children: [
            /* @__PURE__ */ jsx(FileText, { className: "w-5 h-5 text-indigo-500 shrink-0" }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-gray-900 dark:text-white truncate", children: doc.originalFilename || doc.name }),
              /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-400", children: [
                doc.size > 0 ? `${(doc.size / 1024).toFixed(1)} KB` : "\u2014",
                " \xB7 ",
                doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString("pt-BR") : "\u2014"
              ] })
            ] }),
            doc.hasFile && /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => handleDownload(doc.id, doc.originalFilename || doc.name),
                className: "p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors",
                title: "Baixar",
                children: /* @__PURE__ */ jsx(Download, { className: "w-4 h-4 text-gray-500" })
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => handleDeleteDocument(doc.id),
                disabled: deletingDocId === doc.id,
                className: "p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50",
                title: "Remover",
                children: deletingDocId === doc.id ? /* @__PURE__ */ jsx(Loader2, { className: "w-4 h-4 animate-spin text-red-400" }) : /* @__PURE__ */ jsx(Trash2, { className: "w-4 h-4 text-red-400" })
              }
            )
          ] }, doc.id)) })
        ] }),
        /* @__PURE__ */ jsxs("section", { className: "rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-bold text-gray-900 dark:text-white mb-4", children: "Resumo" }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-3 text-sm", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsx("span", { className: "text-gray-400", children: "Equipe" }),
              /* @__PURE__ */ jsx("span", { className: "font-medium text-gray-700 dark:text-gray-200", children: team?.name ?? "Sem equipe" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsx("span", { className: "text-gray-400", children: "Origem" }),
              /* @__PURE__ */ jsx("span", { className: "font-medium text-gray-700 dark:text-gray-200", children: originLabels[contact.origin ?? "manual"] ?? "Manual" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsx("span", { className: "text-gray-400", children: "Criado em" }),
              /* @__PURE__ */ jsx("span", { className: "font-medium text-gray-700 dark:text-gray-200", children: contact.createdAt })
            ] })
          ] }),
          contact.notes && /* @__PURE__ */ jsx("p", { className: "mt-4 p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/60 text-sm text-gray-500 dark:text-gray-300", children: contact.notes })
        ] })
      ] })
    ] })
  ] });
}
export {
  ContactDetails as default
};
