import { useState } from 'react';
import { Shield, ShieldAlert, CheckCircle2, XCircle, Clock, AlertTriangle, Filter, Loader2 } from '../components/ui/Icons';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useApp } from '../context/AppContext';
import { useModeration } from '../hooks/useModeration';
import { Avatar } from '../components/ui/Avatar';
const FILTERS = [{
  value: 'all',
  label: 'Todos'
}, {
  value: 'pending',
  label: 'Pendentes'
}, {
  value: 'resolved',
  label: 'Resolvidos'
}, {
  value: 'dismissed',
  label: 'Ignorados'
}];
export default function Moderation() {
  const {
    currentUser
  } = useApp();
  const {
    alerts,
    contacts,
    loading,
    error,
    resolveAlert,
    dismissAlert
  } = useModeration();
  const [filter, setFilter] = useState('pending');
  if (currentUser.role !== 'admin') {
    return <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-20 h-20 rounded-3xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
          <Shield className="w-10 h-10 text-red-400" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Acesso Restrito</h2>
        <p className="text-sm text-gray-400 text-center max-w-sm">Apenas administradores têm acesso ao painel de moderação.</p>
      </div>;
  }
  if (loading) {
    return <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>;
  }
  if (error) {
    return <div className="p-6 text-center text-red-500 text-sm">{error}</div>;
  }
  const filtered = filter === 'all' ? alerts : alerts.filter(a => a.status === filter);
  const stats = {
    pending: alerts.filter(a => a.status === 'pending').length,
    resolved: alerts.filter(a => a.status === 'resolved').length,
    dismissed: alerts.filter(a => a.status === 'dismissed').length,
    total: alerts.length
  };
  const handleResolve = async id => {
    try {
      await resolveAlert(id);
      toast.success('Alerta resolvido.');
    } catch (e) {
      toast.error(e?.message ?? 'Erro ao resolver alerta');
    }
  };
  const handleDismiss = async id => {
    try {
      await dismissAlert(id);
      toast.info('⏭️ Alerta ignorado.');
    } catch (e) {
      toast.error(e?.message ?? 'Erro ao ignorar alerta');
    }
  };
  const formatTime = ts => new Date(ts).toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
  return <div className="p-4 lg:p-6 space-y-5">
      {/* Stats */}
      <motion.div initial={{
      opacity: 0,
      y: -12
    }} animate={{
      opacity: 1,
      y: 0
    }} className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[{
        label: 'Total',
        value: stats.total,
        icon: Shield,
        cls: 'from-indigo-500 to-indigo-700',
        border: 'border-indigo-100 dark:border-indigo-900'
      }, {
        label: 'Pendentes',
        value: stats.pending,
        icon: AlertTriangle,
        cls: 'from-red-500 to-red-700',
        border: 'border-red-100 dark:border-red-900'
      }, {
        label: 'Resolvidos',
        value: stats.resolved,
        icon: CheckCircle2,
        cls: 'from-emerald-500 to-emerald-700',
        border: 'border-emerald-100 dark:border-emerald-900'
      }, {
        label: 'Ignorados',
        value: stats.dismissed,
        icon: XCircle,
        cls: 'from-gray-500 to-gray-700',
        border: 'border-gray-100 dark:border-gray-800'
      }].map(({
        label,
        value,
        icon: Icon,
        cls,
        border
      }) => <div key={label} className={`bg-white dark:bg-gray-900 rounded-2xl p-4 border ${border} shadow-sm flex items-center gap-3`}>
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cls} flex items-center justify-center flex-shrink-0`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
              <p className="text-xs text-gray-400">{label}</p>
            </div>
          </div>)}
      </motion.div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4 flex gap-2 flex-wrap items-center">
        <Filter className="w-4 h-4 text-gray-400" />
        {FILTERS.map(f => <button key={f.value} onClick={() => setFilter(f.value)} className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${filter === f.value ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
            {f.label}
            {f.value === 'pending' && stats.pending > 0 && <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 text-xs font-bold">{stats.pending}</span>}
          </button>)}
        <span className="ml-auto text-xs text-gray-400">{filtered.length} alerta{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Alerts list */}
      <div className="space-y-3">
        <AnimatePresence>
          {filtered.length === 0 ? <motion.div key="empty" initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-16 text-center shadow-sm">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Nenhum alerta encontrado</p>
              <p className="text-xs text-gray-400">
                {filter === 'pending' ? 'Nenhum conteúdo pendente de revisão.' : 'Sem alertas para este filtro.'}
              </p>
            </motion.div> : filtered.map(alert => {
          const user = contacts.find(c => c.id === alert.userId);
          return <motion.div key={alert.id} layout initial={{
            opacity: 0,
            y: 8
          }} animate={{
            opacity: 1,
            y: 0
          }} exit={{
            opacity: 0,
            x: -16
          }} className={`bg-white dark:bg-gray-900 rounded-2xl border shadow-sm p-4 ${alert.status === 'pending' ? 'border-red-200 dark:border-red-900/60' : 'border-gray-100 dark:border-gray-800'}`}>
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${alert.status === 'pending' ? 'bg-red-100 dark:bg-red-900/30' : alert.status === 'resolved' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                    <ShieldAlert className={`w-5 h-5 ${alert.status === 'pending' ? 'text-red-500' : alert.status === 'resolved' ? 'text-emerald-500' : 'text-gray-400'}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          Imagem bloqueada por conteúdo inapropriado
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          Em: <span className="font-medium text-gray-700 dark:text-gray-300">{alert.contextName}</span>
                          {' · '}{alert.context === 'group' ? 'Grupo' : 'Chat Privado'}
                        </p>
                      </div>
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${alert.status === 'pending' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : alert.status === 'resolved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                        {alert.status === 'pending' && <Clock className="w-3 h-3" />}
                        {alert.status === 'resolved' && <CheckCircle2 className="w-3 h-3" />}
                        {alert.status === 'dismissed' && <XCircle className="w-3 h-3" />}
                        {alert.status === 'pending' ? 'Pendente' : alert.status === 'resolved' ? 'Resolvido' : 'Ignorado'}
                      </div>
                    </div>

                    {/* User info */}
                    {user && <div className="flex items-center gap-2 mt-2">
                        <Avatar name={user.name} size="xs" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">{user.name} · {user.position}</span>
                      </div>}

                    <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {formatTime(alert.timestamp)}
                    </p>

                    {/* Blocked content preview */}
                    <div className="mt-2 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/40 flex items-center gap-2">
                      <ShieldAlert className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                      <span className="text-xs text-red-600 dark:text-red-400">Imagem bloqueada por violar as regras da comunidade.</span>
                    </div>

                    {/* Actions */}
                    {alert.status === 'pending' && <div className="flex gap-2 mt-3">
                        <button onClick={() => handleResolve(alert.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Resolver
                        </button>
                        <button onClick={() => handleDismiss(alert.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                          <XCircle className="w-3.5 h-3.5" /> Ignorar
                        </button>
                      </div>}
                  </div>
                </div>
              </motion.div>;
        })}
        </AnimatePresence>
      </div>
    </div>;
}