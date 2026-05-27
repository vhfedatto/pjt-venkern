import { useState, useEffect, useCallback, useRef } from "react";
import { chatsApi, contactsApi } from "../services/api";
import { useProject } from "../context/ProjectContext";
import { mapApiChatToUi, mapApiContactToUi, mapApiMessageToUi } from "../services/mappers";
function useChats(socket) {
  const { currentProject } = useProject();
  const [conversations, setConversations] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const activeConvIdRef = useRef(null);
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
        contactsApi.list({ per_page: 200, project_id: currentProject.id })
      ]);
      setConversations(Array.isArray(chatsRes) ? chatsRes.map(mapApiChatToUi) : []);
      setContacts((contactsRes.data ?? []).map(mapApiContactToUi));
      setError(null);
    } catch (e) {
      setError(e?.message ?? "Erro ao carregar conversas");
    } finally {
      setLoading(false);
    }
  }, [currentProject]);
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  useEffect(() => {
    if (!socket) return;
    const onNewMessage = (payload) => {
      const msg = {
        id: String(payload.id),
        senderId: String(payload.senderId),
        content: payload.content,
        type: payload.messageType ?? "text",
        timestamp: payload.createdAt,
        blocked: payload.blocked ?? false
      };
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      setConversations(
        (prev) => prev.map(
          (c) => c.id === String(payload.conversationId) ? { ...c, lastActivity: payload.createdAt } : c
        )
      );
    };
    socket.on("private_message:new", onNewMessage);
    return () => {
      socket.off("private_message:new", onNewMessage);
    };
  }, [socket]);
  const loadMessages = useCallback(async (chatId) => {
    if (socket) {
      if (activeConvIdRef.current && activeConvIdRef.current !== chatId) {
        socket.emit("leave_conversation", { conversationId: Number(activeConvIdRef.current) });
      }
      socket.emit("join_conversation", { conversationId: Number(chatId) });
    }
    activeConvIdRef.current = chatId;
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
  const sendMessage = async (chatId, senderId, content, type = "text") => {
    if (socket?.connected) {
      socket.emit("send_private_message", {
        conversationId: Number(chatId),
        content,
        messageType: type
      });
      return void 0;
    }
    const res = await chatsApi.sendMessage(chatId, {
      sender_id: Number(senderId),
      content,
      type
    });
    const newMsg = mapApiMessageToUi(res);
    setMessages((p) => [...p, newMsg]);
    setConversations((p) => p.map(
      (c) => c.id === chatId ? { ...c, lastActivity: (/* @__PURE__ */ new Date()).toISOString() } : c
    ));
    return newMsg;
  };
  const createConversation = async (participantA, participantB) => {
    const res = await chatsApi.create({
      participant_a: Number(participantA),
      participant_b: Number(participantB),
      project_id: currentProject?.id
    });
    const conv = mapApiChatToUi(res);
    setConversations((p) => {
      if (p.some((c) => c.id === conv.id)) return p.map((c) => c.id === conv.id ? conv : c);
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
    refetch: fetchData,
    loadMessages,
    sendMessage,
    createConversation
  };
}
export {
  useChats
};
