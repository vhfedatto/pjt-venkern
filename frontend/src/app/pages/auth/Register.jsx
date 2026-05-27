import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "@/app/context/AuthContext";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { PasswordInput } from "@/app/components/ui/password-input";
function slugify(str) {
  return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9._-]/g, "").slice(0, 50);
}
function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [usernameEdited, setUsernameEdited] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  function handleNameChange(value) {
    setName(value);
    if (!usernameEdited) {
      setUsername(slugify(value.split(" ")[0]));
    }
  }
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (username && (username.length < 3 || username.length > 50)) {
      setError("O @ deve ter entre 3 e 50 caracteres");
      return;
    }
    if (password.length < 6) {
      setError("A senha deve ter no m\xEDnimo 6 caracteres");
      return;
    }
    if (password !== confirm) {
      setError("As senhas n\xE3o conferem");
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password, username || void 0);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  }
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen flex", children: [
    /* @__PURE__ */ jsx("div", { className: "hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-700 via-indigo-600 to-blue-600 flex-col items-center justify-center p-12 text-white", children: /* @__PURE__ */ jsxs("div", { className: "max-w-sm text-center space-y-6", children: [
      /* @__PURE__ */ jsx("div", { className: "text-5xl font-extrabold tracking-tight", children: "Venkern" }),
      /* @__PURE__ */ jsx("p", { className: "text-indigo-100 text-lg leading-relaxed", children: "Gerencie seus clientes, equipes e opera\xE7\xF5es em um \xFAnico lugar." }),
      /* @__PURE__ */ jsx("div", { className: "w-16 h-1 bg-indigo-300 mx-auto rounded-full" }),
      /* @__PURE__ */ jsx("p", { className: "text-indigo-200 text-sm", children: "Crie sua conta e comece agora." })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "flex-1 flex items-center justify-center p-6 bg-white", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-sm space-y-8", children: [
      /* @__PURE__ */ jsx("div", { className: "lg:hidden text-center", children: /* @__PURE__ */ jsx("span", { className: "text-3xl font-extrabold text-indigo-600 tracking-tight", children: "Venkern" }) }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Criar conta" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: "Preencha os dados abaixo para se cadastrar" })
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "name", children: "Nome completo" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "name",
              type: "text",
              autoComplete: "name",
              placeholder: "Seu Nome",
              value: name,
              onChange: (e) => handleNameChange(e.target.value),
              required: true,
              disabled: loading
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxs(Label, { htmlFor: "username", children: [
            "Seu @ ",
            /* @__PURE__ */ jsx("span", { className: "text-gray-400 font-normal", children: "(identificador \xFAnico)" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx("span", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500 font-semibold text-sm select-none", children: "@" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "username",
                type: "text",
                autoComplete: "username",
                placeholder: "seunome",
                value: username,
                onChange: (e) => {
                  setUsername(slugify(e.target.value));
                  setUsernameEdited(true);
                },
                disabled: loading,
                className: "pl-7"
              }
            )
          ] }),
          username && /* @__PURE__ */ jsxs("p", { className: "text-xs text-indigo-600 font-medium", children: [
            "Seu identificador: @",
            username
          ] })
        ] }),
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
          /* @__PURE__ */ jsx(Label, { htmlFor: "password", children: "Senha" }),
          /* @__PURE__ */ jsx(
            PasswordInput,
            {
              id: "password",
              autoComplete: "new-password",
              placeholder: "M\xEDnimo 6 caracteres",
              value: password,
              onChange: (e) => setPassword(e.target.value),
              required: true,
              disabled: loading
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "confirm", children: "Confirmar senha" }),
          /* @__PURE__ */ jsx(
            PasswordInput,
            {
              id: "confirm",
              autoComplete: "new-password",
              placeholder: "Repita a senha",
              value: confirm,
              onChange: (e) => setConfirm(e.target.value),
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
            children: loading ? "Criando conta\u2026" : "Criar conta"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "text-center text-sm text-gray-500", children: [
        "J\xE1 tem uma conta?",
        " ",
        /* @__PURE__ */ jsx(Link, { to: "/login", className: "text-indigo-600 font-medium hover:text-indigo-500 transition-colors", children: "Entrar" })
      ] })
    ] }) })
  ] });
}
export {
  Register as default
};
