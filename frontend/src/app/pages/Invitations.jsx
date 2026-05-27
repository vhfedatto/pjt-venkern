import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { Mail, CheckCircle2, XCircle, ShieldCheck, RefreshCw } from "../components/ui/Icons";
import { invitationsApi } from "../services/api";
function RolePill({ role }) {
  const isAdmin = role === "ADMIN";
  return /* @__PURE__ */ jsxs(
    "span",
    {
      className: `inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${isAdmin ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"}`,
      children: [
        isAdmin && /* @__PURE__ */ jsx(ShieldCheck, { className: "w-3 h-3" }),
        role
      ]
    }
  );
}
function Invitations() {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  async function load() {
    setLoading(true);
    try {
      const res = await invitationsApi.mine();
      setInvitations(res.data ?? []);
    } catch {
      toast.error("Erro ao carregar convites");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);
  async function handle(id, action) {
    setProcessing(id);
    try {
      if (action === "accept") {
        await invitationsApi.accept(id);
        toast.success("Convite aceito! Voc\xEA agora \xE9 membro do projeto.");
      } else {
        await invitationsApi.refuse(id);
        toast.success("Convite recusado.");
      }
      setInvitations((prev) => prev.filter((inv) => inv.id !== id));
    } catch (e) {
      toast.error(e.message ?? "Erro ao processar convite");
    } finally {
      setProcessing(null);
    }
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6 p-1", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("h1", { className: "text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Mail, { className: "w-5 h-5 text-indigo-500" }),
          "Meus Convites"
        ] }),
        !loading && /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 mt-0.5", children: invitations.length === 0 ? "Nenhum convite pendente" : `${invitations.length} convite(s) pendente(s)` })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: load,
          className: "p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors",
          title: "Atualizar",
          children: /* @__PURE__ */ jsx(RefreshCw, { className: "w-4 h-4" })
        }
      )
    ] }),
    loading ? /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center py-20", children: /* @__PURE__ */ jsx("div", { className: "w-7 h-7 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" }) }) : invitations.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-20 gap-3 text-gray-400", children: [
      /* @__PURE__ */ jsx(Mail, { className: "w-10 h-10 opacity-30" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm", children: "Voc\xEA n\xE3o tem convites pendentes." })
    ] }) : /* @__PURE__ */ jsx("div", { className: "space-y-3", children: /* @__PURE__ */ jsx(AnimatePresence, { initial: false, children: invitations.map((inv) => /* @__PURE__ */ jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: -8 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, x: 40, height: 0, marginBottom: 0 },
        transition: { duration: 0.2 },
        className: "bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex items-center gap-4",
        children: [
          /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsx(Mail, { className: "w-5 h-5 text-indigo-500" }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-gray-800 dark:text-gray-100 truncate", children: inv.project_name }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mt-0.5 flex-wrap", children: [
              /* @__PURE__ */ jsx(RolePill, { role: inv.role }),
              /* @__PURE__ */ jsxs("span", { className: "text-xs text-gray-400", children: [
                "por ",
                /* @__PURE__ */ jsx("span", { className: "font-medium text-gray-500 dark:text-gray-300", children: inv.invited_by_name })
              ] }),
              /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-300 dark:text-gray-600", children: "\xB7" }),
              /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-400", children: new Date(inv.created_at).toLocaleDateString("pt-BR") })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-shrink-0", children: [
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => handle(inv.id, "accept"),
                disabled: processing === inv.id,
                className: "flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-medium rounded-xl transition-colors",
                children: [
                  processing === inv.id ? /* @__PURE__ */ jsx("div", { className: "w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" }) : /* @__PURE__ */ jsx(CheckCircle2, { className: "w-3.5 h-3.5" }),
                  "Aceitar"
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => handle(inv.id, "refuse"),
                disabled: processing === inv.id,
                className: "flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 text-gray-600 dark:text-gray-400 text-xs font-medium rounded-xl transition-colors",
                children: [
                  /* @__PURE__ */ jsx(XCircle, { className: "w-3.5 h-3.5" }),
                  "Recusar"
                ]
              }
            )
          ] })
        ]
      },
      inv.id
    )) }) })
  ] });
}
export {
  Invitations as default
};
