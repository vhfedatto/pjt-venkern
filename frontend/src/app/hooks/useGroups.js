import { useState, useEffect, useCallback, useRef } from "react";
import { groupsApi, contactsApi } from "../services/api";
import { useProject } from "../context/ProjectContext";
import { mapApiGroupToUi, mapApiContactToUi, mapApiMessageToUi } from "../services/mappers";
function useGroups(socket) {
  const { currentProject } = useProject();
  const [groups, setGroups] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const activeGroupIdRef = useRef(null);
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
        contactsApi.list({ per_page: 200, project_id: currentProject.id })
      ]);
      const groupsData = groupsRes.data ?? (Array.isArray(groupsRes) ? groupsRes : []);
      setGroups(groupsData.map(mapApiGroupToUi));
      setContacts((contactsRes.data ?? []).map(mapApiContactToUi));
      setError(null);
    } catch (e) {
      setError(e?.message ?? "Erro ao carregar grupos");
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
      setGroups(
        (prev) => prev.map(
          (g) => g.id === String(payload.groupId) ? { ...g, lastActivity: payload.createdAt } : g
        )
      );
    };
    socket.on("group_message:new", onNewMessage);
    return () => {
      socket.off("group_message:new", onNewMessage);
    };
  }, [socket]);
  const loadMessages = useCallback(async (groupId) => {
    if (socket) {
      if (activeGroupIdRef.current && activeGroupIdRef.current !== groupId) {
        socket.emit("leave_group", { groupId: Number(activeGroupIdRef.current) });
      }
      socket.emit("join_group", { groupId: Number(groupId) });
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
  const sendMessage = async (groupId, senderId, content, type = "text") => {
    if (socket?.connected) {
      socket.emit("send_group_message", {
        groupId: Number(groupId),
        content,
        messageType: type
      });
      return void 0;
    }
    const res = await groupsApi.sendMessage(groupId, {
      sender_id: Number(senderId),
      content,
      type
    });
    const newMsg = mapApiMessageToUi(res);
    setMessages((p) => [...p, newMsg]);
    setGroups((p) => p.map(
      (g) => g.id === groupId ? { ...g, lastActivity: (/* @__PURE__ */ new Date()).toISOString() } : g
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
    sendMessage
  };
}
export {
  useGroups
};
