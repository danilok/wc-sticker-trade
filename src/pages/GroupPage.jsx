import { useMemo, useState } from 'react';
import {
  AlertCircle,
  Copy,
  Eye,
  EyeOff,
  Inbox,
  Search,
  Sparkles,
  Users,
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient.js';
import { useCatalog } from '../context/CatalogProvider.jsx';
import { Flag } from '../components/Flag.jsx';
import { useAuth } from '../context/AuthProvider.jsx';
import { useToast } from '../context/ToastProvider.jsx';
import { useOutletContext } from 'react-router-dom';
import { Spinner } from '../components/Spinner.jsx';

// Tela 4 — Painel do Grupo: buscar repetidas dos outros membros
export function GroupPage() {
  const { profile } = useAuth();
  const { catalog } = useCatalog();
  const { getStatus } = useOutletContext();
  const toast = useToast();

  const [phase, setPhase] = useState('idle'); // idle | loading | done | empty | error
  const [results, setResults] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [revealPass, setRevealPass] = useState(false);

  const search = async () => {
    setPhase('loading');
    const { data, error } = await supabase.rpc('group_duplicates');
    if (error) {
      console.error(error.message);
      setPhase('error');
      return;
    }
    setResults(data || []);
    setPhase((data || []).length ? 'done' : 'empty');
  };

  const sectionsPresent = useMemo(() => {
    const map = new Map();
    for (const r of results) {
      const sec = catalog.sectionOf(r.sticker_code);
      if (sec && !map.has(sec.code)) map.set(sec.code, sec);
    }
    return [...map.values()];
  }, [results]);

  const shown =
    filter === 'ALL' ? results : results.filter((r) => r.sticker_code.startsWith(filter + '-'));

  const copy = (text, label) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    toast(label + ' copiado');
  };

  return (
    <div>
      <header className="bg-gradient-to-b from-brand-header1 to-brand-header2 px-5 pb-5 pt-10">
        <div className="text-xs font-bold uppercase tracking-wide text-white/80">
          Painel do grupo
        </div>
        <h1 className="font-disp text-3xl font-extrabold">Trocas do Grupo</h1>
      </header>

      <div className="px-5 py-5">
        {/* cartão do grupo */}
        <div className="rounded-2xl bg-brand-panel p-4">
          <div className="font-disp text-xl font-bold">{profile.panini_group_name}</div>
          <div className="mt-1 flex items-center gap-1.5 text-sm text-white/70">
            <Users size={14} /> Grupo {profile.panini_group_id}
          </div>
          <div className="mt-3 flex flex-wrap gap-4">
            <div>
              <div className="text-xs uppercase tracking-wide text-white/50">Código</div>
              <div className="flex items-center gap-2 font-disp text-lg font-bold">
                {profile.panini_group_id}
                <button
                  className="text-white/60 hover:text-white"
                  onClick={() => copy(profile.panini_group_id, 'Código')}
                >
                  <Copy size={16} />
                </button>
              </div>
            </div>
            {profile.panini_group_password && (
              <div>
                <div className="text-xs uppercase tracking-wide text-white/50">Senha</div>
                <div className="flex items-center gap-2 font-disp text-lg font-bold">
                  {revealPass ? profile.panini_group_password : '••••••'}
                  <button
                    className="text-white/60 hover:text-white"
                    onClick={() => setRevealPass((v) => !v)}
                  >
                    {revealPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button
                    className="text-white/60 hover:text-white"
                    onClick={() => copy(profile.panini_group_password, 'Senha')}
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CTA */}
        <button
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-accent px-4 py-3.5 font-disp text-lg font-bold text-brand-accent-ink transition hover:brightness-105 active:scale-[0.99] disabled:opacity-60"
          onClick={search}
          disabled={phase === 'loading'}
        >
          {phase === 'loading' ? (
            <>
              <Spinner size={20} /> Buscando…
            </>
          ) : (
            <>
              <Search size={20} strokeWidth={2.4} /> Buscar repetidas do grupo
            </>
          )}
        </button>

        {/* estados */}
        {phase === 'idle' && (
          <StateBox
            icon={<Sparkles size={26} />}
            title="Veja quem tem o que você precisa"
            text="A busca mostra as repetidas dos outros colecionadores do seu grupo. É só pedir a troca no app oficial da Panini."
          />
        )}

        {phase === 'loading' && (
          <div className="mt-5 space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-white/[0.06]" />
            ))}
          </div>
        )}

        {phase === 'error' && (
          <StateBox
            icon={<AlertCircle size={26} className="text-red-400" />}
            title="Não rolou a busca"
            text="Falha ao conectar com o servidor. Verifique sua conexão e tente de novo."
            action={
              <button className="btn-ghost mt-1" onClick={search}>
                Tentar de novo
              </button>
            }
          />
        )}

        {phase === 'empty' && (
          <StateBox
            icon={<Inbox size={26} />}
            title="Nenhuma repetida agora"
            text="Ninguém do grupo tem repetidas no momento. Volte mais tarde!"
          />
        )}

        {phase === 'done' && (
          <>
            <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
              <Chip active={filter === 'ALL'} onClick={() => setFilter('ALL')}>
                Tudo ({results.length})
              </Chip>
              {sectionsPresent.map((s) => (
                <Chip key={s.code} active={filter === s.code} onClick={() => setFilter(s.code)}>
                  <Flag emoji={s.flag} className="mr-1 text-sm" />
                  {s.code}
                </Chip>
              ))}
            </div>
            <div className="mb-3 mt-1 text-xs text-white/50">
              Ordenado por código · @ de quem tem a repetida
            </div>
            <div className="space-y-2">
              {shown.map((r, i) => {
                const sec = catalog.sectionOf(r.sticker_code);
                const need = getStatus(r.sticker_code).status === 'none';
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.06] p-3"
                  >
                    <Flag emoji={sec?.flag} className="text-2xl" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="font-disp text-base font-bold">{r.sticker_code}</span>
                        <span className="truncate text-sm text-white/80">{r.description}</span>
                      </div>
                      <div className="truncate text-xs text-white/50">
                        @{r.username} · {sec?.name}
                        {need && <span className="text-brand-accent"> · você precisa!</span>}
                      </div>
                    </div>
                    {need && <Sparkles size={16} className="text-brand-accent" />}
                    <div className="text-center">
                      <div className="font-disp text-lg font-bold leading-none">{r.quantity}</div>
                      <div className="text-[10px] uppercase text-white/40">repet.</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StateBox({ icon, title, text, action }) {
  return (
    <div className="mt-6 flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-10 text-center">
      <div className="text-brand-accent">{icon}</div>
      <div className="font-disp text-lg font-bold">{title}</div>
      <p className="max-w-xs text-sm text-white/60">{text}</p>
      {action}
    </div>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
        active ? 'bg-brand-accent text-brand-accent-ink' : 'bg-white/10 text-white/70'
      }`}
    >
      {children}
    </button>
  );
}
