import { useState } from 'react';
import { Plus, Calendar, Clock, MapPin, Send, Pencil, Trash2, Users, CheckCircle2, Image, Loader2 } from '../components/ui/Icons';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useApp } from '../context/AppContext';
import { useEvents } from '../hooks/useEvents';
import { EventStatusBadge } from '../components/ui/Badge';
import { Modal, ConfirmModal } from '../components/ui/Modal';
import type { AppEvent, EventStatus } from '../types';

const emptyForm = {
  title: '', description: '', date: '', time: '', location: '',
  bannerUrl: '', targetAudience: ['all'] as string[], status: 'draft' as EventStatus,
};

export default function Events() {
  const { currentUser } = useApp();
  const { events, teams, loading, error, createEvent, updateEvent, deleteEvent, sendEvent } = useEvents();
  const [filter, setFilter] = useState<EventStatus | 'all'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editEvent, setEditEvent] = useState<AppEvent | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  const filtered = filter === 'all' ? events : events.filter(e => e.status === filter);

  const openCreate = () => { setEditEvent(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (ev: AppEvent) => {
    setEditEvent(ev);
    setForm({ title: ev.title, description: ev.description, date: ev.date, time: ev.time, location: ev.location, bannerUrl: ev.bannerUrl, targetAudience: ev.targetAudience, status: ev.status });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.date) { toast.error('Preencha título e data!'); return; }
    if (form.date < today) { toast.error('A data do evento não pode ser anterior à data atual.'); return; }
    setSaving(true);
    try {
      if (editEvent) { await updateEvent(editEvent.id, form); toast.success('Evento atualizado!'); }
      else { await createEvent(form); toast.success('Evento criado!'); }
      setModalOpen(false);
    } catch (e: any) {
      toast.error(e?.message ?? 'Erro ao salvar evento');
    } finally {
      setSaving(false);
    }
  };

  const handleSend = async (id: string) => {
    try {
      await sendEvent(id);
      toast.success('Evento enviado para os grupos!');
    } catch (e: any) {
      toast.error(e?.message ?? 'Erro ao enviar evento');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteEvent(id);
      toast.success('Evento removido.');
    } catch (e: any) {
      toast.error(e?.message ?? 'Erro ao remover evento');
    }
    setDeleteId(null);
  };

  const inputCls = 'w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-400 transition-all placeholder:text-gray-400';
  const labelCls = 'block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5';

  const toggleAudience = (id: string) => {
    setForm(p => {
      if (id === 'all') return { ...p, targetAudience: ['all'] };
      const without = p.targetAudience.filter(x => x !== 'all' && x !== id);
      const newArr = p.targetAudience.includes(id) ? without : [...without, id];
      return { ...p, targetAudience: newArr.length === 0 ? ['all'] : newArr };
    });
  };

  const getAudienceLabel = (ta: string[]) => {
    if (ta.includes('all')) return 'Todos';
    return ta.map(id => teams.find(t => t.id === id)?.name.split(' ')[0] ?? id).join(', ');
  };

  const FILTERS: { value: EventStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'Todos' },
    { value: 'draft', label: 'Rascunho' },
    { value: 'scheduled', label: 'Agendados' },
    { value: 'sent', label: 'Enviados' },
    { value: 'completed', label: 'Concluídos' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-center text-red-500 text-sm">{error}</div>;
  }

  return (
    <div className="p-4 lg:p-6">
      {/* Toolbar */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4 mb-5 flex flex-wrap gap-3 items-center">
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${filter === f.value ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
              {f.label}
            </button>
          ))}
        </div>
        <span className="text-xs text-gray-400">{filtered.length} evento{filtered.length !== 1 ? 's' : ''}</span>
        {currentUser.role === 'admin' && (
          <button onClick={openCreate}
            className="ml-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium shadow-md hover:opacity-90 hover:scale-[1.02] transition-all">
            <Plus className="w-4 h-4" /> Novo Evento
          </button>
        )}
      </motion.div>

      {/* Events grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filtered.map(ev => (
            <motion.div key={ev.id} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ y: -3 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all overflow-hidden group">
              {/* Banner */}
              <div className="relative h-36 overflow-hidden">
                {ev.bannerUrl ? (
                  <img src={ev.bannerUrl} alt={ev.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center">
                    <Image className="w-12 h-12 text-indigo-300" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <EventStatusBadge status={ev.status} />
                  {currentUser.role === 'admin' && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(ev)} className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setDeleteId(ev.id)} className="p-1.5 rounded-lg bg-red-500/80 hover:bg-red-600/90 text-white backdrop-blur-sm transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1 line-clamp-1">{ev.title}</h3>
                <p className="text-xs text-gray-400 line-clamp-2 mb-3">{ev.description}</p>

                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                    {new Date(ev.date + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'long' })}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Clock className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                    {ev.time}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                    <span className="truncate">{ev.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Users className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                    {getAudienceLabel(ev.targetAudience)}
                  </div>
                </div>

                {currentUser.role === 'admin' && ev.status !== 'sent' && ev.status !== 'completed' && (
                  <button onClick={() => handleSend(ev.id)}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-medium hover:opacity-90 transition-opacity shadow-sm">
                    <Send className="w-3.5 h-3.5" /> Enviar para Grupos
                  </button>
                )}
                {(ev.status === 'sent' || ev.status === 'completed') && (
                  <div className="flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {ev.status === 'sent' ? 'Enviado' : 'Concluído'}
                    {ev.sentAt && <span className="text-gray-400">· {new Date(ev.sentAt).toLocaleDateString('pt-BR')}</span>}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Event Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}
        title={editEvent ? 'Editar Evento' : 'Novo Evento'}
        maxWidth="max-w-xl"
        footer={
          <div className="flex gap-3">
            <button onClick={() => setModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800">Cancelar</button>
            <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium hover:opacity-90 shadow-md disabled:opacity-60 flex items-center justify-center gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {editEvent ? 'Salvar' : 'Criar Evento'}
            </button>
          </div>
        }
      >
        <div className="space-y-4 pb-2">
          <div>
            <label className={labelCls}>Título *</label>
            <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Ex: Kickoff Q2" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Descrição</label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} className={`${inputCls} resize-none`} placeholder="Descrição do evento..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Data *</label>
              <input type="date" min={today} value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Horário</label>
              <input type="time" value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Local</label>
            <input type="text" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} placeholder="Ex: Auditório Principal" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>URL do Banner</label>
            <input type="url" value={form.bannerUrl} onChange={e => setForm(p => ({ ...p, bannerUrl: e.target.value }))} placeholder="https://..." className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Público-alvo</label>
            <div className="flex flex-wrap gap-2">
              {[{ id: 'all', name: 'Todos' }, ...teams].map(t => (
                <button key={t.id} type="button" onClick={() => toggleAudience(t.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${form.targetAudience.includes(t.id) ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                  {t.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={labelCls}>Status</label>
            <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as EventStatus }))} className={inputCls}>
              <option value="draft">Rascunho</option>
              <option value="scheduled">Agendado</option>
              <option value="sent">Enviado</option>
              <option value="completed">Concluído</option>
            </select>
          </div>
        </div>
      </Modal>

      <ConfirmModal isOpen={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        title="Excluir evento?" message="Esta ação não pode ser desfeita." confirmLabel="Excluir" danger />
    </div>
  );
}
