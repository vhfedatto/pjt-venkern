import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "@/app/context/AuthContext";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { PasswordInput } from "@/app/components/ui/password-input";
function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao entrar");
    } finally {
      setLoading(false);
    }
  }
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen flex", children: [
    /* @__PURE__ */ jsx("div", { className: "hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-700 via-indigo-600 to-blue-600 flex-col items-center justify-center p-12 text-white", children: /* @__PURE__ */ jsxs("div", { className: "max-w-sm text-center space-y-6", children: [
      /* @__PURE__ */ jsx("div", { className: "text-5xl font-extrabold tracking-tight", children: "Venkern" }),
      /* @__PURE__ */ jsx("p", { className: "text-indigo-100 text-lg leading-relaxed", children: "Gerencie seus clientes, equipes e opera\xE7\xF5es em um \xFAnico lugar." }),
      /* @__PURE__ */ jsx("div", { className: "w-16 h-1 bg-indigo-300 mx-auto rounded-full" }),
      /* @__PURE__ */ jsx("p", { className: "text-indigo-200 text-sm", children: "CRM moderno para equipes de alta performance." })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "flex-1 flex items-center justify-center p-6 bg-white", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-sm space-y-8", children: [
      /* @__PURE__ */ jsx("div", { className: "lg:hidden text-center", children: /* @__PURE__ */ jsx("span", { className: "text-3xl font-extrabold text-indigo-600 tracking-tight", children: "Venkern" }) }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Bem-vindo de volta" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: "Entre com sua conta para continuar" })
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
        /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "password", children: "Senha" }),
            /* @__PURE__ */ jsx(
              Link,
              {
                to: "/esqueceu-senha",
                className: "text-xs text-indigo-600 hover:text-indigo-500 transition-colors",
                children: "Esqueceu a senha?"
              }
            )
          ] }),
          /* @__PURE__ */ jsx(
            PasswordInput,
            {
              id: "password",
              autoComplete: "current-password",
              placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
              value: password,
              onChange: (e) => setPassword(e.target.value),
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
            children: loading ? "Entrando\u2026" : "Entrar"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "text-center text-sm text-gray-500", children: [
        "N\xE3o tem uma conta?",
        " ",
        /* @__PURE__ */ jsx(Link, { to: "/cadastro", className: "text-indigo-600 font-medium hover:text-indigo-500 transition-colors", children: "Cadastre-se" })
      ] })
    ] }) })
  ] });
}
export {
  Login as default
};
