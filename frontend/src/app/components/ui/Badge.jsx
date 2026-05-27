import { jsx, jsxs } from "react/jsx-runtime";
const STATUS_MAP = {
  online: { label: "Online", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" },
  offline: { label: "Offline", cls: "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400" },
  busy: { label: "Ocupado", cls: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400" },
  away: { label: "Ausente", cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400" }
};
function StatusBadge({ status }) {
  const { label, cls } = STATUS_MAP[status];
  return /* @__PURE__ */ jsxs("span", { className: `inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cls}`, children: [
    /* @__PURE__ */ jsx("span", { className: `w-1.5 h-1.5 rounded-full ${status === "online" ? "bg-emerald-500" : status === "busy" ? "bg-red-500" : status === "away" ? "bg-amber-400" : "bg-gray-400"}` }),
    label
  ] });
}
const PRIORITY_MAP = {
  low: { label: "Baixa", cls: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300", dot: "bg-slate-400" },
  medium: { label: "M\xE9dia", cls: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400", dot: "bg-yellow-500" },
  high: { label: "Alta", cls: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400", dot: "bg-orange-500" },
  urgent: { label: "Urgente", cls: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400", dot: "bg-red-500" }
};
function PriorityBadge({ priority }) {
  const { label, cls, dot } = PRIORITY_MAP[priority];
  return /* @__PURE__ */ jsxs("span", { className: `inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cls}`, children: [
    /* @__PURE__ */ jsx("span", { className: `w-1.5 h-1.5 rounded-full ${dot}` }),
    label
  ] });
}
const COLUMN_MAP = {
  todo: { label: "A Fazer", cls: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300" },
  in_progress: { label: "Em Andamento", cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400" },
  review: { label: "Em Revis\xE3o", cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400" },
  done: { label: "Conclu\xEDdo", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" },
  late: { label: "Atrasado", cls: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400" }
};
function ColumnBadge({ column }) {
  const { label, cls } = COLUMN_MAP[column];
  return /* @__PURE__ */ jsx("span", { className: `inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls}`, children: label });
}
const EVENT_MAP = {
  draft: { label: "Rascunho", cls: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300" },
  scheduled: { label: "Agendado", cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400" },
  sent: { label: "Enviado", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" },
  completed: { label: "Conclu\xEDdo", cls: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400" }
};
function EventStatusBadge({ status }) {
  const { label, cls } = EVENT_MAP[status];
  return /* @__PURE__ */ jsx("span", { className: `inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls}`, children: label });
}
function RoleBadge({ role }) {
  return role === "admin" ? /* @__PURE__ */ jsx("span", { className: "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-indigo-500 to-purple-600 text-white", children: "Admin" }) : /* @__PURE__ */ jsx("span", { className: "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300", children: "Profissional" });
}
export {
  ColumnBadge,
  EventStatusBadge,
  PriorityBadge,
  RoleBadge,
  StatusBadge
};
