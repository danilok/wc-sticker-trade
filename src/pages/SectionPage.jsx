import { useState } from 'react';
import { Navigate, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useCatalog } from '../context/CatalogProvider.jsx';
import { STATUS_META } from '../lib/statusStyles.js';
import { useToast } from '../context/ToastProvider.jsx';
import { Flag } from '../components/Flag.jsx';
import { Cromo } from '../components/album/Cromo.jsx';
import { StatusSheet } from '../components/album/StatusSheet.jsx';

// Tela 3 (grade) — cromos de uma seção + bottom-sheet de status
export function SectionPage() {
  const { sectionCode } = useParams();
  const { catalog } = useCatalog();
  const section = catalog.sectionByCode[sectionCode];
  const { getStatus, setStatus } = useOutletContext();
  const toast = useToast();
  const navigate = useNavigate();
  const [sheetN, setSheetN] = useState(null); // número do cromo aberto no sheet

  if (!section) return <Navigate to="/album" replace />;

  const stickerInfo = (n) => {
    const st = section.stickers.find((s) => s.n === n);
    return {
      code: st?.code,
      label: st?.label || '',
      flag: st?.flag || section.flag,
    };
  };

  // contadores da legenda
  const counts = { got: 0, duplicate: 0, trading: 0, have: 0 };
  for (const st of section.stickers) {
    const s = getStatus(st.code).status;
    if (s !== 'none') counts.have += 1;
    if (counts[s] !== undefined) counts[s] += 1;
  }

  const apply = async (status, qty, customMsg) => {
    const code = stickerInfo(sheetN).code;
    try {
      await setStatus(code, status, qty);
      toast(customMsg || `${code} → ${STATUS_META[status].label}`);
      setSheetN(null);
    } catch {
      toast('Erro ao salvar. Tente de novo.');
    }
  };

  const sheet = sheetN != null ? stickerInfo(sheetN) : null;

  return (
    <div>
      <header className="bg-gradient-to-b from-brand-header1 to-brand-header2 px-5 pb-5 pt-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/album')}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20"
            aria-label="voltar"
          >
            <ChevronLeft size={20} />
          </button>
          <Flag emoji={section.flag} className="text-3xl" />
          <div className="flex-1">
            <div className="font-disp text-2xl font-bold leading-tight">{section.name}</div>
            <div className="text-sm text-white/85">
              {counts.have}/{section.count} cromos · {section.code}
            </div>
          </div>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/20">
          <div
            className="h-full rounded-full bg-white"
            style={{ width: `${(counts.have / section.count) * 100}%` }}
          />
        </div>
      </header>

      <div className="px-5 py-4">
        {/* legenda */}
        <div className="mb-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/70">
          <span className="flex items-center gap-1.5">
            <i className="h-2.5 w-2.5 rounded-full bg-st-got" /> Tenho {counts.got}
          </span>
          <span className="flex items-center gap-1.5">
            <i className="h-2.5 w-2.5 rounded-full bg-st-dup" /> Repetidas {counts.duplicate}
          </span>
          <span className="flex items-center gap-1.5">
            <i className="h-2.5 w-2.5 rounded-full bg-st-trade" /> Em troca {counts.trading}
          </span>
          <span className="flex items-center gap-1.5">
            <i className="h-2.5 w-2.5 rounded-full bg-white/30" /> Faltam{' '}
            {section.count - counts.have}
          </span>
        </div>

        {/* grade */}
        <div className="grid grid-cols-3 gap-2.5 min-[380px]:grid-cols-4">
          {section.stickers.map((st) => {
            const info = stickerInfo(st.n);
            const cur = getStatus(info.code);
            return (
              <Cromo
                key={info.code}
                n={st.n}
                label={info.label}
                flag={info.flag}
                status={cur.status}
                qty={cur.qty}
                onClick={() => setSheetN(st.n)}
              />
            );
          })}
        </div>
      </div>

      {sheet && (
        <StatusSheet
          code={sheet.code}
          label={sheet.label}
          flag={sheet.flag}
          sectionName={section.name}
          current={getStatus(sheet.code)}
          onApply={apply}
          onClose={() => setSheetN(null)}
        />
      )}
    </div>
  );
}
