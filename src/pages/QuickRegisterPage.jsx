import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { ArrowLeft, ChevronDown, Search, X } from 'lucide-react';
import { useCatalog } from '../context/CatalogProvider.jsx';
import { Flag } from '../components/Flag.jsx';
import { Spinner } from '../components/Spinner.jsx';

// ──────────────────────────────────────────────────────────────────────
// Row de uma figurinha
// ──────────────────────────────────────────────────────────────────────
function StickerRow({ sticker, entry, onSave }) {
  const status = entry?.status ?? 'none';
  const storeQty = entry?.qty ?? 1;

  const [localQty, setLocalQty] = useState(storeQty);
  const debounceRef = useRef(null);

  // Sincroniza qty local quando o store muda (ex.: carga inicial)
  useEffect(() => {
    setLocalQty(storeQty);
  }, [storeQty]);

  const got = status !== 'none';
  const isDup = status === 'duplicate';

  function handleGotChange(checked) {
    clearTimeout(debounceRef.current);
    if (checked) {
      onSave(sticker.code, 'got', 1);
    } else {
      // Desmarcar "Tenho" limpa também "Repetidas" — prioridade do desmarcado
      onSave(sticker.code, 'none', 0);
    }
  }

  function handleDupChange(checked) {
    if (checked) {
      // Marcar "Repetidas" implica "Tenho" automaticamente
      const q = Math.max(1, Number(localQty) || 1);
      setLocalQty(q);
      onSave(sticker.code, 'duplicate', q);
    } else {
      // Desmarcar "Repetidas" mantém "Tenho" marcado
      onSave(sticker.code, 'got', 1);
    }
  }

  function handleQtyChange(val) {
    setLocalQty(val);
    const n = parseInt(val, 10);
    if (!isNaN(n) && n >= 1) {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onSave(sticker.code, 'duplicate', n);
      }, 500);
    }
  }

  const qtyInvalid = isDup && (isNaN(parseInt(localQty, 10)) || parseInt(localQty, 10) < 1);

  return (
    <tr className="border-b border-white/[0.05] last:border-0">
      {/* código */}
      <td className="py-2 pr-2 align-middle">
        <span className="font-mono text-[11px] text-white/40">{sticker.code}</span>
      </td>
      {/* nome */}
      <td className="py-2 pr-2 align-middle">
        <span className="line-clamp-2 text-sm leading-tight">{sticker.label || sticker.code}</span>
      </td>
      {/* Tenho */}
      <td className="py-2 pr-2 align-middle text-center">
        <input
          type="checkbox"
          checked={got}
          onChange={(e) => handleGotChange(e.target.checked)}
          className="h-[18px] w-[18px] cursor-pointer rounded accent-green-400"
        />
      </td>
      {/* Repetida */}
      <td className="py-2 pr-2 align-middle text-center">
        <input
          type="checkbox"
          checked={isDup}
          onChange={(e) => handleDupChange(e.target.checked)}
          className="h-[18px] w-[18px] cursor-pointer rounded accent-amber-400"
        />
      </td>
      {/* Qtd */}
      <td className="py-2 align-middle">
        <input
          type="number"
          inputMode="numeric"
          min={1}
          value={isDup ? localQty : ''}
          disabled={!isDup}
          onChange={(e) => handleQtyChange(e.target.value)}
          placeholder="—"
          className={`w-14 rounded-lg border px-2 py-1 text-center text-sm font-semibold
            bg-white/[0.07] placeholder-white/20
            disabled:cursor-not-allowed disabled:opacity-25
            ${qtyInvalid ? 'border-red-400/70 text-red-300' : 'border-white/15 text-white'}
          `}
        />
      </td>
    </tr>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Seção (accordion)
// ──────────────────────────────────────────────────────────────────────
function SectionAccordion({ section, map, setStatus, open, onToggle, filteredStickers }) {
  const stickersToShow = filteredStickers ?? section.stickers;
  const have = section.stickers.filter(
    (s) => map[s.code] && map[s.code].status !== 'none',
  ).length;

  return (
    <div className="border-b border-white/10">
      {/* cabeçalho clicável */}
      <button
        className="flex w-full items-center gap-2.5 py-3 text-left"
        onClick={onToggle}
      >
        <Flag emoji={section.flag} className="text-2xl leading-none" />
        <span className="min-w-0 flex-1 truncate font-semibold">{section.name}</span>
        <span className="shrink-0 text-xs text-white/45">
          {have}/{section.count}
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-white/40 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* tabela de figurinhas */}
      {open && (
        <div className="pb-3">
          <table className="w-full table-fixed">
            <colgroup>
              <col className="w-[62px]" />
              <col />
              <col className="w-[44px]" />
              <col className="w-[44px]" />
              <col className="w-[60px]" />
            </colgroup>
            <thead>
              <tr className="border-b border-white/10">
                <th className="pb-1.5 text-left text-[10px] font-semibold uppercase tracking-wide text-white/35">
                  Cód.
                </th>
                <th className="pb-1.5 text-left text-[10px] font-semibold uppercase tracking-wide text-white/35">
                  Nome
                </th>
                <th className="pb-1.5 text-center text-[10px] font-semibold uppercase tracking-wide text-white/35">
                  Tenho
                </th>
                <th className="pb-1.5 text-center text-[10px] font-semibold uppercase tracking-wide text-white/35">
                  Rep.
                </th>
                <th className="pb-1.5 text-center text-[10px] font-semibold uppercase tracking-wide text-white/35">
                  Qtd
                </th>
              </tr>
            </thead>
            <tbody>
              {stickersToShow.map((sticker) => (
                <StickerRow
                  key={sticker.code}
                  sticker={sticker}
                  entry={map[sticker.code]}
                  onSave={setStatus}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Página principal
// ──────────────────────────────────────────────────────────────────────
export function QuickRegisterPage() {
  const { map, setStatus, loading } = useOutletContext();
  const { catalog } = useCatalog();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [openSections, setOpenSections] = useState(new Set());

  // Filtra seções/cromos quando há busca
  const filteredSections = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return catalog.sections.map((s) => ({ section: s, stickers: null }));
    return catalog.sections
      .map((s) => {
        const stickers = s.stickers.filter(
          (st) =>
            st.code.toLowerCase().includes(q) ||
            (st.label ?? '').toLowerCase().includes(q),
        );
        return { section: s, stickers };
      })
      .filter(({ stickers }) => stickers.length > 0);
  }, [catalog.sections, search]);

  // Quando a busca muda, abre automaticamente as seções com resultado
  useEffect(() => {
    if (search.trim()) {
      setOpenSections(new Set(filteredSections.map(({ section }) => section.code)));
    }
  }, [search, filteredSections]);

  const allOpen = filteredSections.every(({ section }) => openSections.has(section.code));

  function toggleAll() {
    if (allOpen) {
      setOpenSections((prev) => {
        const next = new Set(prev);
        filteredSections.forEach(({ section }) => next.delete(section.code));
        return next;
      });
    } else {
      setOpenSections((prev) => {
        const next = new Set(prev);
        filteredSections.forEach(({ section }) => next.add(section.code));
        return next;
      });
    }
  }

  function toggleSection(code) {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }

  // Contadores globais
  const totalHave = useMemo(
    () => catalog.allCodes.filter((c) => map[c] && map[c].status !== 'none').length,
    [catalog.allCodes, map],
  );

  return (
    <div>
      {/* ── Header ── */}
      <header className="bg-gradient-to-b from-brand-header1 to-brand-header2 px-5 pb-5 pt-10">
        <button
          onClick={() => navigate(-1)}
          className="-ml-1 mb-3 flex items-center gap-1.5 text-sm text-white/70 transition hover:text-white"
        >
          <ArrowLeft size={16} strokeWidth={2.5} />
          Voltar
        </button>
        <div className="text-xs font-bold uppercase tracking-wide text-white/80">
          Trocaê · WC 2026
        </div>
        <h1 className="font-disp text-3xl font-extrabold">Cadastro Rápido</h1>
        <p className="mt-1 text-sm text-white/60">
          Marque as figurinhas que você tem e quantas repetidas.
        </p>
        {/* Progresso geral */}
        <div className="mt-3 text-sm text-white/60">
          <span className="font-disp text-lg font-bold text-white">{totalHave}</span>
          {' '}de{' '}
          <span className="font-semibold text-white">{catalog.total}</span>
          {' '}cromos marcados
        </div>
      </header>

      <div className="px-5 py-4">
        {loading && (
          <div className="flex justify-center py-12 text-brand-accent">
            <Spinner size={32} />
          </div>
        )}

        {!loading && (
          <>
            {/* ── Busca ── */}
            <div className="relative mb-3">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por código ou nome…"
                className="w-full rounded-xl border border-white/15 bg-white/[0.07] py-2.5 pl-8 pr-9 text-sm placeholder-white/30 outline-none focus:border-brand-accent/60"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* ── Expandir / Recolher tudo ── */}
            <div className="mb-2 flex justify-end">
              <button
                onClick={toggleAll}
                className="text-xs font-semibold text-brand-accent/80 hover:text-brand-accent"
              >
                {allOpen ? 'Recolher tudo' : 'Expandir tudo'}
              </button>
            </div>

            {/* ── Seções ── */}
            {filteredSections.length === 0 ? (
              <div className="py-12 text-center text-sm text-white/45">
                Nenhuma figurinha encontrada para "{search}".
              </div>
            ) : (
              filteredSections.map(({ section, stickers }) => (
                <SectionAccordion
                  key={section.code}
                  section={section}
                  map={map}
                  setStatus={setStatus}
                  open={openSections.has(section.code)}
                  onToggle={() => toggleSection(section.code)}
                  filteredStickers={stickers}
                />
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}
