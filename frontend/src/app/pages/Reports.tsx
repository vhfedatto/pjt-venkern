import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  LineChart, Line, CartesianGrid, Legend,
} from 'recharts';
import {
  TrendingUp, Users, ListChecks, Shield, Loader2, RefreshCw,
  MessageSquare, Calendar, TriangleAlert, Star,
} from '../components/ui/Icons';
import { useProject } from '../context/ProjectContext';
import { useReports } from '../hooks/useReports';

// ── Helpers ────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  todo: 'A Fazer',
  in_progress: 'Em Andamento',
  review: 'Em Revisão',
  done: 'Concluído',
  late: 'Atrasado',
};
const STATUS_COLORS: Record<string, string> = {
  todo: '#6b7280',
  in_progress: '#3b82f6',
  review: '#f59e0b',
  done: '#10b981',
  late: '#ef4444',
};

const PRIORITY_LABELS: Record<string, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  urgent: 'Urgente',
};
const PRIORITY_COLORS: Record<string, string> = {
  low: '#6b7280',
  medium: '#f59e0b',
  high: '#f97316',
  urgent: '#ef4444',
};

const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
function formatMonth(yyyymm: string) {
  const [, mm] = yyyymm.split('-');
  return MONTH_NAMES[Number(mm) - 1] ?? yyyymm;
}

// ── Sub-components ─────────────────────────────────────────────────────────

function ChartCard({ title, children }: Readonly<{ title: string; children: ReactNode }>) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
      <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">{title}</h3>
      {children}
    </div>
  );
}

function EmptyChart({ message = 'Sem dados' }: Readonly<{ message?: string }>) {
  return (
    <div className="flex items-center justify-center h-[180px] text-sm text-gray-400">
      {message}
    </div>
  );
}

function PieLegend({ items }: Readonly<{ items: { name: string; value: number; fill: string }[] }>) {
  return (
    <div className="space-y-1.5 min-w-0">
      {items.map(({ name, value, fill }) => (
        <div key={name} className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: fill }} />
          <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{name}</span>
          <span className="text-xs font-bold text-gray-900 dark:text-white ml-auto">{value}</span>
        </div>
      ))}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function Reports() {
  const { currentProject } = useProject();
  const { summary, tasks, contacts, activity, loading, error, refresh } = useReports(
    currentProject?.id,
  );

  if (!currentProject) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <TrendingUp className="w-12 h-12 text-gray-300" />
        <p className="text-gray-400 text-sm">Selecione um projeto para ver os relatórios.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex flex-col items-center justify-center gap-3 min-h-[40vh]">
        <p className="text-red-500 text-sm">{error}</p>
        <button
          onClick={refresh}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500 text-white text-sm hover:bg-indigo-600"
        >
          <RefreshCw className="w-4 h-4" /> Tentar novamente
        </button>
      </div>
    );
  }

  // ── Derived data ──────────────────────────────────────────────────────────

  const summaryStats = summary
    ? [
        { label: 'Contatos',  value: summary.totalContacts,          icon: Users,         color: 'from-indigo-500 to-indigo-700' },
        { label: 'Tarefas',   value: summary.totalTasks,             icon: ListChecks,    color: 'from-blue-500 to-blue-700' },
        { label: 'Mensagens', value: summary.totalMessages,          icon: MessageSquare, color: 'from-emerald-500 to-emerald-700' },
        { label: 'Alertas',   value: summary.totalModerationAlerts,  icon: Shield,        color: 'from-red-500 to-red-700' },
        { label: 'Eventos',   value: summary.totalEvents,            icon: Calendar,      color: 'from-amber-500 to-amber-700' },
        { label: 'Grupos',    value: summary.totalGroups,            icon: Users,         color: 'from-purple-500 to-purple-700' },
        { label: 'Equipes',   value: summary.totalTeams,             icon: TrendingUp,    color: 'from-teal-500 to-teal-700' },
        { label: 'Favoritos', value: contacts?.favorites ?? 0,       icon: Star,          color: 'from-yellow-500 to-yellow-600' },
      ]
    : [];

  const tasksByStatus =
    tasks?.byStatus.map(r => ({
      name: STATUS_LABELS[r.status] ?? r.status,
      count: r.count,
      fill: STATUS_COLORS[r.status] ?? '#6366f1',
    })) ?? [];

  const tasksByPriority =
    tasks?.byPriority.map(r => ({
      name: PRIORITY_LABELS[r.priority] ?? r.priority,
      count: r.count,
      fill: PRIORITY_COLORS[r.priority] ?? '#6366f1',
    })) ?? [];

  const contactsByTeam =
    contacts?.byTeam.map(r => ({
      name: r.team,
      value: r.count,
      fill: r.color,
    })) ?? [];

  const contactsByOriginPie =
    contacts?.byOrigin.map((r, i) => ({
      name: r.origin,
      value: r.count,
      fill: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'][i % 6],
    })) ?? [];

  const activityChart = activity.map(p => ({
    month: formatMonth(p.month),
    Contatos: p.contactsCreated,
    Tarefas: p.tasksCreated,
    'Concluídas': p.tasksCompleted,
    Mensagens: p.messagesSent,
  }));

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Relatórios</h1>
          <p className="text-xs text-gray-400 mt-0.5">{currentProject.name}</p>
        </div>
        <button
          onClick={refresh}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-indigo-500 transition-colors"
          title="Atualizar"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Summary cards */}
      {summaryStats.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          {summaryStats.map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-3"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shrink-0`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                <p className="text-xs text-gray-400 truncate">{label}</p>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Overdue / completed highlight */}
      {tasks && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-2 gap-3"
        >
          <div className="bg-red-50 dark:bg-red-950/30 rounded-2xl p-4 border border-red-100 dark:border-red-900/40 flex items-center gap-3">
            <TriangleAlert className="w-5 h-5 text-red-500 shrink-0" />
            <div>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{tasks.overdue}</p>
              <p className="text-xs text-red-500">Tarefas atrasadas</p>
            </div>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-900/40 flex items-center gap-3">
            <ListChecks className="w-5 h-5 text-emerald-500 shrink-0" />
            <div>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{tasks.completed}</p>
              <p className="text-xs text-emerald-500">Tarefas concluídas</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Activity over time */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
        <ChartCard title="Atividade ao Longo do Tempo">
          {activityChart.length === 0 ? (
            <EmptyChart message="Nenhuma atividade registrada ainda." />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={activityChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} width={28} allowDecimals={false} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="Contatos" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Tarefas" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Concluídas" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Mensagens" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </motion.div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Tasks by status */}
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <ChartCard title="Tarefas por Status">
            {tasksByStatus.every(r => r.count === 0) ? (
              <EmptyChart message="Nenhuma tarefa criada." />
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={tasksByStatus} barSize={30}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} width={24} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Tarefas">
                    {tasksByStatus.map(e => <Cell key={e.name} fill={e.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </motion.div>

        {/* Tasks by priority */}
        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <ChartCard title="Tarefas por Prioridade">
            {tasksByPriority.every(r => r.count === 0) ? (
              <EmptyChart message="Nenhuma tarefa criada." />
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={tasksByPriority} barSize={30}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} width={24} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Tarefas">
                    {tasksByPriority.map(e => <Cell key={e.name} fill={e.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </motion.div>

        {/* Contacts by team */}
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
          <ChartCard title="Contatos por Equipe">
            {contactsByTeam.length === 0 ? (
              <EmptyChart message="Nenhuma equipe encontrada." />
            ) : (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="55%" height={180}>
                  <PieChart>
                    <Pie data={contactsByTeam} dataKey="value" cx="50%" cy="50%" outerRadius={70} innerRadius={38}>
                      {contactsByTeam.map(e => <Cell key={e.name} fill={e.fill} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 min-w-0">
                  <PieLegend items={contactsByTeam} />
                </div>
              </div>
            )}
          </ChartCard>
        </motion.div>

        {/* Contacts by origin */}
        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
          <ChartCard title="Contatos por Origem">
            {contactsByOriginPie.length === 0 ? (
              <EmptyChart message="Nenhuma origem cadastrada." />
            ) : (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="55%" height={180}>
                  <PieChart>
                    <Pie data={contactsByOriginPie} dataKey="value" cx="50%" cy="50%" outerRadius={70} innerRadius={38}>
                      {contactsByOriginPie.map(e => <Cell key={e.name} fill={e.fill} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 min-w-0">
                  <PieLegend items={contactsByOriginPie} />
                </div>
              </div>
            )}
          </ChartCard>
        </motion.div>

        {/* Top assignees */}
        {tasks && tasks.byAssignee.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="md:col-span-2"
          >
            <ChartCard title="Tarefas por Responsável (Top 10)">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={tasks.byAssignee.map(r => ({ name: r.name.split(' ')[0], count: r.count }))}
                  barSize={28}
                  layout="vertical"
                >
                  <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={80} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]} name="Tarefas" fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </motion.div>
        )}

      </div>
    </div>
  );
}