import { useState, useEffect, useCallback, useRef } from 'react';
import type { Socket } from 'socket.io-client';
import { groupsApi, contactsApi } from '../services/api';
import { useProject } from '../context/ProjectContext';
import { mapApiGroupToUi, mapApiContactToUi, mapApiMessageToUi } from '../services/mappers';
import type { Group, Contact, Message } from '../types';

export function useGroups(socket?: Socket | null) {
  const { currentProject } = useProject();
  const [groups, setGroups] = useState<Group[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const activeGroupIdRef = useRef<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!currentProject) {
      setGroups([]);
      setContacts([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    try {
      const [groupsRes, contactsRes] = await Promise.all([
        groupsApi.list({ project_id: currentProject.id }),
        contactsApi.list({ per_page: 200, project_id: currentProject.id }),
      ]);
      const groupsData = (groupsRes as any).data ?? (Array.isArray(groupsRes) ? groupsRes : []);
      setGroups(groupsData.map(mapApiGroupToUi));
      setContacts((contactsRes.data ?? []).map(mapApiContactToUi));
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? 'Erro ao carregar grupos');
    } finally {
      setLoading(false);
    }
  }, [currentProject]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Real-time: listen for incoming group messages
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
      setMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      setGroups(prev =>
        prev.map(g =>
          g.id === String(payload.groupId)
            ? { ...g, lastActivity: payload.createdAt }
            : g,
        ),
      );
    };

    socket.on('group_message:new', onNewMessage);
    return () => { socket.off('group_message:new', onNewMessage); };
  }, [socket]);

  const loadMessages = useCallback(async (groupId: string) => {
    if (socket) {
      if (activeGroupIdRef.current && activeGroupIdRef.current !== groupId) {
        socket.emit('leave_group', { groupId: Number(activeGroupIdRef.current) });
      }
      socket.emit('join_group', { groupId: Number(groupId) });
    }
    activeGroupIdRef.current = groupId;

    setMessagesLoading(true);
    setMessages([]);
    try {
      const msgs = await groupsApi.messages(groupId);
      setMessages(Array.isArray(msgs) ? msgs.map(mapApiMessageToUi) : []);
    } catch {
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  }, [socket]);

  const sendMessage = async (groupId: string, senderId: string, content: string, type = 'text') => {
    if (socket?.connected) {
      socket.emit('send_group_message', {
        groupId: Number(groupId),
        content,
        messageType: type,
      });
      return undefined;
    }
    // Fallback to REST
    const res = await groupsApi.sendMessage(groupId, {
      sender_id: Number(senderId),
      content,
      type,
    });
    const newMsg = mapApiMessageToUi(res);
    setMessages(p => [...p, newMsg]);
    setGroups(p => p.map(g =>
      g.id === groupId ? { ...g, lastActivity: new Date().toISOString() } : g
    ));
    return newMsg;
  };

  return {
    groups,
    contacts,
    messages,
    messagesLoading,
    loading,
    error,
    refetch: fetchData,
    loadMessages,
    sendMessage,
  };
}
