import type { TaskPriority, TaskColumn, UserStatus, EventStatus } from '../../types';

/* ─── Status Badge ─────────────────────────────────────── */
const STATUS_MAP: Record<UserStatus, { label: string; cls: string }> = {
  online:  { label: 'Online',     cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' },
  offline: { label: 'Offline',    cls: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400' },
  busy:    { label: 'Ocupado',    cls: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' },
  away:    { label: 'Ausente',    cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' },
};

export function StatusBadge({ status }: { status: UserStatus }) {
  const { label, cls } = STATUS_MAP[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${
        status === 'online' ? 'bg-emerald-500' : status === 'busy' ? 'bg-red-500' :
        status === 'away' ? 'bg-amber-400' : 'bg-gray-400'
      }`} />
      {label}
    </span>
  );
}

/* ─── Priority Badge ───────────────────────────────────── */
const PRIORITY_MAP: Record<TaskPriority, { label: string; cls: string; dot: string }> = {
  low:    { label: 'Baixa',   cls: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',      dot: 'bg-slate-400' },
  medium: { label: 'Média',   cls: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400', dot: 'bg-yellow-500' },
  high:   { label: 'Alta',    cls: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400', dot: 'bg-orange-500' },
  urgent: { label: 'Urgente', cls: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',           dot: 'bg-red-500' },
};

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const { label, cls, dot } = PRIORITY_MAP[priority];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

/* ─── Column Badge ─────────────────────────────────────── */
const COLUMN_MAP: Record<TaskColumn, { label: string; cls: string }> = {
  todo:        { label: 'A Fazer',      cls: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300' },
  in_progress: { label: 'Em Andamento', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' },
  review:      { label: 'Em Revisão',   cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' },
  done:        { label: 'Concluído',    cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' },
  late:        { label: 'Atrasado',     cls: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' },
};

export function ColumnBadge({ column }: { column: TaskColumn }) {
  const { label, cls } = COLUMN_MAP[column];
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>{label}</span>;
}

/* ─── Event Status Badge ───────────────────────────────── */
const EVENT_MAP: Record<EventStatus, { label: string; cls: string }> = {
  draft:     { label: 'Rascunho',   cls: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300' },
  scheduled: { label: 'Agendado',   cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' },
  sent:      { label: 'Enviado',    cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' },
  completed: { label: 'Concluído',  cls: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400' },
};

export function EventStatusBadge({ status }: { status: EventStatus }) {
  const { label, cls } = EVENT_MAP[status];
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>{label}</span>;
}

/* ─── Role Badge ───────────────────────────────────────── */
export function RoleBadge({ role }: { role: 'admin' | 'professional' }) {
  return role === 'admin'
    ? <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-indigo-500 to-purple-600 text-white">Admin</span>
    : <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">Profissional</span>;
}
