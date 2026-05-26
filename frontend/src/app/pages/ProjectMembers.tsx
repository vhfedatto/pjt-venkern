import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Users, UserPlus, Link2, Copy, Trash2, ShieldCheck,
  Search, X, ChevronDown, RefreshCw,
} from '../components/ui/Icons';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { projectsApi, usersApi } from '../services/api';
import { Avatar } from '../components/ui/Avatar';

interface Member {
  id: number;
  user_id: number;
  role: string;
  status: string;
  joined_at: string | null;
  user?: { name: string; email: string; username: string | null };
}

interface ProjectInvite {
  id: number;
  token: string;
  invite_url: string;
  role: string;
  expires_at: string | null;
  max_uses: number | null;
  used_count: number;
  is_active: boolean;
  created_at: string;
}

interface UserResult {
  id: number;
  name: string;
  username: string | null;
  email: string;
}

function RoleBadge({ role }: { role: string }) {
  const isAdmin = role === 'ADMIN';
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
        isAdmin
          ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
          : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
      }`}
    >
      {isAdmin && <ShieldCheck className="w-3 h-3" />}
      {role}
    </span>
  );
}

export default function ProjectMembers() {
  const { currentProject } = useProject();
  const { user: currentUser } = useAuth();
  const projectId = currentProject?.id;
  const isAdmin = currentProject?.role === 'ADMIN' || currentUser?.is_super_admin;

  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<ProjectInvite[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [loadingInvites, setLoadingInvites] = useState(false);

  // Invite by username
  const [usernameQuery, setUsernameQuery] = useState('');
  const [userResults, setUserResults] = useState<UserResult[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserResult | null>(null);
  const [inviteRole, setInviteRole] = useState('PROFESSIONAL');
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [sendingInvite, setSendingInvite] = useState(false);

  // Link invite creation
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [linkRole, setLinkRole] = useState('PROFESSIONAL');
  const [linkExpires, setLinkExpires] = useState('7');
  const [linkMaxUses, setLinkMaxUses] = useState('1');
  const [creatingLink, setCreatingLink] = useState(false);

  const loadMembers = useCallback(async () => {
    if (!projectId) return;
    setLoadingMembers(true);
    try {
      const res = await projectsApi.members(projectId);
      setMembers(res.data ?? []);
    } catch {
      toast.error('Erro ao carregar membros');
    } finally {
      setLoadingMembers(false);
    }
  }, [projectId]);

  const loadInvites = useCallback(async () => {
    if (!projectId || !isAdmin) return;
    setLoadingInvites(true);
    try {
      const res = await projectsApi.listInvites(projectId);
      setInvites(res.data ?? []);
    } catch {
      // non-critical
    } finally {
      setLoadingInvites(false);
    }
  }, [projectId, isAdmin]);

  useEffect(() => {
    loadMembers();
    loadInvites();
  }, [loadMembers, loadInvites]);

  // Debounced user search
  useEffect(() => {
    if (!usernameQuery || usernameQuery.length < 2) {
      setUserResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearchingUsers(true);
      try {
        const res = await usersApi.search(usernameQuery);
        setUserResults(res ?? []);
      } catch {
        setUserResults([]);
      } finally {
        setSearchingUsers(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [usernameQuery]);

  async function handleInviteByUsername() {
    if (!projectId || !selectedUser) return;
    setSendingInvite(true);
    try {
      await projectsApi.inviteMemberByUsername(projectId, {
        username: selectedUser.username ?? selectedUser.name,
        role: inviteRole,
      });
      toast.success(`Convite enviado para ${selectedUser.name}`);
      setSelectedUser(null);
      setUsernameQuery('');
      setUserResults([]);
    } catch (e: any) {
      toast.error(e.message ?? 'Erro ao enviar convite');
    } finally {
      setSendingInvite(false);
    }
  }

  async function handleCreateLink() {
    if (!projectId) return;
    setCreatingLink(true);
    try {
      const invite = await projectsApi.createInvite(projectId, {
        role: linkRole,
        expiresInDays: linkExpires ? parseInt(linkExpires) : undefined,
        maxUses: linkMaxUses ? parseInt(linkMaxUses) : undefined,
      });
      setInvites((prev) => [invite, ...prev]);
      setShowLinkForm(false);
      toast.success('Link de convite criado!');
    } catch (e: any) {
      toast.error(e.message ?? 'Erro ao criar link');
    } finally {
      setCreatingLink(false);
    }
  }

  async function handleRevokeInvite(inviteId: number) {
    if (!projectId) return;
    try {
      await projectsApi.revokeInvite(projectId, inviteId);
      setInvites((prev) => prev.filter((i) => i.id !== inviteId));
      toast.success('Convite revogado');
    } catch (e: any) {
      toast.error(e.message ?? 'Erro ao revogar convite');
    }
  }

  async function handleChangeRole(memberId: number, newRole: string) {
    if (!projectId) return;
    try {
      await projectsApi.changeMemberRole(projectId, memberId, newRole);
      setMembers((prev) => prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m)));
      toast.success('Papel atualizado');
    } catch (e: any) {
      toast.error(e.message ?? 'Erro ao atualizar papel');
    }
  }

  async function handleRemoveMember(memberId: number) {
    if (!projectId) return;
    if (!confirm('Remover este membro do projeto?')) return;
    try {
      await projectsApi.removeMember(projectId, memberId);
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
      toast.success('Membro removido');
    } catch (e: any) {
      toast.error(e.message ?? 'Erro ao remover membro');
    }
  }

  function copyLink(url: string) {
    navigator.clipboard.writeText(url).then(() => toast.success('Link copiado!'));
  }

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        Selecione um projeto para gerenciar membros.
      </div>
    );
  }

  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-500" />
            Membros — {currentProject.name}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{members.length} membro(s) ativo(s)</p>
        </div>
        <button
          onClick={() => { loadMembers(); loadInvites(); }}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors"
          title="Atualizar"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Admin actions */}
      {isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Invite by username */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 space-y-3">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-indigo-500" />
              Convidar por @username
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={usernameQuery}
                onChange={(e) => { setUsernameQuery(e.target.value); setSelectedUser(null); }}
                placeholder="Buscar por @username ou nome..."
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {searchingUsers && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
              )}
            </div>

            {/* Search results */}
            {userResults.length > 0 && !selectedUser && (
              <div className="border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden divide-y divide-gray-100 dark:divide-gray-800">
                {userResults.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => { setSelectedUser(u); setUsernameQuery(u.username ?? u.name); setUserResults([]); }}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-left transition-colors"
                  >
                    <Avatar name={u.name} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{u.name}</p>
                      <p className="text-xs text-gray-400">{u.username ? `@${u.username}` : u.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {selectedUser && (
              <div className="flex items-center gap-2 p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                <Avatar name={selectedUser.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">{selectedUser.name}</p>
                  <p className="text-xs text-indigo-400">{selectedUser.username ? `@${selectedUser.username}` : ''}</p>
                </div>
                <button onClick={() => { setSelectedUser(null); setUsernameQuery(''); }} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex gap-2">
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="flex-1 text-sm px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="PROFESSIONAL">Professional</option>
                <option value="ADMIN">Admin</option>
              </select>
              <button
                onClick={handleInviteByUsername}
                disabled={!selectedUser || sendingInvite}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-1.5"
              >
                {sendingInvite ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <UserPlus className="w-3.5 h-3.5" />
                )}
                Convidar
              </button>
            </div>
          </div>

          {/* Generate link invite */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Link2 className="w-4 h-4 text-indigo-500" />
                Links de convite
              </h2>
              <button
                onClick={() => setShowLinkForm((v) => !v)}
                className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
              >
                Novo link <ChevronDown className={`w-3 h-3 transition-transform ${showLinkForm ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {showLinkForm && (
              <div className="space-y-2 pt-1">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Papel</label>
                    <select
                      value={linkRole}
                      onChange={(e) => setLinkRole(e.target.value)}
                      className="w-full text-sm px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                    >
                      <option value="PROFESSIONAL">Professional</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Expira (dias)</label>
                    <input
                      type="number"
                      min="1"
                      value={linkExpires}
                      onChange={(e) => setLinkExpires(e.target.value)}
                      className="w-full text-sm px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Usos máx.</label>
                    <input
                      type="number"
                      min="1"
                      value={linkMaxUses}
                      onChange={(e) => setLinkMaxUses(e.target.value)}
                      className="w-full text-sm px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                    />
                  </div>
                </div>
                <button
                  onClick={handleCreateLink}
                  disabled={creatingLink}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors"
                >
                  {creatingLink ? 'Gerando...' : 'Gerar link'}
                </button>
              </div>
            )}

            {/* Active invites */}
            {loadingInvites ? (
              <p className="text-xs text-gray-400">Carregando convites...</p>
            ) : invites.length === 0 ? (
              <p className="text-xs text-gray-400">Nenhum link ativo.</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {invites.map((inv) => (
                  <div key={inv.id} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{inv.invite_url}</p>
                      <p className="text-[10px] text-gray-400">
                        {inv.role} · {inv.used_count}/{inv.max_uses ?? '∞'} usos
                        {inv.expires_at && ` · expira ${new Date(inv.expires_at).toLocaleDateString('pt-BR')}`}
                      </p>
                    </div>
                    <button
                      onClick={() => copyLink(inv.invite_url)}
                      className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-indigo-600 transition-colors"
                      title="Copiar link"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleRevokeInvite(inv.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors"
                      title="Revogar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Members list */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Membros ativos</h2>
        </div>
        {loadingMembers ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">Nenhum membro encontrado.</div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {members.map((member) => (
              <div key={member.id} className="flex items-center gap-3 px-4 py-3">
                <Avatar name={member.user?.name ?? `User ${member.user_id}`} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                    {member.user?.name ?? `Usuário #${member.user_id}`}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {member.user?.username ? `@${member.user.username}` : member.user?.email ?? ''}
                  </p>
                </div>
                <RoleBadge role={member.role} />
                {isAdmin && (
                  <div className="flex items-center gap-1">
                    <select
                      value={member.role}
                      onChange={(e) => handleChangeRole(member.id, e.target.value)}
                      className="text-xs px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                    >
                      <option value="PROFESSIONAL">Professional</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors"
                      title="Remover membro"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
