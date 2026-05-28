import { useState, useMemo, useRef } from 'react';
import { Search, Plus, X, MessageCircle, Pencil, Trash2, LayoutGrid, List, AtSign, Loader2 } from '../components/ui/Icons';
import { usersApi } from '../services/api';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { useContacts } from '../hooks/useContacts';
import { Avatar } from '../components/ui/Avatar';
import { StatusBadge } from '../components/ui/Badge';
import { Modal, ConfirmModal } from '../components/ui/Modal';
const emptyForm = {
  name: '',
  email: '',
  phone: '',
  role: 'professional',
  teamId: '',
  position: '',
  notes: ''
};
export default function Contacts() {
  const {
    currentUser
  } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterTeam, setFilterTeam] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [modalOpen, setModalOpen] = useState(false);
  const [editContact, setEditContact] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const {
    contacts,
    teams,
    loading,
    createContact,
    updateContact,
    deleteContact
  } = useContacts({
    search,
    teamId: filterTeam !== 'all' ? filterTeam : undefined
  });

  // @username lookup state
  const [usernameQuery, setUsernameQuery] = useState('');
  const [usernameResults, setUsernameResults] = useState([]);
  const [usernameSearching, setUsernameSearching] = useState(false);
  const [showUsernameDrop, setShowUsernameDrop] = useState(false);
  const usernameTimer = useRef(null);
  const handleUsernameSearch = q => {
    setUsernameQuery(q);
    if (usernameTimer.current) clearTimeout(usernameTimer.current);
    const clean = q.trim();
    if (clean.length < 2) {
      setUsernameResults([]);
      setShowUsernameDrop(false);
      return;
    }
    usernameTimer.current = setTimeout(async () => {
      setUsernameSearching(true);
      try {
        const results = await usersApi.search(clean);
        setUsernameResults(results);
        setShowUsernameDrop(results.length > 0);
      } catch {
        setUsernameResults([]);
        setShowUsernameDrop(false);
      } finally {
        setUsernameSearching(false);
      }
    }, 300);
  };
  const selectUsernameUser = u => {
    setForm(p => ({
      ...p,
      name: u.name,
      email: u.email
    }));
    setUsernameQuery(u.username ? `@${u.username}` : u.name);
    setShowUsernameDrop(false);
  };

  // Search and teamId are handled server-side; only status filter is local
  const filtered = useMemo(() => filterStatus === 'all' ? contacts : contacts.filter(c => c.status === filterStatus), [contacts, filterStatus]);
  const openCreate = () => {
    setEditContact(null);
    setForm(emptyForm);
    setUsernameQuery('');
    setUsernameResults([]);
    setShowUsernameDrop(false);
    setModalOpen(true);
  };
  const openEdit = c => {
    setEditContact(c);
    setForm({
      name: c.name,
      email: c.email,
      phone: c.phone,
      role: c.role,
      teamId: c.teamId,
      position: c.position,
      notes: c.notes
    });
    setModalOpen(true);
  };
  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      toast.error('Preencha os campos obrigatórios!');
      return;
    }
    setSaving(true);
    try {
      if (editContact) {
        await updateContact(editContact.id, form);
        toast.success('Contato atualizado!');
      } else {
        await createContact(form);
        toast.success('Contato adicionado!');
      }
      setModalOpen(false);
    } catch (e) {
      toast.error(e?.message ?? 'Erro ao salvar contato');
    } finally {
      setSaving(false);
    }
  };
  const handleDelete = async id => {
    const name = contacts.find(c => c.id === id)?.name ?? '';
    try {
      await deleteContact(id);
      toast.success(`"${name}" removido.`);
    } catch (e) {
      toast.error(e?.message ?? 'Erro ao excluir contato');
    }
    setDeleteId(null);
  };
  const inputCls = 'w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all placeholder:text-gray-400';
  const labelCls = 'block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5';
  return <div className="p-4 lg:p-6">
      {/* Toolbar */}
      <motion.div initial={{
      opacity: 0,
      y: -12
    }} animate={{
      opacity: 1,
      y: 0
    }} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4 mb-5 flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar contato..." className={`${inputCls} pl-10 pr-8`} />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><X className="w-3.5 h-3.5" /></button>}
        </div>

        {/* Team filter */}
        <select value={filterTeam} onChange={e => setFilterTeam(e.target.value)} className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-indigo-400">
          <option value="all">Todas as equipes</option>
          {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>

        {/* Status filter */}
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-indigo-400">
          <option value="all">Todos os status</option>
          <option value="online">Online</option>
          <option value="busy">Ocupado</option>
          <option value="away">Ausente</option>
          <option value="offline">Offline</option>
        </select>

        {/* View toggle */}
        <div className="flex rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {['grid', 'list'].map(mode => <button key={mode} onClick={() => setViewMode(mode)} className={`p-2.5 transition-colors ${viewMode === mode ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
              {mode === 'grid' ? <LayoutGrid className="w-4 h-4" /> : <List className="w-4 h-4" />}
            </button>)}
        </div>

        <span className="text-xs text-gray-400">{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</span>

        <button onClick={openCreate} className="ml-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium shadow-md hover:opacity-90 hover:scale-[1.02] transition-all">
          <Plus className="w-4 h-4" /> Novo Contato
        </button>
      </motion.div>

      {/* Contact list */}
      <AnimatePresence mode="wait">
        {loading && contacts.length === 0 ? <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div> : filtered.length === 0 ? <motion.div key="empty" initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} className="bg-white dark:bg-gray-900 rounded-2xl p-16 text-center border border-gray-100 dark:border-gray-800">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-indigo-300" />
            </div>
            <p className="text-gray-500 dark:text-gray-400">Nenhum contato encontrado.</p>
          </motion.div> : viewMode === 'list' ? <motion.div key="list" initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 bg-gray-50 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800 text-xs font-semibold text-gray-400 uppercase tracking-wide">
              <span>Contato</span><span>Equipe</span><span>Status</span><span>Cargo</span><span>Ações</span>
            </div>
            <AnimatePresence>
              {filtered.map(c => {
            const team = teams.find(t => t.id === c.teamId);
            return <motion.div key={c.id} layout initial={{
              opacity: 0
            }} animate={{
              opacity: 1
            }} exit={{
              opacity: 0
            }} className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3.5 border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-slate-50 dark:hover:bg-gray-800/40 transition-colors items-center group">
                    <button onClick={() => navigate(`/contatos/${c.id}`)} className="flex items-center gap-3 min-w-0 text-left">
                      <Avatar name={c.name} size="sm" status={c.status} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{c.name}</p>
                        <p className="text-xs text-gray-400 truncate">{c.email}</p>
                      </div>
                    </button>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${team?.bgColor ?? 'bg-gray-100'} ${team?.textColor ?? 'text-gray-600'} w-fit`}>{team?.name.split(' ')[0]}</span>
                    <StatusBadge status={c.status} />
                    <span className="text-sm text-gray-500 dark:text-gray-400 truncate">{c.position}</span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => navigate('/chat')} className="p-1.5 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-400 hover:text-indigo-600 transition-colors" title="Chat"><MessageCircle className="w-4 h-4" /></button>
                      <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-400 hover:text-blue-600 transition-colors" title="Editar"><Pencil className="w-4 h-4" /></button>
                      {currentUser.role === 'admin' && <button onClick={() => setDeleteId(c.id)} className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 text-red-400 hover:text-red-600 transition-colors" title="Excluir"><Trash2 className="w-4 h-4" /></button>}
                    </div>
                  </motion.div>;
          })}
            </AnimatePresence>
          </motion.div> : <motion.div key="grid" initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence>
              {filtered.map(c => {
            const team = teams.find(t => t.id === c.teamId);
            return <motion.div key={c.id} layout initial={{
              opacity: 0,
              y: 16
            }} animate={{
              opacity: 1,
              y: 0
            }} exit={{
              opacity: 0,
              scale: 0.9
            }} whileHover={{
              y: -3
            }} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all overflow-hidden group">
                    {/* Color strip */}
                    <div className="h-1.5" style={{
                background: team?.color ?? '#6366f1'
              }} />
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <Avatar name={c.name} size="lg" status={c.status} />
                      </div>
                      <button onClick={() => navigate(`/contatos/${c.id}`)} className="text-left">
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-0.5 truncate">{c.name}</h3>
                      </button>
                      <p className="text-xs text-gray-400 truncate mb-3">{c.position}</p>
                      <div className="flex gap-2 mb-4 flex-wrap">
                        <StatusBadge status={c.status} />
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${team?.bgColor ?? 'bg-gray-100'} ${team?.textColor ?? 'text-gray-600'}`}>{team?.name.split(' ')[0]}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => navigate('/chat')} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors">
                          <MessageCircle className="w-3.5 h-3.5" /> Chat
                        </button>
                        <button onClick={() => openEdit(c)} className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-blue-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors" title="Editar"><Pencil className="w-3.5 h-3.5" /></button>
                        {currentUser.role === 'admin' && <button onClick={() => setDeleteId(c.id)} className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors" title="Excluir"><Trash2 className="w-3.5 h-3.5" /></button>}
                      </div>
                    </div>
                  </motion.div>;
          })}
            </AnimatePresence>
          </motion.div>}
      </AnimatePresence>

      {/* Form Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editContact ? 'Editar Contato' : 'Novo Contato'} subtitle={editContact ? 'Atualize as informações' : 'Preencha os dados do novo contato'} footer={<div className="flex gap-3">
            <button onClick={() => setModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Cancelar</button>
            <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium hover:opacity-90 transition-opacity shadow-md disabled:opacity-60 flex items-center justify-center gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {editContact ? 'Salvar' : 'Adicionar'}
            </button>
          </div>}>
        <div className="space-y-4 pb-2">
          {/* @username lookup — only when creating */}
          {!editContact && <div className="relative">
              <label className={labelCls}>Buscar usuário por @username</label>
              <div className="relative">
                <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
                <input type="text" value={usernameQuery} onChange={e => handleUsernameSearch(e.target.value)} onBlur={() => setTimeout(() => setShowUsernameDrop(false), 150)} placeholder="@username ou nome para pré-preencher..." className={`${inputCls} pl-10 pr-10`} />
                {usernameSearching && <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-indigo-400" />}
              </div>
              {showUsernameDrop && <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden">
                  {usernameResults.map(u => <button key={u.id} type="button" onMouseDown={() => selectUsernameUser(u)} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-left transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{u.name}</p>
                        <p className="text-xs text-gray-400 truncate">{u.username ? `@${u.username}` : u.email}</p>
                      </div>
                    </button>)}
                </div>}
            </div>}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className={labelCls}>Nome completo *</label>
              <input type="text" value={form.name} onChange={e => setForm(p => ({
              ...p,
              name: e.target.value
            }))} placeholder="Ex: João Silva" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Telefone *</label>
              <input type="tel" value={form.phone} onChange={e => setForm(p => ({
              ...p,
              phone: e.target.value
            }))} placeholder="(11) 99999-9999" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Email *</label>
              <input type="email" value={form.email} onChange={e => setForm(p => ({
              ...p,
              email: e.target.value
            }))} placeholder="joao@empresa.com" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Cargo</label>
              <input type="text" value={form.position} onChange={e => setForm(p => ({
              ...p,
              position: e.target.value
            }))} placeholder="Ex: Desenvolvedor" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Equipe</label>
              <select value={form.teamId} onChange={e => setForm(p => ({
              ...p,
              teamId: e.target.value
            }))} className={inputCls}>
                <option value="">Sem equipe</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Função</label>
              <select value={form.role} onChange={e => setForm(p => ({
              ...p,
              role: e.target.value
            }))} className={inputCls}>
                <option value="professional">Profissional</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Notas</label>
              <textarea value={form.notes} onChange={e => setForm(p => ({
              ...p,
              notes: e.target.value
            }))} rows={2} placeholder="Observações sobre o contato..." className={`${inputCls} resize-none`} />
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete confirm */}
      <ConfirmModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && handleDelete(deleteId)} title="Excluir contato?" message={`Tem certeza que deseja excluir "${contacts.find(c => c.id === deleteId)?.name}"? Esta ação não pode ser desfeita.`} confirmLabel="Excluir" danger />
    </div>;
}