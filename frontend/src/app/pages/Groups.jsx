import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Image, Users, Hash, ShieldAlert, X, Loader2 } from '../components/ui/Icons';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useApp } from '../context/AppContext';
import { useGroups } from '../hooks/useGroups';
import { useSocket } from '../hooks/useSocket';
import { Avatar } from '../components/ui/Avatar';
export default function Groups() {
  const {
    currentUser
  } = useApp();
  const {
    socket
  } = useSocket();
  const {
    groups,
    contacts,
    messages,
    messagesLoading,
    loading,
    error,
    loadMessages,
    sendMessage
  } = useGroups(socket);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [message, setMessage] = useState('');
  const [showMembers, setShowMembers] = useState(false);
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);
  const myContact = contacts.find(c => c.email === currentUser.email);
  const myContactId = myContact?.id ?? '';
  const accessibleGroups = currentUser.role === 'admin' ? groups : groups.filter(g => g.type === 'general' || g.memberIds.includes(myContactId));
  const selectedGroup = groups.find(g => g.id === selectedGroupId);

  // Auto-select first group once loaded
  useEffect(() => {
    if (!selectedGroupId && accessibleGroups.length > 0) {
      setSelectedGroupId(accessibleGroups[0].id);
    }
  }, [accessibleGroups, selectedGroupId]);

  // Load messages when group changes
  useEffect(() => {
    if (selectedGroupId) loadMessages(selectedGroupId);
  }, [selectedGroupId, loadMessages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [messages.length]);

  // Typing indicator via socket
  useEffect(() => {
    if (!socket) return;
    const onTyping = data => {
      setTypingUsers(prev => data.isTyping ? prev.includes(data.name) ? prev : [...prev, data.name] : prev.filter(n => n !== data.name));
    };
    socket.on('group:typing', onTyping);
    return () => {
      socket.off('group:typing', onTyping);
    };
  }, [socket, selectedGroupId]);
  const emitTyping = useCallback(isTyping => {
    if (!socket || !selectedGroupId) return;
    socket.emit('typing_group', {
      groupId: Number(selectedGroupId),
      isTyping
    });
  }, [socket, selectedGroupId]);
  const handleSend = async () => {
    if (!message.trim() || !selectedGroupId || !myContactId) return;
    setSending(true);
    emitTyping(false);
    try {
      await sendMessage(selectedGroupId, myContactId, message.trim(), 'text');
      setMessage('');
    } catch (e) {
      toast.error(e?.message ?? 'Erro ao enviar mensagem');
    } finally {
      setSending(false);
    }
  };
  const handleImageSend = async () => {
    if (!selectedGroupId || !myContactId) return;
    try {
      await sendMessage(selectedGroupId, myContactId, '📷 [Imagem anexada]', 'image');
      toast.success('📷 Imagem enviada com sucesso!');
    } catch (e) {
      toast.error(e?.message ?? 'Erro ao enviar imagem');
    }
  };
  const formatTime = ts => new Date(ts).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });
  const formatDate = ts => new Date(ts).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short'
  });
  const getTeamColor = _g => '#6366f1';
  if (loading) {
    return <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>;
  }
  if (error) {
    return <div className="p-6 text-center text-red-500 text-sm">{error}</div>;
  }
  return <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Groups sidebar */}
      <div className="w-72 flex-shrink-0 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">Grupos</h2>
          <p className="text-xs text-gray-400 mt-0.5">{accessibleGroups.length} grupos disponíveis</p>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {accessibleGroups.map(g => {
          const isSelected = g.id === selectedGroupId;
          return <button key={g.id} onClick={() => setSelectedGroupId(g.id)} className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all mb-1 ${isSelected ? 'bg-indigo-50 dark:bg-indigo-900/30' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm" style={{
              background: `linear-gradient(135deg, ${getTeamColor(g)}, ${getTeamColor(g)}aa)`
            }}>
                  {g.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${isSelected ? 'text-indigo-700 dark:text-indigo-400' : 'text-gray-900 dark:text-white'}`}>{g.name}</p>
                  <p className="text-xs text-gray-400 truncate">
                    {g.type === 'general' ? <Hash className="inline w-3 h-3" /> : null} {g.memberIds.length} membros
                  </p>
                </div>
              </button>;
        })}
        </div>
      </div>

      {/* Chat area */}
      {selectedGroup ? <div className="flex-1 flex flex-col min-w-0">
          {/* Chat header */}
          <div className="flex items-center gap-3 px-5 py-3.5 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm" style={{
          background: `linear-gradient(135deg, ${getTeamColor(selectedGroup)}, ${getTeamColor(selectedGroup)}aa)`
        }}>
              {selectedGroup.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedGroup.name}</p>
              <p className="text-xs text-gray-400">{selectedGroup.memberIds.length} membros</p>
            </div>
            <button onClick={() => setShowMembers(!showMembers)} className={`p-2 rounded-xl transition-colors ${showMembers ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400'}`}>
              <Users className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-950">
              {messagesLoading ? <div className="flex items-center justify-center h-32">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                </div> : messages.length === 0 ? <div className="flex items-center justify-center h-32">
                  <p className="text-xs text-gray-400">Nenhuma mensagem ainda</p>
                </div> : messages.map((msg, i) => {
            const sender = contacts.find(c => c.id === msg.senderId);
            const isMine = msg.senderId === myContactId;
            const showDate = i === 0 || formatDate(messages[i - 1].timestamp) !== formatDate(msg.timestamp);
            return <div key={msg.id}>
                      {showDate && <div className="flex justify-center my-2">
                          <span className="text-xs text-gray-400 bg-white dark:bg-gray-800 px-3 py-1 rounded-full border border-gray-100 dark:border-gray-700">
                            {formatDate(msg.timestamp)}
                          </span>
                        </div>}
                      <motion.div initial={{
                opacity: 0,
                y: 8
              }} animate={{
                opacity: 1,
                y: 0
              }} className={`flex items-end gap-2 ${isMine ? 'flex-row-reverse' : ''}`}>
                        {!isMine && <Avatar name={sender?.name ?? '?'} size="xs" className="flex-shrink-0 mb-1" />}
                        <div className={`max-w-xs lg:max-w-md ${isMine ? 'items-end' : 'items-start'} flex flex-col`}>
                          {!isMine && <span className="text-xs text-gray-400 mb-1 ml-1">{sender?.name.split(' ')[0] ?? '?'}</span>}
                          {msg.blocked ? <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/40">
                              <ShieldAlert className="w-4 h-4 text-red-500 flex-shrink-0" />
                              <span className="text-sm text-red-600 dark:text-red-400">{msg.content}</span>
                            </div> : <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm ${isMine ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-sm' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-sm border border-gray-100 dark:border-gray-700'}`}>
                              {msg.content}
                            </div>}
                          <span className="text-[10px] text-gray-400 mt-1 mx-1">{formatTime(msg.timestamp)}</span>
                        </div>
                      </motion.div>
                    </div>;
          })}
              <div ref={messagesEndRef} />
            </div>

            {/* Members panel */}
            <AnimatePresence>
              {showMembers && <motion.div initial={{
            width: 0,
            opacity: 0
          }} animate={{
            width: 240,
            opacity: 1
          }} exit={{
            width: 0,
            opacity: 0
          }} className="bg-white dark:bg-gray-900 border-l border-gray-100 dark:border-gray-800 overflow-hidden flex-shrink-0">
                  <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">Membros</span>
                    <button onClick={() => setShowMembers(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="p-3 overflow-y-auto space-y-1">
                    {selectedGroup.memberIds.map(id => {
                const c = contacts.find(x => x.id === id);
                if (!c) return null;
                return <div key={id} className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800">
                          <Avatar name={c.name} size="sm" status={c.status} />
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{c.name}</p>
                            <p className="text-[10px] text-gray-400 truncate">{c.position}</p>
                          </div>
                        </div>;
              })}
                  </div>
                </motion.div>}
            </AnimatePresence>
          </div>

          {/* Input */}
          <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
            {typingUsers.length > 0 && <p className="text-xs text-gray-400 mb-1 px-1">
                {typingUsers.join(', ')} {typingUsers.length === 1 ? 'está' : 'estão'} digitando...
              </p>}
            <div className="flex items-center gap-3">
              <button onClick={handleImageSend} title="Enviar imagem" className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-indigo-500 transition-colors flex-shrink-0">
                <Image className="w-5 h-5" />
              </button>
              <input type="text" value={message} onChange={e => {
            setMessage(e.target.value);
            emitTyping(true);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => emitTyping(false), 2000);
          }} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()} placeholder="Escreva uma mensagem..." className="flex-1 px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-400 transition-all placeholder:text-gray-400" />
              <button onClick={handleSend} disabled={!message.trim() || sending} className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm flex-shrink-0">
                {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div> : <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400">Selecione um grupo</p>
        </div>}
    </div>;
}