import { useState, useEffect, useRef } from 'react';
import { Menu, Bell, Sun, Moon, Check, CheckCheck, MailOpen } from '../ui/Icons';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui/Avatar';
import { useNavigate, useLocation } from 'react-router';
import { notificationsApi } from '../../services/api';
import { AnimatePresence, motion } from 'motion/react';
const PAGE_TITLES = {
  '/': 'Dashboard',
  '/contatos': 'Contatos',
  '/kanban': 'Kanban',
  '/grupos': 'Grupos',
  '/chat': 'Chat Privado',
  '/eventos': 'Eventos',
  '/equipes': 'Equipes',
  '/moderacao': 'Moderação',
  '/relatorios': 'Relatórios',
  '/configuracoes': 'Configurações',
  '/membros': 'Membros',
  '/convites': 'Convites'
};
export function Header() {
  const {
    darkMode,
    setDarkMode,
    setSidebarOpen
  } = useApp();
  const {
    user: currentUser
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] ?? 'Venkern';
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  async function loadNotifications() {
    try {
      const res = await notificationsApi.list();
      setNotifications(res.data ?? []);
      setUnreadCount(res.unread_count ?? 0);
    } catch {
      // silent fail
    }
  }
  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30_000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);
  async function markRead(id) {
    await notificationsApi.markRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? {
      ...n,
      is_read: true
    } : n));
    setUnreadCount(c => Math.max(0, c - 1));
  }
  async function markAllRead() {
    await notificationsApi.markAllRead();
    setNotifications(prev => prev.map(n => ({
      ...n,
      is_read: true
    })));
    setUnreadCount(0);
  }
  return <header className="h-16 flex items-center gap-4 px-4 lg:px-6 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-30 flex-shrink-0">
      {/* Mobile menu */}
      <button className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors" onClick={() => setSidebarOpen(true)}>
        <Menu className="w-5 h-5" />
      </button>

      {/* Title */}
      <div className="flex-1">
        <h1 className="text-base font-bold text-gray-900 dark:text-white">{title}</h1>
        <p className="text-xs text-gray-400 hidden sm:block">Venkern · Sistema de Gestão Interna</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Dark mode toggle */}
        <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors" title={darkMode ? 'Modo claro' : 'Modo escuro'}>
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications bell */}
        <div className="relative" ref={dropdownRef}>
          <button onClick={() => setShowDropdown(v => !v)} className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors" title="Notificações">
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center bg-indigo-500 text-white text-[9px] font-bold rounded-full px-0.5">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>}
          </button>

          <AnimatePresence>
            {showDropdown && <motion.div initial={{
            opacity: 0,
            scale: 0.96,
            y: -4
          }} animate={{
            opacity: 1,
            scale: 1,
            y: 0
          }} exit={{
            opacity: 0,
            scale: 0.96,
            y: -4
          }} transition={{
            duration: 0.12
          }} className="absolute right-0 top-11 w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden z-50">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    Notificações {unreadCount > 0 && <span className="ml-1.5 px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs rounded-full">{unreadCount}</span>}
                  </p>
                  {unreadCount > 0 && <button onClick={markAllRead} className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
                      <CheckCheck className="w-3 h-3" />
                      Todas lidas
                    </button>}
                </div>

                {/* List */}
                <div className="max-h-72 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800">
                  {notifications.length === 0 ? <div className="flex flex-col items-center justify-center py-8 gap-2 text-gray-400">
                      <MailOpen className="w-7 h-7 opacity-30" />
                      <p className="text-xs">Sem notificações</p>
                    </div> : notifications.map(n => <div key={n.id} className={`px-4 py-3 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors ${!n.is_read ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}>
                        <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${!n.is_read ? 'bg-indigo-500' : 'bg-transparent'}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 leading-snug">{n.title}</p>
                          {n.content && <p className="text-xs text-gray-500 mt-0.5 leading-snug line-clamp-2">{n.content}</p>}
                          <p className="text-[10px] text-gray-400 mt-1">
                            {new Date(n.created_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                          </p>
                        </div>
                        {!n.is_read && <button onClick={() => markRead(n.id)} className="flex-shrink-0 p-1 text-gray-400 hover:text-indigo-500 transition-colors" title="Marcar como lida">
                            <Check className="w-3.5 h-3.5" />
                          </button>}
                      </div>)}
                </div>
              </motion.div>}
          </AnimatePresence>
        </div>

        {/* User avatar */}
        <button onClick={() => navigate('/configuracoes')} className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <Avatar name={currentUser?.name ?? 'User'} size="sm" />
          <div className="hidden sm:block text-left">
            <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">{(currentUser?.name ?? 'User').split(' ')[0]}</p>
            <p className="text-xs text-gray-400 leading-tight">
              {currentUser?.is_super_admin ? 'Super Admin' : 'Usuário'}
            </p>
          </div>
        </button>
      </div>
    </header>;
}