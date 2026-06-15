import { useState } from 'react';
import { AlertCircle, ChevronRight, Layers } from 'lucide-react';
import { useAuth } from '../context/AuthProvider.jsx';
import { Spinner } from '../components/Spinner.jsx';

// Tela 2 — Configuração de perfil e grupo (onboarding)
export function OnboardingPage() {
  const { saveProfile } = useAuth();
  const [username, setUsername] = useState('');
  const [groupId, setGroupId] = useState('');
  const [groupName, setGroupName] = useState('');
  const [groupPass, setGroupPass] = useState('');
  const [saving, setSaving] = useState(false);
  const [touched, setTouched] = useState(false);
  const [err, setErr] = useState('');

  const cleanUser = username.replace(/[^a-z0-9_.]/gi, '').toLowerCase();
  const valid =
    cleanUser.length >= 3 && groupId.trim().length >= 3 && groupName.trim().length >= 2;

  const save = async () => {
    setTouched(true);
    setErr('');
    if (!valid) return;
    setSaving(true);
    try {
      await saveProfile({
        username: cleanUser,
        panini_group_id: groupId.trim(),
        panini_group_name: groupName.trim(),
        panini_group_password: groupPass.trim() || null,
      });
      // perfil completo → App redireciona pro /album
    } catch (e) {
      setErr(e.message || 'Não foi possível salvar. Tente de novo.');
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-full max-w-app flex-col">
      {/* hero */}
      <div className="bg-gradient-to-b from-brand-header1 to-brand-header2 px-6 pb-8 pt-12">
        <div className="text-xs font-bold uppercase tracking-wide text-white/80">
          Passo único · Perfil
        </div>
        <h1 className="mt-1 font-disp text-3xl font-extrabold">Configure seu grupo</h1>
        <p className="mt-1 text-sm text-white/90">
          Pra encontrar trocas, diga seu apelido e em qual grupo de colecionadores você está.
        </p>
      </div>

      <div className="flex-1 space-y-5 px-6 py-6">
        {/* username */}
        <div>
          <label className="field-label">Nome de usuário</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-brand-accent">
              @
            </span>
            <input
              className={`input pl-9 ${touched && cleanUser.length < 3 ? 'input-err' : ''}`}
              placeholder="seu_apelido"
              autoCapitalize="none"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          {touched && cleanUser.length < 3 ? (
            <div className="mt-1 flex items-center gap-1.5 text-sm text-red-300">
              <AlertCircle size={14} /> Pelo menos 3 caracteres.
            </div>
          ) : (
            <div className="mt-1 text-xs text-white/50">
              Vai aparecer como{' '}
              <b className="text-brand-accent">@{cleanUser || 'seu_apelido'}</b> pro grupo.
            </div>
          )}
        </div>

        {/* group id */}
        <div>
          <label className="field-label">Código / ID do grupo</label>
          <div className="relative">
            <Layers
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40"
            />
            <input
              className={`input pl-11 ${touched && groupId.trim().length < 3 ? 'input-err' : ''}`}
              placeholder="ex: PAN-7X2K9"
              autoCapitalize="characters"
              value={groupId}
              onChange={(e) => setGroupId(e.target.value.toUpperCase())}
            />
          </div>
          {touched && groupId.trim().length < 3 && (
            <div className="mt-1 flex items-center gap-1.5 text-sm text-red-300">
              <AlertCircle size={14} /> Informe o código do grupo.
            </div>
          )}
        </div>

        {/* group name */}
        <div>
          <label className="field-label">Nome do grupo</label>
          <input
            className={`input ${touched && groupName.trim().length < 2 ? 'input-err' : ''}`}
            placeholder="ex: Galera do Bairro"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
        </div>

        {/* group pass */}
        <div>
          <label className="field-label">
            Senha do grupo <span className="font-medium text-white/40">(opcional)</span>
          </label>
          <input
            className="input"
            placeholder="só pra consulta rápida"
            value={groupPass}
            onChange={(e) => setGroupPass(e.target.value)}
          />
          <div className="mt-1 text-xs text-white/50">
            Guardada só pra você repassar a quem quiser entrar no grupo.
          </div>
        </div>

        {err && (
          <div className="flex items-center gap-2 text-sm text-red-300">
            <AlertCircle size={15} /> {err}
          </div>
        )}

        <button className="btn-cta" onClick={save} disabled={saving}>
          {saving ? (
            <>
              <Spinner size={20} /> Salvando…
            </>
          ) : (
            <>
              Salvar e ir pro álbum <ChevronRight size={20} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
