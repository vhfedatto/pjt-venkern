import { useState, useEffect, useCallback, useRef } from 'react';
import type { Socket } from 'socket.io-client';
import { chatsApi, contactsApi } from '../services/api';
import { useProject } from '../context/ProjectContext';
import { mapApiChatToUi, mapApiContactToUi, mapApiMessageToUi } from '../services/mappers';
import type { ChatConversation, Contact, Message } from '../types';

export function useChats(socket?: Socket | null) {
  const { currentProject } = useProject();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const activeConvIdRef = useRef<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!currentProject) {
      setConversations([]);
      setContacts([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    try {
      const [chatsRes, contactsRes] = await Promise.all([
        chatsApi.list(String(currentProject.id)),
        contactsApi.list({ per_page: 200, project_id: currentProject.id }),
      ]);
      setConversations(Array.isArray(chatsRes) ? chatsRes.map(mapApiChatToUi) : []);
      setContacts((contactsRes.data ?? []).map(mapApiContactToUi));
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? 'Erro ao carregar conversas');
    } finally {
      setLoading(false);
    }
  }, [currentProject]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Real-time: listen for incoming private messages
  useEffect(() => {
    if (!socket) return;

    const onNewMessage = (payload: any) => {
      const msg: Message = {
        id: String(payload.id),
        senderId: String(payload.senderId),
        content: payload.content,
        type: payload.messageType ?? 'text',
        timestamp: payload.createdAt,
        blocked: payload.blocked ?? false,
      };
      const convId = String(payload.conversationId);

      // Only append to messages list if this is the currently open conversation
      if (convId === activeConvIdRef.current) {
        setMessages(prev => {
          if (prev.some(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      } else {
        // Increment unread badge for other conversations
        setUnreadCounts(prev => ({
          ...prev,
          [convId]: (prev[convId] ?? 0) + 1,
        }));
      }

      setConversations(prev =>
        prev.map(c =>
          c.id === convId
            ? { ...c, lastActivity: payload.createdAt }
            : c,
        ),
      );
    };

    socket.on('private_message:new', onNewMessage);
    return () => { socket.off('private_message:new', onNewMessage); };
  }, [socket]);

  const loadMessages = useCallback(async (chatId: string) => {
    // Leave previous room, join new one
    if (socket) {
      if (activeConvIdRef.current && activeConvIdRef.current !== chatId) {
        socket.emit('leave_conversation', { conversationId: Number(activeConvIdRef.current) });
      }
      socket.emit('join_conversation', { conversationId: Number(chatId) });
    }
    activeConvIdRef.current = chatId;
    // Clear unread badge for this conversation
    setUnreadCounts(prev => ({ ...prev, [chatId]: 0 }));

    setMessagesLoading(true);
    setMessages([]);
    try {
      const msgs = await chatsApi.messages(chatId);
      setMessages(Array.isArray(msgs) ? msgs.map(mapApiMessageToUi) : []);
    } catch {
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  }, [socket]);

  const sendMessage = async (chatId: string, senderId: string, content: string, type = 'text') => {
    if (socket?.connected) {
      socket.emit('send_private_message', {
        conversationId: Number(chatId),
        content,
        messageType: type,
      });
      // Optimistic return — real message arrives via socket event
      return undefined;
    }
    // Fallback to REST
    const res = await chatsApi.sendMessage(chatId, {
      sender_id: Number(senderId),
      content,
      type,
    });
    const newMsg = mapApiMessageToUi(res);
    setMessages(p => [...p, newMsg]);
    setConversations(p => p.map(c =>
      c.id === chatId ? { ...c, lastActivity: new Date().toISOString() } : c
    ));
    return newMsg;
  };

  const createConversation = async (participantA: string, participantB: string) => {
    const res = await chatsApi.create({
      participant_a: Number(participantA),
      participant_b: Number(participantB),
      project_id: currentProject?.id,
    });
    const conv = mapApiChatToUi(res);
    setConversations(p => {
      if (p.some(c => c.id === conv.id)) return p.map(c => c.id === conv.id ? conv : c);
      return [conv, ...p];
    });
    return conv;
  };

  return {
    conversations,
    contacts,
    messages,
    messagesLoading,
    loading,
    error,
    unreadCounts,
    refetch: fetchData,
    loadMessages,
    sendMessage,
    createConversation,
  };
}
