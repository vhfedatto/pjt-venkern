import { useState } from 'react';
import { Link } from 'react-router';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api';
export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [devToken, setDevToken] = useState(null);
  const [error, setError] = useState('');
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? `Erro ${res.status}`);
      setSent(true);
      if (data.reset_token) setDevToken(data.reset_token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar solicitação');
    } finally {
      setLoading(false);
    }
  }
  return <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-700 via-indigo-600 to-blue-600 flex-col items-center justify-center p-12 text-white">
        <div className="max-w-sm text-center space-y-6">
          <div className="text-5xl font-extrabold tracking-tight">Venkern</div>
          <p className="text-indigo-100 text-lg leading-relaxed">
            Não se preocupe. Vamos ajudá-lo a recuperar o acesso à sua conta.
          </p>
          <div className="w-16 h-1 bg-indigo-300 mx-auto rounded-full" />
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden text-center">
            <span className="text-3xl font-extrabold text-indigo-600 tracking-tight">Venkern</span>
          </div>

          {!sent ? <>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-gray-900">Recuperar senha</h1>
                <p className="text-sm text-gray-500">
                  Informe seu e-mail e enviaremos as instruções para redefinir sua senha.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" autoComplete="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} required disabled={loading} />
                </div>

                {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                    {error}
                  </p>}

                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" disabled={loading}>
                  {loading ? 'Enviando…' : 'Enviar instruções'}
                </Button>
              </form>
            </> : <div className="space-y-6 text-center">
              <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-gray-900">Verifique seu e-mail</h2>
                <p className="text-sm text-gray-500">
                  Se o endereço <span className="font-medium text-gray-700">{email}</span> estiver
                  cadastrado, você receberá as instruções para redefinir sua senha em breve.
                </p>
              </div>

              {devToken && <div className="text-left bg-yellow-50 border border-yellow-200 rounded-md p-3 space-y-1">
                  <p className="text-xs font-semibold text-yellow-800">Modo desenvolvimento</p>
                  <p className="text-xs text-yellow-700 break-all font-mono">{devToken}</p>
                </div>}
            </div>}

          <p className="text-center text-sm text-gray-500">
            Lembrou a senha?{' '}
            <Link to="/login" className="text-indigo-600 font-medium hover:text-indigo-500 transition-colors">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>;
}