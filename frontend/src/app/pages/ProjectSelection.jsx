import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Building2 } from "../components/ui/Icons";
import { useAuth } from "../context/AuthContext";
import { useProject } from "../context/ProjectContext";
import { projectsApi } from "../services/api";
import { toast } from "sonner";
function ProjectSelection() {
  const { projects, upsertProject, user } = useAuth();
  const { setCurrentProject } = useProject();
  const [projectName, setProjectName] = useState("");
  const [creatingProject, setCreatingProject] = useState(false);
  const handleCreateProject = async () => {
    const name = projectName.trim();
    if (!name) {
      toast.error("Informe o nome da empresa.");
      return;
    }
    setCreatingProject(true);
    try {
      const response = await projectsApi.create({ name });
      const project = { ...response.data, role: "ADMIN" };
      upsertProject(project);
      setCurrentProject(project);
      setProjectName("");
      toast.success("Empresa criada com sucesso.");
    } catch (error) {
      toast.error(error?.message ?? "Erro ao criar empresa.");
    } finally {
      setCreatingProject(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen flex", children: [
    /* @__PURE__ */ jsx("div", { className: "hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-700 via-indigo-600 to-blue-600 flex-col items-center justify-center p-12 text-white", children: /* @__PURE__ */ jsxs("div", { className: "max-w-sm text-center space-y-6", children: [
      /* @__PURE__ */ jsx("div", { className: "text-5xl font-extrabold tracking-tight", children: "Venkern" }),
      /* @__PURE__ */ jsx("p", { className: "text-indigo-100 text-lg leading-relaxed", children: "Selecione a empresa que deseja acessar ou crie uma nova para entrar no ecossistema." }),
      /* @__PURE__ */ jsx("div", { className: "w-16 h-1 bg-indigo-300 mx-auto rounded-full" }),
      /* @__PURE__ */ jsx("p", { className: "text-indigo-200 text-sm", children: user?.name ? `Conta conectada: ${user.name}` : "Conta autenticada" })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "flex-1 flex items-center justify-center p-6 bg-white", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-2xl space-y-8", children: [
      /* @__PURE__ */ jsx("div", { className: "lg:hidden text-center", children: /* @__PURE__ */ jsx("span", { className: "text-3xl font-extrabold text-indigo-600 tracking-tight", children: "Venkern" }) }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Escolher empresa" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: "Selecione uma empresa existente ou crie uma nova antes de entrar no sistema." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-6 lg:grid-cols-[1.1fr_0.9fr]", children: [
        /* @__PURE__ */ jsxs("div", { className: "rounded-3xl border border-gray-100 bg-gray-50 p-5", children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600", children: [
            /* @__PURE__ */ jsx(Building2, { className: "h-4 w-4" }),
            "Empresas"
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
            projects.map((project) => /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => setCurrentProject(project),
                className: "w-full rounded-2xl border border-gray-200 bg-white p-4 text-left transition-all hover:border-indigo-300 hover:bg-indigo-50",
                children: [
                  /* @__PURE__ */ jsxs("div", { className: "mb-3 flex items-center gap-3", children: [
                    /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-sm font-bold text-white shadow-sm", children: project.name[0] }),
                    /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                      /* @__PURE__ */ jsx("p", { className: "truncate text-sm font-semibold text-gray-900", children: project.name }),
                      /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-wide text-indigo-500", children: project.role })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsx("p", { className: "line-clamp-2 text-sm text-gray-500", children: project.description || "Acesse este ambiente para gerenciar contatos, equipes, tarefas, eventos e grupos." })
                ]
              },
              project.id
            )),
            projects.length === 0 && /* @__PURE__ */ jsx("div", { className: "rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-500", children: "Voc\xEA ainda n\xE3o faz parte de nenhuma empresa." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-3xl border border-gray-100 bg-white p-5 shadow-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-5 space-y-2", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.18em] text-gray-400", children: "Nova empresa" }),
            /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold text-gray-900", children: "Criar empresa" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: "Crie uma nova empresa e entre nela imediatamente como administrador." })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500", children: "Nome da empresa" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  value: projectName,
                  onChange: (event) => setProjectName(event.target.value),
                  placeholder: "Ex: Studio Norte",
                  className: "w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-400"
                }
              )
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: handleCreateProject,
                disabled: creatingProject,
                className: "w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-sm font-medium text-white shadow-md transition-opacity hover:opacity-90 disabled:opacity-60",
                children: creatingProject ? "Criando empresa\u2026" : "Criar e entrar"
              }
            )
          ] })
        ] })
      ] })
    ] }) })
  ] });
}
export {
  ProjectSelection as default
};
