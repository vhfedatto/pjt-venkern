import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { motion } from "motion/react";
import { Link2, ShieldCheck, Clock, UserPlus, LogIn, UserCog } from "../components/ui/Icons";
import { inviteLinkApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
function InviteAccept({ token }) {
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated } = useAuth();
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => {
    inviteLinkApi.getInfo(token).then((data) => setInfo(data)).catch(() => setError("Convite inv\xE1lido ou expirado.")).finally(() => setLoading(false));
  }, [token]);
  async function handleAccept() {
    setAccepting(true);
    try {
      await inviteLinkApi.accept(token);
      toast.success(`Voc\xEA entrou no projeto "${info?.projectName}"!`);
      navigate("/");
    } catch (e) {
      toast.error(e.message ?? "Erro ao aceitar convite");
    } finally {
      setAccepting(false);
    }
  }
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 flex items-center justify-center px-4", children: /* @__PURE__ */ jsx(
    motion.div,
    {
      initial: { opacity: 0, y: 24 },
      animate: { opacity: 1, y: 0 },
      className: "w-full max-w-md",
      children: /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden", children: [
        /* @__PURE__ */ jsx("div", { className: "h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500" }),
        /* @__PURE__ */ jsxs("div", { className: "p-8", children: [
          /* @__PURE__ */ jsx("div", { className: "flex justify-center mb-6", children: /* @__PURE__ */ jsx("div", { className: "w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center", children: /* @__PURE__ */ jsx(Link2, { className: "w-7 h-7 text-indigo-600 dark:text-indigo-400" }) }) }),
          loading && /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
            /* @__PURE__ */ jsx("div", { className: "w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: "Verificando convite..." })
          ] }),
          !loading && error && /* @__PURE__ */ jsxs("div", { className: "text-center space-y-3", children: [
            /* @__PURE__ */ jsx("p", { className: "text-lg font-semibold text-gray-900 dark:text-white", children: "Convite inv\xE1lido" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: error }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => navigate("/"),
                className: "mt-4 px-6 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl transition-colors",
                children: "Ir para o in\xEDcio"
              }
            )
          ] }),
          !loading && info && !info.valid && /* @__PURE__ */ jsxs("div", { className: "text-center space-y-3", children: [
            /* @__PURE__ */ jsx("p", { className: "text-lg font-semibold text-gray-900 dark:text-white", children: "Convite expirado" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: "Este link de convite n\xE3o \xE9 mais v\xE1lido. Pe\xE7a ao administrador um novo link." }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => navigate("/"),
                className: "mt-4 px-6 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl transition-colors",
                children: "Ir para o in\xEDcio"
              }
            )
          ] }),
          !loading && info && info.valid && /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
            /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-widest text-indigo-500 font-semibold mb-1", children: "Convite para" }),
              /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: info.projectName })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-4 text-sm text-gray-500", children: [
              /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsx(UserCog, { className: "w-4 h-4 text-indigo-400" }),
                info.role === "ADMIN" ? /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsx(ShieldCheck, { className: "w-3.5 h-3.5 text-indigo-500" }),
                  " Admin"
                ] }) : "Professional"
              ] }),
              info.expiresAt && /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsx(Clock, { className: "w-4 h-4 text-amber-400" }),
                "Expira ",
                new Date(info.expiresAt).toLocaleDateString("pt-BR")
              ] })
            ] }),
            isAuthenticated ? /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsxs("p", { className: "text-center text-sm text-gray-600 dark:text-gray-400", children: [
                "Voc\xEA est\xE1 logado como ",
                /* @__PURE__ */ jsx("strong", { children: currentUser?.name }),
                "."
              ] }),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: handleAccept,
                  disabled: accepting,
                  className: "w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-2xl transition-colors flex items-center justify-center gap-2",
                  children: [
                    accepting ? /* @__PURE__ */ jsx("div", { className: "w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" }) : /* @__PURE__ */ jsx(UserPlus, { className: "w-4 h-4" }),
                    "Aceitar convite"
                  ]
                }
              )
            ] }) : /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsx("p", { className: "text-center text-sm text-gray-500", children: "Fa\xE7a login ou crie uma conta para aceitar este convite." }),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => navigate(`/login?redirect=/invite/${token}`),
                  className: "w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl transition-colors flex items-center justify-center gap-2",
                  children: [
                    /* @__PURE__ */ jsx(LogIn, { className: "w-4 h-4" }),
                    "Entrar / Cadastrar"
                  ]
                }
              )
            ] })
          ] })
        ] })
      ] })
    }
  ) });
}
export {
  InviteAccept as default
};
