import { useNavigate, useOutletContext } from 'react-router-dom';
import { ClipboardList, Layers, LogOut, Lock } from 'lucide-react';
import { useCatalog } from '../context/CatalogProvider.jsx';
import { useAuth } from '../context/AuthProvider.jsx';

// Perfil — resumo + dados do grupo + sair
export function ProfilePage() {
  const { profile, signOut } = useAuth();
  const { getStatus } = useOutletContext();
  const navigate = useNavigate();
  const { catalog } = useCatalog();

  let got = 0;
  let dups = 0;
  let trade = 0;
  for (const c of catalog.allCodes) {
    const s = getStatus(c).status;
    if (s !== 'none') got += 1;
    if (s === 'duplicate') dups += 1;
    if (s === 'trading') trade += 1;
  }
  const initials = (profile.username || 'eu').slice(0, 2).toUpperCase();

  return (
    <div>
      <header className="bg-gradient-to-b from-brand-header1 to-brand-header2 px-5 pb-5 pt-10">
        <div className="text-xs font-bold uppercase tracking-wide text-white/80">Sua conta</div>
        <h1 className="font-disp text-3xl font-extrabold">Perfil</h1>
      </header>

      <div className="px-5 py-5">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-accent font-disp text-2xl font-bold text-brand-accent-ink">
            {initials}
          </div>
          <div>
            <div className="font-disp text-2xl font-bold">@{profile.username}</div>
            <div className="text-sm text-white/60">{profile.panini_group_name}</div>
          </div>
        </div>

        {/* stats */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          <Stat value={got} label="Colados" color="text-st-got" />
          <Stat value={dups} label="Repetidas" color="text-st-dup" />
          <Stat value={trade} label="Em troca" color="text-st-trade" />
        </div>
        <div className="mt-2 text-center text-xs text-white/40">
          {got} de {catalog.total} cromos na coleção
        </div>

        {/* grupo */}
        <h2 className="mb-2 mt-6 font-disp text-lg font-bold text-white/85">Meu grupo</h2>
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3">
          <Layers size={20} className="text-white/60" />
          Código
          <b className="ml-auto font-disp">{profile.panini_group_id}</b>
        </div>
        {profile.panini_group_password && (
          <div className="mt-2 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3">
            <Lock size={20} className="text-white/60" />
            Senha
            <b className="ml-auto font-disp">{profile.panini_group_password}</b>
          </div>
        )}

        <button
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-brand-accent/40 bg-brand-accent/10 px-4 py-3 font-semibold text-brand-accent transition hover:bg-brand-accent/20"
          onClick={() => navigate('/cadastro')}
        >
          <ClipboardList size={20} /> Cadastro Rápido
        </button>

        <button
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-red-400/40 px-4 py-3 font-semibold text-red-300 transition hover:bg-red-400/10"
          onClick={signOut}
        >
          <LogOut size={20} /> Sair da conta
        </button>

        <div className="mt-6 text-center text-xs text-white/40">Trocaê · MVP · v0.1</div>
      </div>
    </div>
  );
}

function Stat({ value, label, color }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.06] py-3 text-center">
      <div className={`font-disp text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-white/55">{label}</div>
    </div>
  );
}
