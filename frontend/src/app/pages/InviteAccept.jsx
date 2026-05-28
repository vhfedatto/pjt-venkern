import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { Link2, ShieldCheck, Clock, UserPlus, LogIn, UserCog } from '../components/ui/Icons';
import { inviteLinkApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
export default function InviteAccept({
  token
}) {
  const navigate = useNavigate();
  const {
    user: currentUser,
    isAuthenticated
  } = useAuth();
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => {
    inviteLinkApi.getInfo(token).then(data => setInfo(data)).catch(() => setError('Convite inválido ou expirado.')).finally(() => setLoading(false));
  }, [token]);
  async function handleAccept() {
    setAccepting(true);
    try {
      await inviteLinkApi.accept(token);
      toast.success(`Você entrou no projeto "${info?.projectName}"!`);
      navigate('/');
    } catch (e) {
      toast.error(e.message ?? 'Erro ao aceitar convite');
    } finally {
      setAccepting(false);
    }
  }
  return <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 flex items-center justify-center px-4">
      <motion.div initial={{
      opacity: 0,
      y: 24
    }} animate={{
      opacity: 1,
      y: 0
    }} className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          {/* Top accent */}
          <div className="h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500" />

          <div className="p-8">
            <div className="flex justify-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <Link2 className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>

            {loading && <div className="text-center">
                <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-gray-500">Verificando convite...</p>
              </div>}

            {!loading && error && <div className="text-center space-y-3">
                <p className="text-lg font-semibold text-gray-900 dark:text-white">Convite inválido</p>
                <p className="text-sm text-gray-500">{error}</p>
                <button onClick={() => navigate('/')} className="mt-4 px-6 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl transition-colors">
                  Ir para o início
                </button>
              </div>}

            {!loading && info && !info.valid && <div className="text-center space-y-3">
                <p className="text-lg font-semibold text-gray-900 dark:text-white">Convite expirado</p>
                <p className="text-sm text-gray-500">
                  Este link de convite não é mais válido. Peça ao administrador um novo link.
                </p>
                <button onClick={() => navigate('/')} className="mt-4 px-6 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl transition-colors">
                  Ir para o início
                </button>
              </div>}

            {!loading && info && info.valid && <div className="space-y-5">
                <div className="text-center">
                  <p className="text-xs uppercase tracking-widest text-indigo-500 font-semibold mb-1">Convite para</p>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{info.projectName}</h1>
                </div>

                <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <UserCog className="w-4 h-4 text-indigo-400" />
                    {info.role === 'ADMIN' ? <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" /> Admin
                      </span> : 'Professional'}
                  </span>
                  {info.expiresAt && <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-400" />
                      Expira {new Date(info.expiresAt).toLocaleDateString('pt-BR')}
                    </span>}
                </div>

                {isAuthenticated ? <div className="space-y-3">
                    <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                      Você está logado como <strong>{currentUser?.name}</strong>.
                    </p>
                    <button onClick={handleAccept} disabled={accepting} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-2xl transition-colors flex items-center justify-center gap-2">
                      {accepting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <UserPlus className="w-4 h-4" />}
                      Aceitar convite
                    </button>
                  </div> : <div className="space-y-3">
                    <p className="text-center text-sm text-gray-500">
                      Faça login ou crie uma conta para aceitar este convite.
                    </p>
                    <button onClick={() => navigate(`/login?redirect=/invite/${token}`)} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl transition-colors flex items-center justify-center gap-2">
                      <LogIn className="w-4 h-4" />
                      Entrar / Cadastrar
                    </button>
                  </div>}
              </div>}
          </div>
        </div>
      </motion.div>
    </div>;
}