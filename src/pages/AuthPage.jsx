import { useState } from 'react';
import { AlertCircle, Eye, EyeOff, Lock, Mail, Repeat } from 'lucide-react';
import { useAuth } from '../context/AuthProvider.jsx';
import { GoogleIcon } from '../components/GoogleIcon.jsx';
import { Spinner } from '../components/Spinner.jsx';

const isEmail = (v) => /.+@.+\..+/.test(v);

// Tela 1 — Login / Cadastro
export function AuthPage() {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState('login'); // login | signup
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(null); // null | 'email' | 'google'
  const [err, setErr] = useState('');
  const [info, setInfo] = useState('');

  const submit = async () => {
    setErr('');
    setInfo('');
    if (!isEmail(email.trim())) return setErr('Informe um e-mail válido.');
    if (pass.length < 6) return setErr('A senha precisa de pelo menos 6 caracteres.');
    setLoading('email');
    try {
      if (mode === 'signup') {
        const data = await signUpWithEmail(email.trim(), pass);
        if (!data.session) {
          setInfo('Conta criada! Confirme o e-mail que enviamos para entrar.');
        }
        // com sessão, o redirect acontece automático via AuthProvider
      } else {
        await signInWithEmail(email.trim(), pass);
      }
    } catch (e) {
      setErr(traduzErro(e.message));
    } finally {
      setLoading(null);
    }
  };

  const google = async () => {
    setErr('');
    setInfo('');
    setLoading('google');
    try {
      await signInWithGoogle(); // redireciona pro Google
    } catch (e) {
      setErr(traduzErro(e.message));
      setLoading(null);
    }
  };

  return (
    <div className="flex min-h-full items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm">
        {/* marca */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-accent text-brand-accent-ink shadow-lg">
            <Repeat size={34} strokeWidth={2.4} />
          </div>
          <div className="text-center">
            <div className="font-disp text-3xl font-extrabold">Trocaê</div>
            <div className="mt-1 text-sm text-white/60">
              Seu álbum da Copa, suas trocas — sem bagunça.
            </div>
          </div>
        </div>

        {/* e-mail */}
        <div className="mb-4">
          <label className="field-label">E-mail</label>
          <div className="relative">
            <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              className={`input pl-11 ${err && !isEmail(email) ? 'input-err' : ''}`}
              type="email"
              inputMode="email"
              autoCapitalize="none"
              placeholder="voce@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        {/* senha */}
        <div className="mb-4">
          <label className="field-label">Senha</label>
          <div className="relative">
            <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              className="input pl-11 pr-11"
              type={show ? 'text' : 'password'}
              placeholder="••••••••"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
              onClick={() => setShow((s) => !s)}
              aria-label="mostrar senha"
            >
              {show ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {err && (
          <div className="mb-3 flex items-center gap-2 text-sm text-red-300">
            <AlertCircle size={15} /> {err}
          </div>
        )}
        {info && (
          <div className="mb-3 rounded-lg bg-brand-accent/15 px-3 py-2 text-sm text-brand-accent">
            {info}
          </div>
        )}

        <button className="btn-cta mt-2" onClick={submit} disabled={!!loading}>
          {loading === 'email' ? (
            <>
              <Spinner size={20} /> {mode === 'login' ? 'Entrando…' : 'Criando conta…'}
            </>
          ) : mode === 'login' ? (
            'Entrar'
          ) : (
            'Criar conta'
          )}
        </button>

        <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wide text-white/40">
          <span className="h-px flex-1 bg-white/15" /> ou <span className="h-px flex-1 bg-white/15" />
        </div>

        <button
          className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-4 py-3.5 font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
          onClick={google}
          disabled={!!loading}
        >
          {loading === 'google' ? <Spinner size={18} className="text-blue-500" /> : <GoogleIcon />}
          Entrar com o Google
        </button>

        <div className="mt-6 text-center text-sm text-white/60">
          {mode === 'login' ? 'Ainda não tem conta? ' : 'Já tem conta? '}
          <button
            className="font-semibold text-brand-accent hover:underline"
            onClick={() => {
              setMode((m) => (m === 'login' ? 'signup' : 'login'));
              setErr('');
              setInfo('');
            }}
          >
            {mode === 'login' ? 'Cadastre-se' : 'Entrar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// mensagens de erro Supabase → pt-BR amigável
function traduzErro(msg = '') {
  const m = msg.toLowerCase();
  if (m.includes('invalid login')) return 'E-mail ou senha incorretos.';
  if (m.includes('already registered')) return 'Esse e-mail já tem conta. Faça login.';
  if (m.includes('rate limit')) return 'Muitas tentativas. Aguarde um momento.';
  return msg || 'Algo deu errado. Tente de novo.';
}
