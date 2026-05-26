import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Users, Pencil, Trash2, UserPlus, UserMinus, Search, AtSign, Loader2 } from '../components/ui/Icons';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useApp } from '../context/AppContext';
import { useProject } from '../context/ProjectContext';
import { Avatar } from '../components/ui/Avatar';
import { Modal, ConfirmModal } from '../components/ui/Modal';
import { teamsApi } from '../services/api';

// ── Types ──────────────────────────────────────────────────────────────────────

interface ApiMember {
  id: number;
  full_name: string;
  initials: string;
  role: string;
}

interface ApiTeam {
  id: number;
  name: string;
  description: string | null;
  color: string | null;
  members_count: number;
  members: ApiMember[];
}

interface PlatformUser {
  id: number;
  name: string;
  email: string;
  username: string | null;
  role: string | null;
  kind: 'user' | 'contact';
  contact_id: number | null;
  already_member?: boolean;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const emptyForm = { name: '', description: '', color: '#6366f1' };

const PRESET_COLORS = [
  '#6366f1', '#ec4899', '#10b981', '#8b5cf6', '#f59e0b', '#3b82f6',
];

const inputCls = 'w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-400 transition-all placeholder:text-gray-400';
const labelCls = 'block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5';

// ── Component ─────────────────────────────────────────────────────────────────

export default function Teams() {
  const { currentUser } = useApp();
  const { currentProject } = useProject();
  const isAdmin = currentUser.role === 'admin';

  const [teams, setTeams] = useState<ApiTeam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);

  // Create / Edit modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editTeam, setEditTeam] = useState<ApiTeam | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // Delete modal
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Invite modal
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteTeamId, setInviteTeamId] = useState<number | null>(null);
  const [inviteQuery, setInviteQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PlatformUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [inviting, setInviting] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedTeam = teams.find(t => t.id === selectedTeamId) ?? null;

  // ── Load teams ─────────────────────────────────────────────────────────────

  const loadTeams = useCallback(async () => {
    if (!currentProject) {
      setTeams([]);
      setIsLoading(false);
      return;
    }
    try {
      const data = await teamsApi.list({ project_id: currentProject.id });
      setTeams(data as ApiTeam[]);
    } catch {
      toast.error('Erro ao carregar equipes.');
    } finally {
      setIsLoading(false);
    }
  }, [currentProject]);

  useEffect(() => { loadTeams(); }, [loadTeams]);

  // ── Create / Edit ──────────────────────────────────────────────────────────

  const openCreate = () => {
    setEditTeam(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (t: ApiTeam, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditTeam(t);
    setForm({ name: t.name, description: t.description ?? '', color: t.color ?? '#6366f1' });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Nome é obrigatório!'); return; }
    setSaving(true);
    try {
      if (editTeam) {
        const updated = await teamsApi.update(String(editTeam.id), form) as ApiTeam;
        setTeams(prev => prev.map(t => t.id === updated.id ? updated : t));
        toast.success('Equipe atualizada!');
      } else {
        const created = await teamsApi.create({ ...form, project_id: currentProject?.id }) as ApiTeam;
        setTeams(prev => [...prev, created]);
        toast.success('Equipe criada!');
      }
      setModalOpen(false);
    } catch (err: any) {
      toast.error(err.message ?? 'Erro ao salvar equipe.');
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await teamsApi.remove(String(deleteId));
      setTeams(prev => prev.filter(t => t.id !== deleteId));
      if (selectedTeamId === deleteId) setSelectedTeamId(null);
      toast.success('Equipe removida.');
      setDeleteId(null);
    } catch (err: any) {
      toast.error(err.message ?? 'Erro ao excluir equipe.');
    } finally {
      setDeleting(false);
    }
  };

  // ── Invite user ───────────────────────────────────────────────────────────

  const openInvite = (teamId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setInviteTeamId(teamId);
    setInviteQuery('');
    setSearchResults([]);
    setInviteOpen(true);
  };

  const handleInviteSearch = (q: string) => {
    setInviteQuery(q);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    const clean = q.trim();
    if (clean.length < 2) { setSearchResults([]); return; }
    searchTimer.current = setTimeout(async () => {
      setSearching(true);
      try {
        if (!inviteTeamId) {
          setSearchResults([]);
          return;
        }
        const results = await teamsApi.searchCandidates(String(inviteTeamId), clean) as PlatformUser[];
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
  };

  const handleInviteUser = async (user: PlatformUser) => {
    if (!inviteTeamId) return;
    setInviting(true);
    try {
      const updated = await teamsApi.addMember(
        String(inviteTeamId),
        user.kind === 'contact' ? { contact_id: user.contact_id ?? user.id } : { user_id: user.id },
      ) as ApiTeam;
      setTeams(prev => prev.map(t => t.id === updated.id ? updated : t));
      toast.success(`${user.name} adicionado à equipe!`);
      setInviteOpen(false);
    } catch (err: any) {
      toast.error(err.message ?? 'Erro ao convidar usuário.');
    } finally {
      setInviting(false);
    }
  };

  // ── Remove member ─────────────────────────────────────────────────────────

  const handleRemoveMember = async (teamId: number, contactId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updated = await teamsApi.removeMember(String(teamId), String(contactId)) as ApiTeam;
      setTeams(prev => prev.map(t => t.id === updated.id ? updated : t));
      toast.success('Membro removido da equipe.');
    } catch (err: any) {
      toast.error(err.message ?? 'Erro ao remover membro.');
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  const inviteTeam = teams.find(t => t.id === inviteTeamId);

  return (
    <div className="p-4 lg:p-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-5">
        <div />
        {isAdmin && (
          <button onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium shadow-md hover:opacity-90 hover:scale-[1.02] transition-all">
            <Plus className="w-4 h-4" /> Nova Equipe
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Teams list */}
        <div className="lg:col-span-1 space-y-3">
          {teams.length === 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-10 text-center">
              <p className="text-sm text-gray-400">Nenhuma equipe cadastrada.</p>
            </div>
          )}
          {teams.map(t => {
            const isSelected = t.id === selectedTeamId;
            const color = t.color ?? '#6366f1';
            return (
              <motion.div key={t.id} whileHover={{ scale: 1.01 }}
                onClick={() => setSelectedTeamId(isSelected ? null : t.id)}
                className={`group bg-white dark:bg-gray-900 rounded-2xl border shadow-sm p-5 cursor-pointer transition-all ${isSelected ? 'border-indigo-300 dark:border-indigo-700 ring-2 ring-indigo-200 dark:ring-indigo-900' : 'border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-sm"
                      style={{ background: `linear-gradient(135deg, ${color}, ${color}bb)` }}>
                      {t.name[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm">{t.name}</h3>
                      <p className="text-xs text-gray-400">{t.members_count} membro{t.members_count !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                      <button onClick={e => openInvite(t.id, e)}
                        className="p-1.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/30 text-green-500 transition-colors" title="Convidar usuário">
                        <UserPlus className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={e => openEdit(t, e)}
                        className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-400 transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={e => { e.stopPropagation(); setDeleteId(t.id); }}
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-400 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-400 mb-3 line-clamp-2">{t.description}</p>
                {/* Member avatars */}
                <div className="flex items-center mt-1 -space-x-2">
                  {t.members.slice(0, 5).map(m => (
                    <Avatar key={m.id} name={m.full_name} size="xs" className="ring-2 ring-white dark:ring-gray-900" />
                  ))}
                  {t.members_count > 5 && (
                    <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[10px] font-bold text-gray-600 dark:text-gray-300 ring-2 ring-white dark:ring-gray-900">
                      +{t.members_count - 5}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Team detail */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {selectedTeam ? (
              <motion.div key={selectedTeam.id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="h-2" style={{ background: selectedTeam.color ?? '#6366f1' }} />
                <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-sm"
                      style={{ background: `linear-gradient(135deg, ${selectedTeam.color ?? '#6366f1'}, ${selectedTeam.color ?? '#6366f1'}bb)` }}>
                      {selectedTeam.name[0]}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white">{selectedTeam.name}</h2>
                      <p className="text-sm text-gray-400">{selectedTeam.description}</p>
                    </div>
                  </div>
                  {isAdmin && (
                    <button onClick={e => openInvite(selectedTeam.id, e)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-sm font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors">
                      <UserPlus className="w-4 h-4" /> Convidar
                    </button>
                  )}
                </div>

                <div className="p-5">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    Membros ({selectedTeam.members_count})
                  </h3>
                  {selectedTeam.members.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-6">Nenhum membro nesta equipe ainda.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedTeam.members.map(m => (
                        <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group/member">
                          <Avatar name={m.full_name} size="md" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{m.full_name}</p>
                            <p className="text-xs text-gray-400 truncate">{m.role}</p>
                          </div>
                          {isAdmin && (
                            <button
                              onClick={e => handleRemoveMember(selectedTeam.id, m.id, e)}
                              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-400 opacity-0 group-hover/member:opacity-100 transition-all"
                              title="Remover da equipe">
                              <UserMinus className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center p-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-indigo-300" />
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Selecione uma equipe</p>
                <p className="text-xs text-gray-400">Clique em uma equipe para ver os detalhes e membros</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Create / Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}
        title={editTeam ? 'Editar Equipe' : 'Nova Equipe'}
        maxWidth="max-w-lg"
        footer={
          <div className="flex gap-3">
            <button onClick={() => setModalOpen(false)}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800">
              Cancelar
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium hover:opacity-90 shadow-md disabled:opacity-60 flex items-center justify-center gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {editTeam ? 'Salvar' : 'Criar'}
            </button>
          </div>
        }
      >
        <div className="space-y-4 pb-2">
          <div>
            <label className={labelCls}>Nome *</label>
            <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="Ex: Desenvolvimento" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Descrição</label>
            <input type="text" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Descrição da equipe" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Cor</label>
            <div className="flex gap-2">
              {PRESET_COLORS.map(color => (
                <button key={color} type="button" onClick={() => setForm(p => ({ ...p, color }))}
                  className={`w-8 h-8 rounded-full ring-offset-2 transition-all ${form.color === color ? 'ring-2 ring-gray-400 scale-110' : ''}`}
                  style={{ backgroundColor: color }} />
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Invite User Modal */}
      <Modal isOpen={inviteOpen} onClose={() => setInviteOpen(false)}
        title={`Convidar para ${inviteTeam?.name ?? 'equipe'}`}
        maxWidth="max-w-md"
        footer={
          <button onClick={() => setInviteOpen(false)}
            className="w-full py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800">
            Fechar
          </button>
        }
      >
        <div className="space-y-4 pb-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Busque pelo <span className="font-semibold text-indigo-600 dark:text-indigo-400">@username</span> ou nome de um usuário cadastrado na plataforma.
          </p>
          {/* Search field */}
          <div className="relative">
            <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={inviteQuery}
              onChange={e => handleInviteSearch(e.target.value)}
              placeholder="@username ou nome..."
              className={`${inputCls} pl-10 pr-10`}
              autoFocus
            />
            {searching && (
              <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-indigo-400" />
            )}
            {!searching && inviteQuery.trim().length >= 2 && (
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
            )}
          </div>

          {/* Results */}
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {inviteQuery.trim().length >= 2 && !searching && searchResults.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">Nenhum usuário encontrado.</p>
            )}
            {searchResults.map(u => {
              const alreadyMember = u.already_member || inviteTeam?.members.some(m => m.id === (u.contact_id ?? u.id)) || false;
              return (
                <div key={u.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <Avatar name={u.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{u.name}</p>
                    <p className="text-xs text-gray-400 truncate">
                      {u.username ? `@${u.username}` : u.email}
                      {' · '}
                      <span className={u.kind === 'contact' ? 'text-emerald-500' : u.role === 'admin' ? 'text-indigo-500' : 'text-gray-400'}>
                        {u.kind === 'contact' ? 'Contato' : u.role === 'admin' ? 'Admin' : 'Profissional'}
                      </span>
                    </p>
                  </div>
                  {alreadyMember ? (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium px-2 py-1 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
                      Já é membro
                    </span>
                  ) : (
                    <button
                      onClick={() => handleInviteUser(u)}
                      disabled={inviting}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 disabled:opacity-60 transition-colors">
                      {inviting ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserPlus className="w-3 h-3" />}
                      Adicionar
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Excluir equipe?"
        message="Todos os membros serão desvinculados. Esta ação não pode ser desfeita."
        confirmLabel={deleting ? 'Excluindo...' : 'Excluir'}
        danger
      />
    </div>
  );
}
