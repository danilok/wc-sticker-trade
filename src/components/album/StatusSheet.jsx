import { useState } from 'react';
import { Check, Minus, Plus } from 'lucide-react';
import { STATUS_META, STATUS_STYLE } from '../../lib/statusStyles.js';
import { Flag } from '../Flag.jsx';
import { Spinner } from '../Spinner.jsx';

const OPTIONS = ['none', 'got', 'duplicate', 'trading'];

// Bottom-sheet de alteração de status (Tela 3). Faz a chamada ao banco via onApply.
export function StatusSheet({ code, label, flag, sectionName, current, onApply, onClose }) {
  const [status, setStatus] = useState(current.status === 'none' ? 'got' : current.status);
  const [qty, setQty] = useState(current.status === 'duplicate' ? Math.max(1, current.qty) : 1);
  const [busy, setBusy] = useState(null); // null | 'save' | 'trade'

  const pick = (s) => {
    setStatus(s);
    if (s === 'duplicate' && qty < 1) setQty(1);
  };

  const apply = async () => {
    const q = status === 'duplicate' ? Math.max(1, qty) : 1;
    setBusy('save');
    try {
      await onApply(status, q);
    } finally {
      setBusy(null);
    }
  };

  // troca concluída: vira 'got' (1 unidade)
  const confirmTrade = async () => {
    setBusy('trade');
    try {
      await onApply('got', 1, `Troca concluída! ${code} colado no álbum 🎉`);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-app rounded-t-3xl bg-brand-sheet px-5 pb-8 pt-3 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-white/25" />

        <div className="mb-4 flex items-center gap-3">
          <Flag emoji={flag} className="text-3xl" />
          <div>
            <div className="font-disp text-xl font-bold">{code}</div>
            <div className="text-sm text-white/55">
              {label} · {sectionName}
            </div>
          </div>
        </div>

        {current.status === 'trading' && (
          <button
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-st-got px-4 py-3 font-semibold text-white transition hover:brightness-105 disabled:opacity-60"
            onClick={confirmTrade}
            disabled={!!busy}
          >
            {busy === 'trade' ? <Spinner size={18} /> : <Check size={18} />} Confirmar troca concluída
          </button>
        )}

        <div className="mb-2 text-sm font-semibold text-white/70">Status do cromo</div>
        <div className="grid grid-cols-2 gap-2.5">
          {OPTIONS.map((s) => {
            const m = STATUS_META[s];
            const st = STATUS_STYLE[s];
            const sel = status === s;
            return (
              <button
                key={s}
                onClick={() => pick(s)}
                className={`flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition ${
                  sel ? `${st.card} ring-2 ring-brand-accent` : 'border-white/12 bg-white/5'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${st.dot}`} />
                  <span className="font-semibold">{m.label}</span>
                </span>
                <span className="text-xs text-white/50">{m.desc}</span>
              </button>
            );
          })}
        </div>

        {status === 'duplicate' && (
          <div className="mt-4 flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
            <span className="text-sm font-medium text-white/80">Quantas você tem?</span>
            <div className="flex items-center gap-3">
              <button
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 disabled:opacity-40"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={qty <= 1}
              >
                <Minus size={18} />
              </button>
              <span className="w-6 text-center font-disp text-xl font-bold">{qty}</span>
              <button
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10"
                onClick={() => setQty((q) => Math.min(20, q + 1))}
              >
                <Plus size={18} />
              </button>
            </div>
          </div>
        )}

        <div className="mt-5 flex gap-3">
          <button className="btn-ghost flex-1" onClick={onClose} disabled={!!busy}>
            Cancelar
          </button>
          <button className="btn-cta flex-1" onClick={apply} disabled={!!busy}>
            {busy === 'save' ? <Spinner size={20} /> : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}
