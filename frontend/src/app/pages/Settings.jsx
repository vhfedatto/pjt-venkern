import { useState } from 'react';
import { Sun, Moon, User, Bell, Palette, ChevronRight, Check } from '../components/ui/Icons';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useTeams } from '../hooks/useTeams';
import { Avatar } from '../components/ui/Avatar';
import { RoleBadge, StatusBadge } from '../components/ui/Badge';
import { usersApi } from '../services/api';
export default function Settings() {
  const {
    currentUser,
    setCurrentUser,
    darkMode,
    setDarkMode
  } = useApp();
  const {
    updateUser
  } = useAuth();
  const {
    teams
  } = useTeams();
  const [profileForm, setProfileForm] = useState({
    name: currentUser.name,
    email: currentUser.email,
    position: currentUser.position
  });
  const [activeSection, setActiveSection] = useState('perfil');
  const [savingProfile, setSavingProfile] = useState(false);
  const team = teams.find(t => t.id === currentUser.teamId);
  const handleSaveProfile = async () => {
    if (!profileForm.name.trim() || !profileForm.email.trim()) {
      toast.error('Nome e e-mail são obrigatórios.');
      return;
    }
    setSavingProfile(true);
    try {
      const updatedUser = await usersApi.updateMe({
        name: profileForm.name,
        email: profileForm.email
      });
      updateUser({
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        username: updatedUser.username,
        role: updatedUser.role,
        is_super_admin: updatedUser.is_super_admin,
        status: updatedUser.status
      });
      setCurrentUser({
        ...currentUser,
        ...profileForm,
        name: updatedUser.name,
        email: updatedUser.email
      });
      toast.success('Perfil atualizado!');
    } catch (error) {
      toast.error(error?.message ?? 'Erro ao atualizar perfil.');
    } finally {
      setSavingProfile(false);
    }
  };
  const inputCls = 'w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-400 transition-all';
  const labelCls = 'block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5';
  const SECTIONS = [{
    id: 'perfil',
    label: 'Perfil',
    icon: User
  }, {
    id: 'aparencia',
    label: 'Aparência',
    icon: Palette
  }, {
    id: 'notificacoes',
    label: 'Notificações',
    icon: Bell
  }];
  return <div className="p-4 lg:p-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Sidebar navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            {/* User card */}
            <div className="p-5 border-b border-gray-100 dark:border-gray-800 text-center">
              <div className="flex justify-center mb-3">
                <Avatar name={currentUser.name} size="xl" status={currentUser.status} />
              </div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{currentUser.name}</p>
              <p className="text-xs text-gray-400 mb-2">{currentUser.position}</p>
              <div className="flex justify-center gap-2">
                <RoleBadge role={currentUser.role} />
                <StatusBadge status={currentUser.status} />
              </div>
              {team && <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full ${team.bgColor} ${team.textColor} font-medium`}>
                  {team.name}
                </span>}
            </div>
            <nav className="p-2">
              {SECTIONS.map(({
              id,
              label,
              icon: Icon
            }) => <button key={id} onClick={() => setActiveSection(id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeSection === id ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                  <Icon className="w-4 h-4" />
                  <span className="flex-1 text-left">{label}</span>
                  <ChevronRight className={`w-3.5 h-3.5 ${activeSection === id ? 'text-indigo-400' : 'text-gray-300'}`} />
                </button>)}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <motion.div key={activeSection} initial={{
          opacity: 0,
          y: 8
        }} animate={{
          opacity: 1,
          y: 0
        }} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">

            {/* Perfil */}
            {activeSection === 'perfil' && <div className="space-y-5">
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Meu Perfil</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Nome completo</label>
                    <input type="text" value={profileForm.name} onChange={e => setProfileForm(p => ({
                  ...p,
                  name: e.target.value
                }))} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Email</label>
                    <input type="email" value={profileForm.email} onChange={e => setProfileForm(p => ({
                  ...p,
                  email: e.target.value
                }))} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Cargo</label>
                    <input type="text" value={profileForm.position} onChange={e => setProfileForm(p => ({
                  ...p,
                  position: e.target.value
                }))} className={inputCls} />
                  </div>
                </div>
                <button onClick={handleSaveProfile} disabled={savingProfile} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium hover:opacity-90 shadow-md transition-opacity disabled:opacity-60">
                  {savingProfile ? 'Salvando…' : 'Salvar Alterações'}
                </button>
              </div>}

            {/* Aparência */}
            {activeSection === 'aparencia' && <div className="space-y-5">
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Aparência</h2>
                <div>
                  <p className={labelCls}>Tema</p>
                  <div className="grid grid-cols-2 gap-3 max-w-sm">
                    <button onClick={() => setDarkMode(false)} className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${!darkMode ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}>
                      <div className="w-12 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                        <Sun className="w-4 h-4 text-amber-400" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        {!darkMode && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Claro</span>
                      </div>
                    </button>
                    <button onClick={() => setDarkMode(true)} className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${darkMode ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}>
                      <div className="w-12 h-8 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center shadow-sm">
                        <Moon className="w-4 h-4 text-indigo-400" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        {darkMode && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Escuro</span>
                      </div>
                    </button>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/40">
                  <p className="text-sm font-medium text-indigo-800 dark:text-indigo-300 mb-0.5">Tema atual: {darkMode ? '🌙 Escuro' : '☀️ Claro'}</p>
                  <p className="text-xs text-indigo-600/70 dark:text-indigo-400/70">Sua preferência é salva automaticamente.</p>
                </div>
              </div>}

            {/* Notificações */}
            {activeSection === 'notificacoes' && <div className="space-y-5">
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Notificações</h2>
                {[{
              label: 'Novas mensagens no grupo',
              sublabel: 'Receba alertas de mensagens em grupos',
              defaultChecked: true
            }, {
              label: 'Mensagens privadas',
              sublabel: 'Alertas de chat privado',
              defaultChecked: true
            }, {
              label: 'Eventos agendados',
              sublabel: 'Lembretes antes dos eventos',
              defaultChecked: true
            }, {
              label: 'Tarefas atrasadas',
              sublabel: 'Alertas de tarefas com prazo vencido',
              defaultChecked: true
            }, {
              label: 'Alertas de moderação',
              sublabel: 'Só visível para admins',
              defaultChecked: currentUser.role === 'admin'
            }, {
              label: 'Novos membros na equipe',
              sublabel: 'Quando alguém entra na equipe',
              defaultChecked: false
            }].map(({
              label,
              sublabel,
              defaultChecked
            }) => <div key={label} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
                      <p className="text-xs text-gray-400">{sublabel}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked={defaultChecked} className="sr-only peer" />
                      <div className="w-10 h-5 bg-gray-200 dark:bg-gray-700 peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:bg-indigo-600 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
                    </label>
                  </div>)}
              </div>}
          </motion.div>
        </div>
      </div>
    </div>;
}