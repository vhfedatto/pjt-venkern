import { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { ArrowLeft, Phone, Mail, Building2, CalendarClock, FileText, MessageCircle, Plus, Clock, ClipboardList, Download, Send, Loader2, Trash2 } from '../components/ui/Icons';
import { useApp } from '../context/AppContext';
import { useContactDetails } from '../hooks/useContactDetails';
import { useTeams } from '../hooks/useTeams';
import { useTasks } from '../hooks/useTasks';
import { Avatar } from '../components/ui/Avatar';
import { StatusBadge, RoleBadge } from '../components/ui/Badge';
import { documentsApi } from '../services/api';
const interactionLabels = {
  call: 'Ligação',
  whatsapp: 'WhatsApp',
  email: 'E-mail',
  meeting: 'Reunião',
  note: 'Nota'
};
const originLabels = {
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  email: 'E-mail',
  indicacao: 'Indicação',
  evento: 'Evento',
  manual: 'Manual'
};
export default function ContactDetails() {
  const {
    id
  } = useParams();
  const navigate = useNavigate();
  const {
    currentUser
  } = useApp();
  const {
    teams
  } = useTeams();
  const {
    tasks
  } = useTasks();
  const {
    contact,
    contacts,
    interactions,
    documents,
    loading,
    error,
    addInteraction,
    uploadDocument,
    removeDocument
  } = useContactDetails(id);
  const [interactionType, setInteractionType] = useState('note');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingDocId, setDeletingDocId] = useState(null);
  const fileInputRef = useRef(null);
  const team = teams.find(t => t.id === contact?.teamId);
  const responsible = contacts.find(c => c.id === contact?.responsibleId);
  const contactTasks = tasks.filter(t => t.assigneeId === id);
  if (loading) {
    return <div className="p-6 flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>;
  }
  if (error || !contact) {
    return <div className="p-6">
        <button onClick={() => navigate('/contatos')} className="mb-4 inline-flex items-center gap-2 text-sm text-indigo-500 hover:text-indigo-600">
          <ArrowLeft className="w-4 h-4" /> Voltar para contatos
        </button>
        <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-12 text-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Contato não encontrado</h2>
          <p className="text-sm text-gray-400 mt-2">{error ?? 'Esse registro não existe ou foi removido.'}</p>
        </div>
      </div>;
  }
  const handleAddInteraction = async () => {
    if (!description.trim()) {
      toast.error('Escreva uma descrição para registrar no histórico.');
      return;
    }
    setSubmitting(true);
    try {
      await addInteraction(interactionType, description, currentUser.contactId);
      setDescription('');
      toast.success('Histórico atualizado.');
    } catch (e) {
      toast.error(e?.message ?? 'Erro ao registrar interação');
    } finally {
      setSubmitting(false);
    }
  };
  const handleAddDocument = async () => {
    fileInputRef.current?.click();
  };
  const handleFileSelected = async e => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset input so same file can be reselected
    e.target.value = '';
    setUploading(true);
    try {
      await uploadDocument(file);
      toast.success('Documento anexado com sucesso.');
    } catch (err) {
      toast.error(err?.message ?? 'Erro ao fazer upload do documento');
    } finally {
      setUploading(false);
    }
  };
  const handleDownload = async (docId, filename) => {
    try {
      await documentsApi.download(docId, filename);
    } catch (err) {
      toast.error(err?.message ?? 'Erro ao baixar documento');
    }
  };
  const handleDeleteDocument = async docId => {
    if (!window.confirm('Remover este documento? Essa ação não pode ser desfeita.')) return;
    setDeletingDocId(docId);
    try {
      await removeDocument(docId);
      toast.success('Documento removido.');
    } catch (err) {
      toast.error(err?.message ?? 'Erro ao remover documento');
    } finally {
      setDeletingDocId(null);
    }
  };
  return <div className="p-4 lg:p-6 space-y-5">
      <button onClick={() => navigate('/contatos')} className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
        <ArrowLeft className="w-4 h-4" /> Voltar para contatos
      </button>

      <motion.div initial={{
      opacity: 0,
      y: 12
    }} animate={{
      opacity: 1,
      y: 0
    }} className="rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
        <div className="h-2" style={{
        background: team?.color ?? '#6366f1'
      }} />
        <div className="p-5 lg:p-6 flex flex-col lg:flex-row gap-5 lg:items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar name={contact.name} size="lg" status={contact.status} />
            <div>
              <div className="flex flex-wrap gap-2 items-center mb-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{contact.name}</h2>
                <StatusBadge status={contact.status} />
                <RoleBadge role={contact.role} />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{contact.position || 'Sem cargo definido'} · {team?.name ?? 'Sem equipe'}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <a href={`tel:${contact.phone}`} className="rounded-2xl bg-gray-50 dark:bg-gray-800 p-3 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors">
              <Phone className="w-4 h-4 text-indigo-500 mb-1" />{contact.phone}
            </a>
            <a href={`mailto:${contact.email}`} className="rounded-2xl bg-gray-50 dark:bg-gray-800 p-3 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors truncate">
              <Mail className="w-4 h-4 text-indigo-500 mb-1" />{contact.email}
            </a>
            <div className="rounded-2xl bg-gray-50 dark:bg-gray-800 p-3">
              <Building2 className="w-4 h-4 text-indigo-500 mb-1" />{originLabels[contact.origin ?? 'manual'] ?? 'Manual'}
            </div>
            <button onClick={() => navigate('/chat')} className="rounded-2xl bg-indigo-600 text-white p-3 hover:bg-indigo-700 transition-colors text-left">
              <MessageCircle className="w-4 h-4 mb-1" />Abrir chat
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.35fr_.65fr] gap-5">
        <div className="space-y-5">
          <section className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">Histórico de interações</h3>
                <p className="text-xs text-gray-400">Timeline operacional do contato.</p>
              </div>
              <Clock className="w-5 h-5 text-indigo-400" />
            </div>

            <div className="rounded-2xl bg-gray-50 dark:bg-gray-800/60 p-3 mb-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr_auto] gap-2">
                <select value={interactionType} onChange={e => setInteractionType(e.target.value)} className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-200 outline-none">
                  {Object.entries(interactionLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
                <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Ex: cliente pediu retorno amanhã às 10h" className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-200 outline-none" />
                <button onClick={handleAddInteraction} disabled={submitting} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-60">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Registrar
                </button>
              </div>
            </div>

            {interactions.length === 0 ? <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 p-8 text-center text-sm text-gray-400">
                Nenhuma interação registrada ainda.
              </div> : <div className="space-y-3">
                {interactions.map(item => {
              const creator = contacts.find(c => c.id === item.createdBy);
              return <div key={item.id} className="relative pl-6 pb-4 border-l border-indigo-100 dark:border-indigo-900 last:pb-0">
                      <span className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-indigo-600 ring-4 ring-indigo-50 dark:ring-indigo-900/30" />
                      <div className="rounded-2xl bg-gray-50 dark:bg-gray-800/60 p-4">
                        <div className="flex flex-wrap gap-2 items-center justify-between mb-1">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">{interactionLabels[item.type]}</span>
                          <span className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleString('pt-BR')}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{item.description}</p>
                        <p className="text-xs text-gray-400 mt-2">Registrado por {creator?.name ?? 'Usuário'}</p>
                      </div>
                    </div>;
            })}
              </div>}
          </section>

          <section className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">Tarefas vinculadas</h3>
                <p className="text-xs text-gray-400">Atividades em que esse contato é responsável.</p>
              </div>
              <ClipboardList className="w-5 h-5 text-indigo-400" />
            </div>
            {contactTasks.length === 0 ? <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 p-8 text-center text-sm text-gray-400">Nenhuma tarefa vinculada.</div> : <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {contactTasks.map(task => <div key={task.id} className="rounded-2xl bg-gray-50 dark:bg-gray-800/60 p-4">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-white">{task.title}</h4>
                      <span className="text-[10px] uppercase tracking-wide px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">{task.priority}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{task.description}</p>
                    <p className="text-xs text-gray-400 mt-3">Prazo: {task.dueDate}</p>
                  </div>)}
              </div>}
          </section>
        </div>

        <aside className="space-y-5">
          <section className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Próxima ação</h3>
            <div className="rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 p-4">
              <CalendarClock className="w-5 h-5 text-indigo-500 mb-2" />
              <p className="font-semibold text-gray-900 dark:text-white">{contact.nextAction ?? 'Definir próxima ação'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Prazo: {contact.nextActionDate ?? 'Sem prazo'}</p>
              <p className="text-xs text-gray-400 mt-2">Responsável: {responsible?.name ?? 'Não definido'}</p>
            </div>
          </section>

          <section className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 dark:text-white">Documentos</h3>
              <button onClick={handleAddDocument} disabled={uploading} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 disabled:opacity-60">
                {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                {uploading ? 'Enviando…' : 'Anexar'}
              </button>
            </div>
            <input ref={fileInputRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx,.txt" className="hidden" onChange={handleFileSelected} />
            {documents.length === 0 ? <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 p-6 text-center text-sm text-gray-400">Nenhum documento anexado.</div> : <div className="space-y-2">
                {documents.map(doc => <div key={doc.id} className="flex items-center gap-3 rounded-2xl bg-gray-50 dark:bg-gray-800/60 p-3">
                    <FileText className="w-5 h-5 text-indigo-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{doc.originalFilename || doc.name}</p>
                      <p className="text-xs text-gray-400">
                        {doc.size > 0 ? `${(doc.size / 1024).toFixed(1)} KB` : '—'} · {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString('pt-BR') : '—'}
                      </p>
                    </div>
                    {doc.hasFile && <button onClick={() => handleDownload(doc.id, doc.originalFilename || doc.name)} className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="Baixar">
                        <Download className="w-4 h-4 text-gray-500" />
                      </button>}
                    <button onClick={() => handleDeleteDocument(doc.id)} disabled={deletingDocId === doc.id} className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50" title="Remover">
                      {deletingDocId === doc.id ? <Loader2 className="w-4 h-4 animate-spin text-red-400" /> : <Trash2 className="w-4 h-4 text-red-400" />}
                    </button>
                  </div>)}
              </div>}
          </section>

          <section className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Resumo</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">Equipe</span><span className="font-medium text-gray-700 dark:text-gray-200">{team?.name ?? 'Sem equipe'}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Origem</span><span className="font-medium text-gray-700 dark:text-gray-200">{originLabels[contact.origin ?? 'manual'] ?? 'Manual'}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Criado em</span><span className="font-medium text-gray-700 dark:text-gray-200">{contact.createdAt}</span></div>
            </div>
            {contact.notes && <p className="mt-4 p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/60 text-sm text-gray-500 dark:text-gray-300">{contact.notes}</p>}
          </section>
        </aside>
      </div>
    </div>;
}