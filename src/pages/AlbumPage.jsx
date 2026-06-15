import { useMemo } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { AlertCircle, Check, ClipboardList, Repeat } from 'lucide-react';
import { useCatalog } from '../context/CatalogProvider.jsx';
import { Flag } from '../components/Flag.jsx';
import { Spinner } from '../components/Spinner.jsx';

function sectionProgress(section, getStatus) {
  let have = 0;
  let dups = 0;
  for (const st of section.stickers) {
    const s = getStatus(st.code).status;
    if (s !== 'none') have += 1;
    if (s === 'duplicate') dups += 1;
  }
  return { have, dups, total: section.count };
}

// agrupa seções na ordem do álbum (já vem por position): WAP abre, depois as
// seleções por grupo da Copa (A–L), e ATF/FAN fecham em "Especiais". Monta por
// runs contíguas — uma run de especiais com 1 item usa o nome da própria seção.
function buildGroups(sections) {
  const groups = [];
  let teamGroup = null;
  let specialRun = null;
  const flushSpecial = () => {
    if (!specialRun) return;
    groups.push({
      title: specialRun.length === 1 ? specialRun[0].name : 'Especiais',
      items: specialRun,
    });
    specialRun = null;
  };
  for (const s of sections) {
    if (s.type === 'special') {
      teamGroup = null;
      if (!specialRun) specialRun = [];
      specialRun.push(s);
    } else {
      flushSpecial();
      const key = s.wcGroup || '?';
      if (!teamGroup || teamGroup.key !== key) {
        teamGroup = { key, title: `Grupo ${key}`, items: [] };
        groups.push(teamGroup);
      }
      teamGroup.items.push(s);
    }
  }
  flushSpecial();
  return groups;
}

// Tela 3 (menu) — lista de seções/seleções
export function AlbumPage() {
  const { getStatus, loading, error, reload } = useOutletContext();
  const { catalog } = useCatalog();
  const navigate = useNavigate();

  const groups = useMemo(() => buildGroups(catalog.sections), [catalog]);

  const totalFilled = catalog.allCodes.filter((c) => getStatus(c).status !== 'none').length;
  const totalAll = catalog.total;
  const pct = totalAll ? Math.round((totalFilled / totalAll) * 100) : 0;

  return (
    <div>
      {/* header */}
      <header className="bg-gradient-to-b from-brand-header1 to-brand-header2 px-5 pb-5 pt-10">
        <div className="text-xs font-bold uppercase tracking-wide text-white/80">
          World Cup 2026 · Coleção
        </div>
        <h1 className="font-disp text-3xl font-extrabold">Meu Álbum</h1>
        <div className="mt-3">
          <div className="mb-1 flex items-baseline justify-between">
            <span className="font-disp text-2xl font-bold">{pct}%</span>
            <span className="text-sm text-white/85">
              {totalFilled} de {totalAll} cromos
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-black/20">
            <div className="h-full rounded-full bg-white" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </header>

      <div className="px-5 py-5">
        <button
          onClick={() => navigate('/cadastro')}
          className="mb-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/10 py-2 text-xs font-medium text-white/40 transition hover:border-white/20 hover:text-white/65"
        >
          <ClipboardList size={13} strokeWidth={2} />
          Cadastro rápido de figurinhas
        </button>
        {loading && (
          <div className="flex justify-center py-16 text-brand-accent">
            <Spinner size={32} />
          </div>
        )}

        {error && !loading && (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <AlertCircle size={28} className="text-red-400" />
            <div className="font-semibold">Erro ao carregar seus cromos</div>
            <p className="max-w-xs text-sm text-white/60">
              Verifique sua conexão e tente novamente.
            </p>
            <button className="btn-ghost mt-1" onClick={reload}>
              Tentar de novo
            </button>
          </div>
        )}

        {!loading &&
          !error &&
          groups.map((g) => (
            <section key={g.title} className="mb-6">
              <h2 className="mb-2.5 font-disp text-lg font-bold text-white/85">{g.title}</h2>
              <div className="grid grid-cols-2 gap-3">
                {g.items.map((s) => {
                  const { have, dups, total } = sectionProgress(s, getStatus);
                  const done = have === total;
                  return (
                    <button
                      key={s.code}
                      onClick={() => navigate(`/album/${s.code}`)}
                      className={`relative flex flex-col rounded-2xl border p-3.5 text-left transition active:scale-[0.98] ${
                        done
                          ? 'border-st-got/50 bg-st-got/10'
                          : 'border-white/10 bg-white/[0.06]'
                      }`}
                    >
                      <Flag emoji={s.flag} className="mb-1 text-3xl leading-none" />
                      <div className="font-semibold leading-tight">{s.name}</div>
                      <div className="text-xs text-white/50">
                        {s.code} · {total} cromos
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="font-disp text-sm font-bold">
                          {have}/{total}
                        </span>
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full bg-brand-accent"
                            style={{ width: `${(have / total) * 100}%` }}
                          />
                        </div>
                      </div>
                      {done && (
                        <span className="absolute right-2.5 top-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-st-got text-white">
                          <Check size={13} strokeWidth={3} />
                        </span>
                      )}
                      {!done && dups > 0 && (
                        <span className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-full bg-st-dup px-2 py-0.5 text-xs font-bold text-white">
                          <Repeat size={11} strokeWidth={2.6} />
                          {dups}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
      </div>
    </div>
  );
}
