import { useNavigate } from 'react-router';
import { Users, Trello, CalendarDays, MessageSquare, Shield, Building2, CheckCircle2, AlertTriangle, ArrowRight } from '../components/ui/Icons';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { useProject } from '../context/ProjectContext';
import { useDashboard } from '../hooks/useDashboard';
import { useContacts } from '../hooks/useContacts';
import { useTasks } from '../hooks/useTasks';
import { useEvents } from '../hooks/useEvents';
import { useModeration } from '../hooks/useModeration';
import { Avatar } from '../components/ui/Avatar';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
export default function Dashboard() {
  const {
    currentUser
  } = useApp();
  const {
    currentProject
  } = useProject();
  const {
    summary
  } = useDashboard(currentProject?.id);
  const {
    contacts,
    teams
  } = useContacts();
  const {
    tasks
  } = useTasks();
  const {
    events
  } = useEvents();
  const {
    alerts: moderationAlerts
  } = useModeration();
  const navigate = useNavigate();
  if (!currentProject) {
    return <div className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-4 text-gray-400">
        <Building2 className="w-12 h-12 opacity-40" />
        <p className="text-base font-medium">Selecione um projeto para visualizar o dashboard.</p>
      </div>;
  }
  const stats = {
    totalContacts: summary?.total_contacts ?? contacts.length,
    totalTeams: summary?.total_teams ?? teams.length,
    pendingTasks: summary ? summary.todo_tasks + summary.in_progress_tasks : tasks.filter(t => t.column === 'todo' || t.column === 'in_progress').length,
    lateTasks: summary?.late_tasks ?? tasks.filter(t => t.column === 'late').length,
    scheduledEvents: summary?.scheduled_events ?? events.filter(e => e.status === 'scheduled' || e.status === 'draft').length,
    activeGroups: summary?.total_groups ?? 0,
    pendingAlerts: moderationAlerts.filter(a => a.status === 'pending').length,
    doneTasks: summary?.done_tasks ?? tasks.filter(t => t.column === 'done').length
  };
  const tasksByColumn = [{
    name: 'A Fazer',
    value: tasks.filter(t => t.column === 'todo').length,
    color: '#6b7280'
  }, {
    name: 'Andamento',
    value: tasks.filter(t => t.column === 'in_progress').length,
    color: '#3b82f6'
  }, {
    name: 'Revisão',
    value: tasks.filter(t => t.column === 'review').length,
    color: '#f59e0b'
  }, {
    name: 'Concluído',
    value: tasks.filter(t => t.column === 'done').length,
    color: '#10b981'
  }, {
    name: 'Atrasado',
    value: tasks.filter(t => t.column === 'late').length,
    color: '#ef4444'
  }];
  const contactsByTeam = teams.map(t => ({
    name: t.name.split(' ')[0],
    value: contacts.filter(c => c.teamId === t.id).length,
    color: t.color
  }));
  const recentContacts = [...contacts].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
  const lateTasks = tasks.filter(t => t.column === 'late').slice(0, 4);
  const upcomingEvents = events.filter(e => e.status === 'scheduled').slice(0, 3);
  const statCards = [{
    label: 'Total de Contatos',
    value: stats.totalContacts,
    icon: Users,
    color: 'from-indigo-500 to-indigo-700',
    border: 'border-indigo-100 dark:border-indigo-900',
    path: '/contatos'
  }, {
    label: 'Equipes',
    value: stats.totalTeams,
    icon: Building2,
    color: 'from-violet-500 to-violet-700',
    border: 'border-violet-100 dark:border-violet-900',
    path: '/equipes'
  }, {
    label: 'Tarefas Pendentes',
    value: stats.pendingTasks,
    icon: Trello,
    color: 'from-blue-500 to-blue-700',
    border: 'border-blue-100 dark:border-blue-900',
    path: '/kanban'
  }, {
    label: 'Tarefas Atrasadas',
    value: stats.lateTasks,
    icon: AlertTriangle,
    color: 'from-red-500 to-red-700',
    border: 'border-red-100 dark:border-red-900',
    path: '/kanban'
  }, {
    label: 'Eventos Agendados',
    value: stats.scheduledEvents,
    icon: CalendarDays,
    color: 'from-amber-500 to-orange-600',
    border: 'border-amber-100 dark:border-amber-900',
    path: '/eventos'
  }, {
    label: 'Grupos Ativos',
    value: stats.activeGroups,
    icon: MessageSquare,
    color: 'from-emerald-500 to-teal-600',
    border: 'border-emerald-100 dark:border-emerald-900',
    path: '/grupos'
  }, {
    label: 'Tarefas Concluídas',
    value: stats.doneTasks,
    icon: CheckCircle2,
    color: 'from-green-500 to-green-700',
    border: 'border-green-100 dark:border-green-900',
    path: '/kanban'
  }, {
    label: 'Alertas Mod.',
    value: stats.pendingAlerts,
    icon: Shield,
    color: 'from-pink-500 to-rose-600',
    border: 'border-pink-100 dark:border-pink-900',
    path: '/moderacao'
  }];
  return <div className="p-4 lg:p-6 space-y-6">
      {/* Welcome */}
      <motion.div initial={{
      opacity: 0,
      y: -12
    }} animate={{
      opacity: 1,
      y: 0
    }}>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Olá, {currentUser.name.split(' ')[0]}!
        </h2>
        <p className="text-sm text-gray-400 mt-0.5">Aqui está o resumo de hoje — {new Date().toLocaleDateString('pt-BR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long'
        })}</p>
      </motion.div>

      {/* Stats grid */}
      <motion.div initial={{
      opacity: 0,
      y: 12
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      delay: 0.05
    }} className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map(({
        label,
        value,
        icon: Icon,
        color,
        border,
        path
      }, i) => <motion.div key={label} whileHover={{
        scale: 1.02,
        y: -2
      }} transition={{
        duration: 0.15
      }} onClick={() => navigate(path)} className={`bg-white dark:bg-gray-900 rounded-2xl p-4 border ${border} shadow-sm cursor-pointer hover:shadow-md transition-shadow`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                <p className="text-xs text-gray-400 leading-tight">{label}</p>
              </div>
            </div>
          </motion.div>)}
      </motion.div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Tasks chart */}
        <motion.div initial={{
        opacity: 0,
        x: -16
      }} animate={{
        opacity: 1,
        x: 0
      }} transition={{
        delay: 0.1
      }} className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Tarefas por Status</h3>
            <button onClick={() => navigate('/kanban')} className="text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline">
              Ver Kanban <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={tasksByColumn} barSize={28}>
              <XAxis dataKey="name" tick={{
              fontSize: 11
            }} />
              <YAxis tick={{
              fontSize: 11
            }} width={20} />
              <Tooltip />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {tasksByColumn.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Contacts by team pie */}
        <motion.div initial={{
        opacity: 0,
        x: 16
      }} animate={{
        opacity: 1,
        x: 0
      }} transition={{
        delay: 0.1
      }} className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Contatos por Equipe</h3>
            <button onClick={() => navigate('/equipes')} className="text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline">
              Ver Equipes <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="60%" height={180}>
              <PieChart>
                <Pie data={contactsByTeam} dataKey="value" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                  {contactsByTeam.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {contactsByTeam.map(({
              name,
              value,
              color
            }) => <div key={name} className="flex items-center gap-2 text-sm">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{
                backgroundColor: color
              }} />
                  <span className="text-gray-600 dark:text-gray-400 text-xs">{name}</span>
                  <span className="font-bold text-gray-900 dark:text-white text-xs ml-auto">{value}</span>
                </div>)}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent contacts */}
        <motion.div initial={{
        opacity: 0,
        y: 16
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.15
      }} className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Contatos Recentes</h3>
            <button onClick={() => navigate('/contatos')} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">Ver todos</button>
          </div>
          <div className="space-y-3">
            {recentContacts.map(c => {
            const team = teams.find(t => t.id === c.teamId);
            return <div key={c.id} className="flex items-center gap-3">
                  <Avatar name={c.name} size="sm" status={c.status} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{c.name}</p>
                    <p className="text-xs text-gray-400 truncate">{c.position}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${team?.bgColor ?? 'bg-gray-100'} ${team?.textColor ?? 'text-gray-600'} flex-shrink-0`}>
                    {team?.name.split(' ')[0]}
                  </span>
                </div>;
          })}
          </div>
        </motion.div>

        {/* Late tasks */}
        <motion.div initial={{
        opacity: 0,
        y: 16
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.18
      }} className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" /> Tarefas Atrasadas
            </h3>
            <button onClick={() => navigate('/kanban')} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">Ver Kanban</button>
          </div>
          {lateTasks.length === 0 ? <div className="text-center py-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Nenhuma tarefa atrasada!</p>
            </div> : <div className="space-y-2">
              {lateTasks.map(t => {
            const assignee = contacts.find(c => c.id === t.assigneeId);
            return <div key={t.id} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/40">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{t.title}</p>
                      <p className="text-xs text-gray-400">
                        {assignee?.name.split(' ')[0]} · Venceu em {new Date(t.dueDate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>;
          })}
            </div>}
        </motion.div>

        {/* Upcoming events */}
        <motion.div initial={{
        opacity: 0,
        y: 16
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.2
      }} className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Próximos Eventos</h3>
            <button onClick={() => navigate('/eventos')} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">Ver todos</button>
          </div>
          {upcomingEvents.length === 0 ? <p className="text-sm text-gray-400 text-center py-4">Nenhum evento agendado.</p> : <div className="space-y-3">
              {upcomingEvents.map(ev => <div key={ev.id} className="flex gap-3 p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/40">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-blue-700 dark:text-blue-300 text-xs font-bold leading-none">
                      {new Date(ev.date + 'T00:00:00').toLocaleDateString('pt-BR', {
                  day: '2-digit'
                })}
                    </span>
                    <span className="text-blue-500 text-[9px] uppercase">
                      {new Date(ev.date + 'T00:00:00').toLocaleDateString('pt-BR', {
                  month: 'short'
                })}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{ev.title}</p>
                    <p className="text-xs text-gray-400">{ev.time} · {ev.location}</p>
                  </div>
                </div>)}
            </div>}
        </motion.div>
      </div>
    </div>;
}