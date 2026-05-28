import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, CheckCircle2, XCircle, ShieldCheck, RefreshCw } from '../components/ui/Icons';
import { invitationsApi } from '../services/api';
function RolePill({
  role
}) {
  const isAdmin = role === 'ADMIN';
  return <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${isAdmin ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
      {isAdmin && <ShieldCheck className="w-3 h-3" />}
      {role}
    </span>;
}
export default function Invitations() {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  async function load() {
    setLoading(true);
    try {
      const res = await invitationsApi.mine();
      setInvitations(res.data ?? []);
    } catch {
      toast.error('Erro ao carregar convites');
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);
  async function handle(id, action) {
    setProcessing(id);
    try {
      if (action === 'accept') {
        await invitationsApi.accept(id);
        toast.success('Convite aceito! Você agora é membro do projeto.');
      } else {
        await invitationsApi.refuse(id);
        toast.success('Convite recusado.');
      }
      setInvitations(prev => prev.filter(inv => inv.id !== id));
    } catch (e) {
      toast.error(e.message ?? 'Erro ao processar convite');
    } finally {
      setProcessing(null);
    }
  }
  return <div className="space-y-6 p-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-indigo-500" />
            Meus Convites
          </h1>
          {!loading && <p className="text-sm text-gray-500 mt-0.5">
              {invitations.length === 0 ? 'Nenhum convite pendente' : `${invitations.length} convite(s) pendente(s)`}
            </p>}
        </div>
        <button onClick={load} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors" title="Atualizar">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? <div className="flex items-center justify-center py-20">
          <div className="w-7 h-7 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
        </div> : invitations.length === 0 ? <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
          <Mail className="w-10 h-10 opacity-30" />
          <p className="text-sm">Você não tem convites pendentes.</p>
        </div> : <div className="space-y-3">
          <AnimatePresence initial={false}>
            {invitations.map(inv => <motion.div key={inv.id} initial={{
          opacity: 0,
          y: -8
        }} animate={{
          opacity: 1,
          y: 0
        }} exit={{
          opacity: 0,
          x: 40,
          height: 0,
          marginBottom: 0
        }} transition={{
          duration: 0.2
        }} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex items-center gap-4">
                {/* Icon */}
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-indigo-500" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                    {inv.project_name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <RolePill role={inv.role} />
                    <span className="text-xs text-gray-400">
                      por <span className="font-medium text-gray-500 dark:text-gray-300">{inv.invited_by_name}</span>
                    </span>
                    <span className="text-xs text-gray-300 dark:text-gray-600">·</span>
                    <span className="text-xs text-gray-400">
                      {new Date(inv.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => handle(inv.id, 'accept')} disabled={processing === inv.id} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-medium rounded-xl transition-colors">
                    {processing === inv.id ? <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    Aceitar
                  </button>
                  <button onClick={() => handle(inv.id, 'refuse')} disabled={processing === inv.id} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 text-gray-600 dark:text-gray-400 text-xs font-medium rounded-xl transition-colors">
                    <XCircle className="w-3.5 h-3.5" />
                    Recusar
                  </button>
                </div>
              </motion.div>)}
          </AnimatePresence>
        </div>}
    </div>;
}