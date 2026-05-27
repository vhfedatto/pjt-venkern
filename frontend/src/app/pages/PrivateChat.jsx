import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Image, ShieldAlert, Search, Loader2 } from "../components/ui/Icons";
import { motion } from "motion/react";
import { toast } from "sonner";
import { useApp } from "../context/AppContext";
import { useChats } from "../hooks/useChats";
import { useSocket } from "../hooks/useSocket";
import { Avatar } from "../components/ui/Avatar";
import { StatusBadge } from "../components/ui/Badge";
function PrivateChat() {
  const { currentUser } = useApp();
  const { socket } = useSocket();
  const { conversations, contacts, messages, messagesLoading, loading, error, loadMessages, sendMessage, createConversation } = useChats(socket);
  const [selectedChatId, setSelectedChatId] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);
  const myContact = contacts.find((c) => c.email === currentUser.email);
  const myContactId = myContact?.id ?? "";
  const myChats = conversations.filter((c) => c.participantIds.includes(myContactId));
  const selectedChat = conversations.find((c) => c.id === selectedChatId);
  const otherParticipantId = selectedChat?.participantIds.find((id) => id !== myContactId);
  const otherContact = contacts.find((c) => c.id === otherParticipantId);
  useEffect(() => {
    if (!selectedChatId && myChats.length > 0) {
      setSelectedChatId(myChats[0].id);
    }
  }, [myChats, selectedChatId]);
  useEffect(() => {
    if (selectedChatId) loadMessages(selectedChatId);
  }, [selectedChatId, loadMessages]);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);
  useEffect(() => {
    if (!socket) return;
    const onTyping = (data) => {
      if (String(data.conversationId) !== selectedChatId) return;
      setTypingUsers(
        (prev) => data.isTyping ? prev.includes(data.name) ? prev : [...prev, data.name] : prev.filter((n) => n !== data.name)
      );
    };
    socket.on("chat:typing", onTyping);
    return () => {
      socket.off("chat:typing", onTyping);
    };
  }, [socket, selectedChatId]);
  const emitTyping = useCallback((isTyping) => {
    if (!socket || !selectedChatId) return;
    socket.emit("typing", { conversationId: Number(selectedChatId), isTyping });
  }, [socket, selectedChatId]);
  const filteredChats = myChats.filter((c) => {
    const otherId = c.participantIds.find((id) => id !== myContactId);
    const other = contacts.find((x) => x.id === otherId);
    return !search || other?.name.toLowerCase().includes(search.toLowerCase());
  });
  const handleSend = async () => {
    if (!message.trim() || !selectedChatId || !myContactId) return;
    setSending(true);
    emitTyping(false);
    try {
      await sendMessage(selectedChatId, myContactId, message.trim());
      setMessage("");
    } catch (e) {
      toast.error(e?.message ?? "Erro ao enviar mensagem");
    } finally {
      setSending(false);
    }
  };
  const handleImageSend = async () => {
    if (!selectedChatId || !myContactId) return;
    try {
      await sendMessage(selectedChatId, myContactId, "\u{1F4F7} [Imagem anexada]", "image");
      toast.success("\u{1F4F7} Imagem enviada!");
    } catch (e) {
      toast.error(e?.message ?? "Erro ao enviar imagem");
    }
  };
  const handleOpenChat = async (contactId) => {
    if (!myContactId) return;
    try {
      const conv = await createConversation(myContactId, contactId);
      setSelectedChatId(conv.id);
      await loadMessages(conv.id);
    } catch (e) {
      toast.error(e?.message ?? "Erro ao criar conversa");
    }
  };
  const formatTime = (ts) => new Date(ts).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const formatDate = (ts) => new Date(ts).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-64", children: /* @__PURE__ */ jsx(Loader2, { className: "w-8 h-8 animate-spin text-indigo-500" }) });
  }
  if (error) {
    return /* @__PURE__ */ jsx("div", { className: "p-6 text-center text-red-500 text-sm", children: error });
  }
  const otherContacts = contacts.filter(
    (c) => c.id !== myContactId && !myChats.some((ch) => ch.participantIds.includes(c.id) && ch.participantIds.includes(myContactId))
  );
  return /* @__PURE__ */ jsxs("div", { className: "flex h-[calc(100vh-64px)] overflow-hidden", children: [
    /* @__PURE__ */ jsxs("div", { className: "w-72 flex-shrink-0 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col", children: [
      /* @__PURE__ */ jsxs("div", { className: "p-4 border-b border-gray-100 dark:border-gray-800", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-sm font-bold text-gray-900 dark:text-white mb-3", children: "Mensagens" }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: search,
              onChange: (e) => setSearch(e.target.value),
              placeholder: "Buscar conversa...",
              className: "w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-400 placeholder:text-gray-400"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 overflow-y-auto p-2", children: [
        filteredChats.map((chat) => {
          const otherId = chat.participantIds.find((id) => id !== myContactId);
          const other = contacts.find((c) => c.id === otherId);
          if (!other) return null;
          const isSelected = chat.id === selectedChatId;
          return /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setSelectedChatId(chat.id),
              className: `w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all mb-1 ${isSelected ? "bg-indigo-50 dark:bg-indigo-900/30" : "hover:bg-gray-50 dark:hover:bg-gray-800/50"}`,
              children: [
                /* @__PURE__ */ jsx(Avatar, { name: other.name, size: "md", status: other.status, className: "flex-shrink-0" }),
                /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsx("p", { className: `text-sm font-semibold truncate ${isSelected ? "text-indigo-700 dark:text-indigo-400" : "text-gray-900 dark:text-white"}`, children: other.name }),
                  /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-400 truncate", children: other.position })
                ] })
              ]
            },
            chat.id
          );
        }),
        /* @__PURE__ */ jsxs("div", { className: "mt-3 px-2", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2", children: "Outros Contatos" }),
          otherContacts.map((c) => /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => handleOpenChat(c.id),
              className: "w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-left transition-colors mb-1",
              children: [
                /* @__PURE__ */ jsx(Avatar, { name: c.name, size: "sm", status: c.status }),
                /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsx("p", { className: "text-xs font-medium text-gray-900 dark:text-white truncate", children: c.name }),
                  /* @__PURE__ */ jsx("p", { className: "text-[10px] text-gray-400 truncate", children: c.position })
                ] })
              ]
            },
            c.id
          ))
        ] })
      ] })
    ] }),
    selectedChat && otherContact ? /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col min-w-0", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 px-5 py-3.5 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex-shrink-0", children: [
        /* @__PURE__ */ jsx(Avatar, { name: otherContact.name, size: "md", status: otherContact.status }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-bold text-gray-900 dark:text-white", children: otherContact.name }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-400", children: otherContact.position })
        ] }),
        /* @__PURE__ */ jsx(StatusBadge, { status: otherContact.status })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-950", children: [
        messagesLoading ? /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-32", children: /* @__PURE__ */ jsx(Loader2, { className: "w-6 h-6 animate-spin text-indigo-400" }) }) : messages.length === 0 ? /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-32", children: /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-400", children: "Nenhuma mensagem ainda" }) }) : messages.map((msg, i) => {
          const isMine = msg.senderId === myContactId;
          const showDate = i === 0 || formatDate(messages[i - 1].timestamp) !== formatDate(msg.timestamp);
          return /* @__PURE__ */ jsxs("div", { children: [
            showDate && /* @__PURE__ */ jsx("div", { className: "flex justify-center my-2", children: /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-400 bg-white dark:bg-gray-800 px-3 py-1 rounded-full border border-gray-100 dark:border-gray-700", children: formatDate(msg.timestamp) }) }),
            /* @__PURE__ */ jsxs(
              motion.div,
              {
                initial: { opacity: 0, y: 8 },
                animate: { opacity: 1, y: 0 },
                className: `flex items-end gap-2 ${isMine ? "flex-row-reverse" : ""}`,
                children: [
                  !isMine && /* @__PURE__ */ jsx(Avatar, { name: otherContact.name, size: "xs", className: "flex-shrink-0 mb-1" }),
                  /* @__PURE__ */ jsxs("div", { className: `max-w-xs lg:max-w-md flex flex-col ${isMine ? "items-end" : "items-start"}`, children: [
                    msg.blocked ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/40", children: [
                      /* @__PURE__ */ jsx(ShieldAlert, { className: "w-4 h-4 text-red-500 flex-shrink-0" }),
                      /* @__PURE__ */ jsx("span", { className: "text-sm text-red-600 dark:text-red-400", children: msg.content })
                    ] }) : /* @__PURE__ */ jsx("div", { className: `px-4 py-2.5 rounded-2xl text-sm shadow-sm ${isMine ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-sm" : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-sm border border-gray-100 dark:border-gray-700"}`, children: msg.content }),
                    /* @__PURE__ */ jsx("span", { className: "text-[10px] text-gray-400 mt-1 mx-1", children: formatTime(msg.timestamp) })
                  ] })
                ]
              }
            )
          ] }, msg.id);
        }),
        /* @__PURE__ */ jsx("div", { ref: messagesEndRef })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex-shrink-0", children: [
        typingUsers.length > 0 && /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-400 mb-1 px-1", children: [
          typingUsers.join(", "),
          " ",
          typingUsers.length === 1 ? "est\xE1" : "est\xE3o",
          " digitando..."
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: handleImageSend,
              title: "Enviar imagem",
              className: "p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-indigo-500 transition-colors flex-shrink-0",
              children: /* @__PURE__ */ jsx(Image, { className: "w-5 h-5" })
            }
          ),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: message,
              onChange: (e) => {
                setMessage(e.target.value);
                emitTyping(true);
                if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                typingTimeoutRef.current = setTimeout(() => emitTyping(false), 2e3);
              },
              onKeyDown: (e) => e.key === "Enter" && handleSend(),
              placeholder: `Mensagem para ${otherContact.name.split(" ")[0]}...`,
              className: "flex-1 px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-400 transition-all placeholder:text-gray-400"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: handleSend,
              disabled: !message.trim() || sending,
              className: "p-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm flex-shrink-0",
              children: sending ? /* @__PURE__ */ jsx(Loader2, { className: "w-5 h-5 animate-spin" }) : /* @__PURE__ */ jsx(Send, { className: "w-5 h-5" })
            }
          )
        ] })
      ] })
    ] }) : /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col items-center justify-center gap-4 bg-gray-50 dark:bg-gray-950", children: [
      /* @__PURE__ */ jsx("div", { className: "w-20 h-20 rounded-3xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center", children: /* @__PURE__ */ jsx(Send, { className: "w-10 h-10 text-indigo-300" }) }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-400 text-sm", children: "Selecione uma conversa para come\xE7ar" })
    ] })
  ] });
}
export {
  PrivateChat as default
};
