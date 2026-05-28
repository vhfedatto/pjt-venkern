import { useState } from 'react';
import { Building2 } from '../components/ui/Icons';
import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';
import { projectsApi } from '../services/api';
import { toast } from 'sonner';
export default function ProjectSelection() {
  const {
    projects,
    upsertProject,
    user
  } = useAuth();
  const {
    setCurrentProject
  } = useProject();
  const [projectName, setProjectName] = useState('');
  const [creatingProject, setCreatingProject] = useState(false);
  const handleCreateProject = async () => {
    const name = projectName.trim();
    if (!name) {
      toast.error('Informe o nome da empresa.');
      return;
    }
    setCreatingProject(true);
    try {
      const response = await projectsApi.create({
        name
      });
      const project = {
        ...response.data,
        role: 'ADMIN'
      };
      upsertProject(project);
      setCurrentProject(project);
      setProjectName('');
      toast.success('Empresa criada com sucesso.');
    } catch (error) {
      toast.error(error?.message ?? 'Erro ao criar empresa.');
    } finally {
      setCreatingProject(false);
    }
  };
  return <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-700 via-indigo-600 to-blue-600 flex-col items-center justify-center p-12 text-white">
        <div className="max-w-sm text-center space-y-6">
          <div className="text-5xl font-extrabold tracking-tight">Venkern</div>
          <p className="text-indigo-100 text-lg leading-relaxed">
            Selecione a empresa que deseja acessar ou crie uma nova para entrar no ecossistema.
          </p>
          <div className="w-16 h-1 bg-indigo-300 mx-auto rounded-full" />
          <p className="text-indigo-200 text-sm">
            {user?.name ? `Conta conectada: ${user.name}` : 'Conta autenticada'}
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-2xl space-y-8">
          <div className="lg:hidden text-center">
            <span className="text-3xl font-extrabold text-indigo-600 tracking-tight">Venkern</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">Escolher empresa</h1>
            <p className="text-sm text-gray-500">Selecione uma empresa existente ou crie uma nova antes de entrar no sistema.</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-3xl border border-gray-100 bg-gray-50 p-5">
              <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">
                <Building2 className="h-4 w-4" />
                Empresas
              </div>

              <div className="space-y-3">
                {projects.map(project => <button key={project.id} onClick={() => setCurrentProject(project)} className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-left transition-all hover:border-indigo-300 hover:bg-indigo-50">
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-sm font-bold text-white shadow-sm">
                        {project.name[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900">{project.name}</p>
                        <p className="text-xs uppercase tracking-wide text-indigo-500">{project.role}</p>
                      </div>
                    </div>
                    <p className="line-clamp-2 text-sm text-gray-500">
                      {project.description || 'Acesse este ambiente para gerenciar contatos, equipes, tarefas, eventos e grupos.'}
                    </p>
                  </button>)}

                {projects.length === 0 && <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
                    Você ainda não faz parte de nenhuma empresa.
                  </div>}
              </div>
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-5 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Nova empresa</p>
                <h2 className="text-xl font-bold text-gray-900">Criar empresa</h2>
                <p className="text-sm text-gray-500">Crie uma nova empresa e entre nela imediatamente como administrador.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Nome da empresa
                  </label>
                  <input type="text" value={projectName} onChange={event => setProjectName(event.target.value)} placeholder="Ex: Studio Norte" className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-400" />
                </div>

                <button onClick={handleCreateProject} disabled={creatingProject} className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-sm font-medium text-white shadow-md transition-opacity hover:opacity-90 disabled:opacity-60">
                  {creatingProject ? 'Criando empresa…' : 'Criar e entrar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
}