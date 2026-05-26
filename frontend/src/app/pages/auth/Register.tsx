import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '@/app/context/AuthContext';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { PasswordInput } from '@/app/components/ui/password-input';

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9._-]/g, '')
    .slice(0, 50);
}

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [usernameEdited, setUsernameEdited] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleNameChange(value: string) {
    setName(value);
    if (!usernameEdited) {
      setUsername(slugify(value.split(' ')[0]));
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (username && (username.length < 3 || username.length > 50)) {
      setError('O @ deve ter entre 3 e 50 caracteres');
      return;
    }
    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      return;
    }
    if (password !== confirm) {
      setError('As senhas não conferem');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password, username || undefined);
      navigate('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-700 via-indigo-600 to-blue-600 flex-col items-center justify-center p-12 text-white">
        <div className="max-w-sm text-center space-y-6">
          <div className="text-5xl font-extrabold tracking-tight">Venkern</div>
          <p className="text-indigo-100 text-lg leading-relaxed">
            Gerencie seus clientes, equipes e operações em um único lugar.
          </p>
          <div className="w-16 h-1 bg-indigo-300 mx-auto rounded-full" />
          <p className="text-indigo-200 text-sm">
            Crie sua conta e comece agora.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden text-center">
            <span className="text-3xl font-extrabold text-indigo-600 tracking-tight">Venkern</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">Criar conta</h1>
            <p className="text-sm text-gray-500">Preencha os dados abaixo para se cadastrar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                type="text"
                autoComplete="name"
                placeholder="Seu Nome"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="username">Seu @ <span className="text-gray-400 font-normal">(identificador único)</span></Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500 font-semibold text-sm select-none">@</span>
                <Input
                  id="username"
                  type="text"
                  autoComplete="username"
                  placeholder="seunome"
                  value={username}
                  onChange={(e) => {
                    setUsername(slugify(e.target.value));
                    setUsernameEdited(true);
                  }}
                  disabled={loading}
                  className="pl-7"
                />
              </div>
              {username && (
                <p className="text-xs text-indigo-600 font-medium">Seu identificador: @{username}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Senha</Label>
              <PasswordInput
                id="password"
                autoComplete="new-password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm">Confirmar senha</Label>
              <PasswordInput
                id="confirm"
                autoComplete="new-password"
                placeholder="Repita a senha"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
              disabled={loading}
            >
              {loading ? 'Criando conta…' : 'Criar conta'}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-indigo-600 font-medium hover:text-indigo-500 transition-colors">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
