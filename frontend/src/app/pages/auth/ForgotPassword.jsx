import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Link } from "react-router";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api";
function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [devToken, setDevToken] = useState(null);
  const [error, setError] = useState("");
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? `Erro ${res.status}`);
      setSent(true);
      if (data.reset_token) setDevToken(data.reset_token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao processar solicita\xE7\xE3o");
    } finally {
      setLoading(false);
    }
  }
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen flex", children: [
    /* @__PURE__ */ jsx("div", { className: "hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-700 via-indigo-600 to-blue-600 flex-col items-center justify-center p-12 text-white", children: /* @__PURE__ */ jsxs("div", { className: "max-w-sm text-center space-y-6", children: [
      /* @__PURE__ */ jsx("div", { className: "text-5xl font-extrabold tracking-tight", children: "Venkern" }),
      /* @__PURE__ */ jsx("p", { className: "text-indigo-100 text-lg leading-relaxed", children: "N\xE3o se preocupe. Vamos ajud\xE1-lo a recuperar o acesso \xE0 sua conta." }),
      /* @__PURE__ */ jsx("div", { className: "w-16 h-1 bg-indigo-300 mx-auto rounded-full" })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "flex-1 flex items-center justify-center p-6 bg-white", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-sm space-y-8", children: [
      /* @__PURE__ */ jsx("div", { className: "lg:hidden text-center", children: /* @__PURE__ */ jsx("span", { className: "text-3xl font-extrabold text-indigo-600 tracking-tight", children: "Venkern" }) }),
      !sent ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Recuperar senha" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: "Informe seu e-mail e enviaremos as instru\xE7\xF5es para redefinir sua senha." })
        ] }),
        /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-5", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "email", children: "E-mail" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "email",
                type: "email",
                autoComplete: "email",
                placeholder: "seu@email.com",
                value: email,
                onChange: (e) => setEmail(e.target.value),
                required: true,
                disabled: loading
              }
            )
          ] }),
          error && /* @__PURE__ */ jsx("p", { className: "text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2", children: error }),
          /* @__PURE__ */ jsx(
            Button,
            {
              type: "submit",
              className: "w-full bg-indigo-600 hover:bg-indigo-700 text-white",
              disabled: loading,
              children: loading ? "Enviando\u2026" : "Enviar instru\xE7\xF5es"
            }
          )
        ] })
      ] }) : /* @__PURE__ */ jsxs("div", { className: "space-y-6 text-center", children: [
        /* @__PURE__ */ jsx("div", { className: "w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mx-auto", children: /* @__PURE__ */ jsx("svg", { className: "w-8 h-8 text-indigo-600", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" }) }) }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold text-gray-900", children: "Verifique seu e-mail" }),
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-500", children: [
            "Se o endere\xE7o ",
            /* @__PURE__ */ jsx("span", { className: "font-medium text-gray-700", children: email }),
            " estiver cadastrado, voc\xEA receber\xE1 as instru\xE7\xF5es para redefinir sua senha em breve."
          ] })
        ] }),
        devToken && /* @__PURE__ */ jsxs("div", { className: "text-left bg-yellow-50 border border-yellow-200 rounded-md p-3 space-y-1", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-yellow-800", children: "Modo desenvolvimento" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-yellow-700 break-all font-mono", children: devToken })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "text-center text-sm text-gray-500", children: [
        "Lembrou a senha?",
        " ",
        /* @__PURE__ */ jsx(Link, { to: "/login", className: "text-indigo-600 font-medium hover:text-indigo-500 transition-colors", children: "Entrar" })
      ] })
    ] }) })
  ] });
}
export {
  ForgotPassword as default
};
