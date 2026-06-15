import { Check, Plus } from 'lucide-react';
import { STATUS_STYLE } from '../../lib/statusStyles.js';
import { Flag } from '../Flag.jsx';

// Card compacto de um cromo. Cor/badge refletem o status.
// Mostra o nome do cromo (label) + nº do slot; flag de apoio (país no FAN).
export function Cromo({ n, label, flag, status, qty, onClick }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.none;
  return (
    <button
      onClick={onClick}
      className={`relative flex aspect-[3/4] flex-col items-center justify-center gap-1 rounded-xl border px-1.5 ${s.card} transition active:scale-95`}
    >
      <span className="absolute left-1.5 top-1 font-disp text-xs font-bold text-white/45">
        {n}
      </span>
      <Flag emoji={flag} className="text-2xl leading-none" />
      <span className="line-clamp-2 text-center text-sm font-semibold leading-tight">
        {label}
      </span>

      {status === 'got' && (
        <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-st-got text-white">
          <Check size={12} strokeWidth={3} />
        </span>
      )}
      {status === 'duplicate' && (
        <span className="absolute right-1 top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-st-dup px-1 text-xs font-bold text-white">
          {qty}
        </span>
      )}
      {status === 'trading' && (
        <span className="absolute inset-x-0 bottom-0 rounded-b-xl bg-st-trade py-0.5 text-center text-[10px] font-bold uppercase tracking-wide text-white">
          troca
        </span>
      )}
      {status === 'none' && (
        <span className="absolute right-1 top-1 text-white/35">
          <Plus size={13} />
        </span>
      )}
    </button>
  );
}
