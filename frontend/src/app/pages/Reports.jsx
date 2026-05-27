import { jsx, jsxs } from "react/jsx-runtime";
import { motion } from "motion/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend
} from "recharts";
import {
  TrendingUp,
  Users,
  ListChecks,
  Shield,
  Loader2,
  RefreshCw,
  MessageSquare,
  Calendar,
  TriangleAlert,
  Star
} from "../components/ui/Icons";
import { useProject } from "../context/ProjectContext";
import { useReports } from "../hooks/useReports";
const STATUS_LABELS = {
  todo: "A Fazer",
  in_progress: "Em Andamento",
  review: "Em Revis\xE3o",
  done: "Conclu\xEDdo",
  late: "Atrasado"
};
const STATUS_COLORS = {
  todo: "#6b7280",
  in_progress: "#3b82f6",
  review: "#f59e0b",
  done: "#10b981",
  late: "#ef4444"
};
const PRIORITY_LABELS = {
  low: "Baixa",
  medium: "M\xE9dia",
  high: "Alta",
  urgent: "Urgente"
};
const PRIORITY_COLORS = {
  low: "#6b7280",
  medium: "#f59e0b",
  high: "#f97316",
  urgent: "#ef4444"
};
const MONTH_NAMES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
function formatMonth(yyyymm) {
  const [, mm] = yyyymm.split("-");
  return MONTH_NAMES[Number(mm) - 1] ?? yyyymm;
}
function ChartCard({ title, children }) {
  return /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5", children: [
    /* @__PURE__ */ jsx("h3", { className: "text-sm font-bold text-gray-900 dark:text-white mb-4", children: title }),
    children
  ] });
}
function EmptyChart({ message = "Sem dados" }) {
  return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-[180px] text-sm text-gray-400", children: message });
}
function PieLegend({ items }) {
  return /* @__PURE__ */ jsx("div", { className: "space-y-1.5 min-w-0", children: items.map(({ name, value, fill }) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
    /* @__PURE__ */ jsx("span", { className: "w-2.5 h-2.5 rounded-full shrink-0", style: { backgroundColor: fill } }),
    /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-500 dark:text-gray-400 truncate", children: name }),
    /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-gray-900 dark:text-white ml-auto", children: value })
  ] }, name)) });
}
function Reports() {
  const { currentProject } = useProject();
  const { summary, tasks, contacts, activity, loading, error, refresh } = useReports(
    currentProject?.id
  );
  if (!currentProject) {
    return /* @__PURE__ */ jsxs("div", { className: "p-6 flex flex-col items-center justify-center min-h-[60vh] gap-3", children: [
      /* @__PURE__ */ jsx(TrendingUp, { className: "w-12 h-12 text-gray-300" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-400 text-sm", children: "Selecione um projeto para ver os relat\xF3rios." })
    ] });
  }
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-64", children: /* @__PURE__ */ jsx(Loader2, { className: "w-8 h-8 animate-spin text-indigo-500" }) });
  }
  if (error) {
    return /* @__PURE__ */ jsxs("div", { className: "p-6 flex flex-col items-center justify-center gap-3 min-h-[40vh]", children: [
      /* @__PURE__ */ jsx("p", { className: "text-red-500 text-sm", children: error }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: refresh,
          className: "inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500 text-white text-sm hover:bg-indigo-600",
          children: [
            /* @__PURE__ */ jsx(RefreshCw, { className: "w-4 h-4" }),
            " Tentar novamente"
          ]
        }
      )
    ] });
  }
  const summaryStats = summary ? [
    { label: "Contatos", value: summary.totalContacts, icon: Users, color: "from-indigo-500 to-indigo-700" },
    { label: "Tarefas", value: summary.totalTasks, icon: ListChecks, color: "from-blue-500 to-blue-700" },
    { label: "Mensagens", value: summary.totalMessages, icon: MessageSquare, color: "from-emerald-500 to-emerald-700" },
    { label: "Alertas", value: summary.totalModerationAlerts, icon: Shield, color: "from-red-500 to-red-700" },
    { label: "Eventos", value: summary.totalEvents, icon: Calendar, color: "from-amber-500 to-amber-700" },
    { label: "Grupos", value: summary.totalGroups, icon: Users, color: "from-purple-500 to-purple-700" },
    { label: "Equipes", value: summary.totalTeams, icon: TrendingUp, color: "from-teal-500 to-teal-700" },
    { label: "Favoritos", value: contacts?.favorites ?? 0, icon: Star, color: "from-yellow-500 to-yellow-600" }
  ] : [];
  const tasksByStatus = tasks?.byStatus.map((r) => ({
    name: STATUS_LABELS[r.status] ?? r.status,
    count: r.count,
    fill: STATUS_COLORS[r.status] ?? "#6366f1"
  })) ?? [];
  const tasksByPriority = tasks?.byPriority.map((r) => ({
    name: PRIORITY_LABELS[r.priority] ?? r.priority,
    count: r.count,
    fill: PRIORITY_COLORS[r.priority] ?? "#6366f1"
  })) ?? [];
  const contactsByTeam = contacts?.byTeam.map((r) => ({
    name: r.team,
    value: r.count,
    fill: r.color
  })) ?? [];
  const contactsByOriginPie = contacts?.byOrigin.map((r, i) => ({
    name: r.origin,
    value: r.count,
    fill: ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6"][i % 6]
  })) ?? [];
  const activityChart = activity.map((p) => ({
    month: formatMonth(p.month),
    Contatos: p.contactsCreated,
    Tarefas: p.tasksCreated,
    "Conclu\xEDdas": p.tasksCompleted,
    Mensagens: p.messagesSent
  }));
  return /* @__PURE__ */ jsxs("div", { className: "p-4 lg:p-6 space-y-5", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-xl font-bold text-gray-900 dark:text-white", children: "Relat\xF3rios" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-400 mt-0.5", children: currentProject.name })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: refresh,
          className: "p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-indigo-500 transition-colors",
          title: "Atualizar",
          children: /* @__PURE__ */ jsx(RefreshCw, { className: "w-4 h-4" })
        }
      )
    ] }),
    summaryStats.length > 0 && /* @__PURE__ */ jsx(
      motion.div,
      {
        initial: { opacity: 0, y: -12 },
        animate: { opacity: 1, y: 0 },
        className: "grid grid-cols-2 sm:grid-cols-4 gap-3",
        children: summaryStats.map(({ label, value, icon: Icon, color }) => /* @__PURE__ */ jsxs(
          "div",
          {
            className: "bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-3",
            children: [
              /* @__PURE__ */ jsx("div", { className: `w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shrink-0`, children: /* @__PURE__ */ jsx(Icon, { className: "w-5 h-5 text-white" }) }),
              /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: value }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-400 truncate", children: label })
              ] })
            ]
          },
          label
        ))
      }
    ),
    tasks && /* @__PURE__ */ jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        transition: { delay: 0.05 },
        className: "grid grid-cols-2 gap-3",
        children: [
          /* @__PURE__ */ jsxs("div", { className: "bg-red-50 dark:bg-red-950/30 rounded-2xl p-4 border border-red-100 dark:border-red-900/40 flex items-center gap-3", children: [
            /* @__PURE__ */ jsx(TriangleAlert, { className: "w-5 h-5 text-red-500 shrink-0" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-red-600 dark:text-red-400", children: tasks.overdue }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-red-500", children: "Tarefas atrasadas" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-900/40 flex items-center gap-3", children: [
            /* @__PURE__ */ jsx(ListChecks, { className: "w-5 h-5 text-emerald-500 shrink-0" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-emerald-600 dark:text-emerald-400", children: tasks.completed }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-emerald-500", children: "Tarefas conclu\xEDdas" })
            ] })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsx(motion.div, { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.08 }, children: /* @__PURE__ */ jsx(ChartCard, { title: "Atividade ao Longo do Tempo", children: activityChart.length === 0 ? /* @__PURE__ */ jsx(EmptyChart, { message: "Nenhuma atividade registrada ainda." }) : /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: 220, children: /* @__PURE__ */ jsxs(LineChart, { data: activityChart, children: [
      /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#e5e7eb" }),
      /* @__PURE__ */ jsx(XAxis, { dataKey: "month", tick: { fontSize: 11 } }),
      /* @__PURE__ */ jsx(YAxis, { tick: { fontSize: 11 }, width: 28, allowDecimals: false }),
      /* @__PURE__ */ jsx(Tooltip, {}),
      /* @__PURE__ */ jsx(Legend, { wrapperStyle: { fontSize: 11 } }),
      /* @__PURE__ */ jsx(Line, { type: "monotone", dataKey: "Contatos", stroke: "#6366f1", strokeWidth: 2, dot: { r: 3 } }),
      /* @__PURE__ */ jsx(Line, { type: "monotone", dataKey: "Tarefas", stroke: "#3b82f6", strokeWidth: 2, dot: { r: 3 } }),
      /* @__PURE__ */ jsx(Line, { type: "monotone", dataKey: "Conclu\xEDdas", stroke: "#10b981", strokeWidth: 2, dot: { r: 3 } }),
      /* @__PURE__ */ jsx(Line, { type: "monotone", dataKey: "Mensagens", stroke: "#f59e0b", strokeWidth: 2, dot: { r: 3 } })
    ] }) }) }) }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsx(motion.div, { initial: { opacity: 0, x: -16 }, animate: { opacity: 1, x: 0 }, transition: { delay: 0.1 }, children: /* @__PURE__ */ jsx(ChartCard, { title: "Tarefas por Status", children: tasksByStatus.every((r) => r.count === 0) ? /* @__PURE__ */ jsx(EmptyChart, { message: "Nenhuma tarefa criada." }) : /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: 180, children: /* @__PURE__ */ jsxs(BarChart, { data: tasksByStatus, barSize: 30, children: [
        /* @__PURE__ */ jsx(XAxis, { dataKey: "name", tick: { fontSize: 10 } }),
        /* @__PURE__ */ jsx(YAxis, { tick: { fontSize: 10 }, width: 24, allowDecimals: false }),
        /* @__PURE__ */ jsx(Tooltip, {}),
        /* @__PURE__ */ jsx(Bar, { dataKey: "count", radius: [6, 6, 0, 0], name: "Tarefas", children: tasksByStatus.map((e) => /* @__PURE__ */ jsx(Cell, { fill: e.fill }, e.name)) })
      ] }) }) }) }),
      /* @__PURE__ */ jsx(motion.div, { initial: { opacity: 0, x: 16 }, animate: { opacity: 1, x: 0 }, transition: { delay: 0.1 }, children: /* @__PURE__ */ jsx(ChartCard, { title: "Tarefas por Prioridade", children: tasksByPriority.every((r) => r.count === 0) ? /* @__PURE__ */ jsx(EmptyChart, { message: "Nenhuma tarefa criada." }) : /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: 180, children: /* @__PURE__ */ jsxs(BarChart, { data: tasksByPriority, barSize: 30, children: [
        /* @__PURE__ */ jsx(XAxis, { dataKey: "name", tick: { fontSize: 10 } }),
        /* @__PURE__ */ jsx(YAxis, { tick: { fontSize: 10 }, width: 24, allowDecimals: false }),
        /* @__PURE__ */ jsx(Tooltip, {}),
        /* @__PURE__ */ jsx(Bar, { dataKey: "count", radius: [6, 6, 0, 0], name: "Tarefas", children: tasksByPriority.map((e) => /* @__PURE__ */ jsx(Cell, { fill: e.fill }, e.name)) })
      ] }) }) }) }),
      /* @__PURE__ */ jsx(motion.div, { initial: { opacity: 0, x: -16 }, animate: { opacity: 1, x: 0 }, transition: { delay: 0.15 }, children: /* @__PURE__ */ jsx(ChartCard, { title: "Contatos por Equipe", children: contactsByTeam.length === 0 ? /* @__PURE__ */ jsx(EmptyChart, { message: "Nenhuma equipe encontrada." }) : /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsx(ResponsiveContainer, { width: "55%", height: 180, children: /* @__PURE__ */ jsxs(PieChart, { children: [
          /* @__PURE__ */ jsx(Pie, { data: contactsByTeam, dataKey: "value", cx: "50%", cy: "50%", outerRadius: 70, innerRadius: 38, children: contactsByTeam.map((e) => /* @__PURE__ */ jsx(Cell, { fill: e.fill }, e.name)) }),
          /* @__PURE__ */ jsx(Tooltip, {})
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "flex-1 min-w-0", children: /* @__PURE__ */ jsx(PieLegend, { items: contactsByTeam }) })
      ] }) }) }),
      /* @__PURE__ */ jsx(motion.div, { initial: { opacity: 0, x: 16 }, animate: { opacity: 1, x: 0 }, transition: { delay: 0.15 }, children: /* @__PURE__ */ jsx(ChartCard, { title: "Contatos por Origem", children: contactsByOriginPie.length === 0 ? /* @__PURE__ */ jsx(EmptyChart, { message: "Nenhuma origem cadastrada." }) : /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsx(ResponsiveContainer, { width: "55%", height: 180, children: /* @__PURE__ */ jsxs(PieChart, { children: [
          /* @__PURE__ */ jsx(Pie, { data: contactsByOriginPie, dataKey: "value", cx: "50%", cy: "50%", outerRadius: 70, innerRadius: 38, children: contactsByOriginPie.map((e) => /* @__PURE__ */ jsx(Cell, { fill: e.fill }, e.name)) }),
          /* @__PURE__ */ jsx(Tooltip, {})
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "flex-1 min-w-0", children: /* @__PURE__ */ jsx(PieLegend, { items: contactsByOriginPie }) })
      ] }) }) }),
      tasks && tasks.byAssignee.length > 0 && /* @__PURE__ */ jsx(
        motion.div,
        {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { delay: 0.2 },
          className: "md:col-span-2",
          children: /* @__PURE__ */ jsx(ChartCard, { title: "Tarefas por Respons\xE1vel (Top 10)", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: 200, children: /* @__PURE__ */ jsxs(
            BarChart,
            {
              data: tasks.byAssignee.map((r) => ({ name: r.name.split(" ")[0], count: r.count })),
              barSize: 28,
              layout: "vertical",
              children: [
                /* @__PURE__ */ jsx(XAxis, { type: "number", tick: { fontSize: 10 }, allowDecimals: false }),
                /* @__PURE__ */ jsx(YAxis, { type: "category", dataKey: "name", tick: { fontSize: 10 }, width: 80 }),
                /* @__PURE__ */ jsx(Tooltip, {}),
                /* @__PURE__ */ jsx(Bar, { dataKey: "count", radius: [0, 6, 6, 0], name: "Tarefas", fill: "#6366f1" })
              ]
            }
          ) }) })
        }
      )
    ] })
  ] });
}
export {
  Reports as default
};
