// Metadados de UI de cada status (label/descrição). 'none' = sem registro.
// Alinhado com user_stickers.status: 'got' | 'duplicate' | 'trading'.
export const STATUS_META = {
  none:      { key: 'none',  label: 'Falta',    short: 'Não tenho', tw: 'slate',  desc: 'Ainda não colei' },
  got:       { key: 'got',   label: 'Tenho',    short: 'Colado',    tw: 'green',  desc: 'Já está no álbum' },
  duplicate: { key: 'dup',   label: 'Repetida', short: 'Repetida',  tw: 'amber',  desc: 'Tenho de sobra' },
  trading:   { key: 'trade', label: 'Em troca', short: 'Em troca',  tw: 'violet', desc: 'Reservada numa proposta' },
};

// Classes Tailwind explícitas por status (strings literais p/ o purge enxergar).
// Não montar nomes de classe dinamicamente fora daqui.
export const STATUS_STYLE = {
  none: {
    card: 'bg-white/[0.06] border-white/15 text-white/45',
    dot: 'bg-white/30',
    chip: 'bg-white/10 text-white/60',
  },
  got: {
    card: 'bg-st-got/15 border-st-got/55 text-white',
    dot: 'bg-st-got',
    chip: 'bg-st-got/20 text-st-got',
  },
  duplicate: {
    card: 'bg-st-dup/15 border-st-dup/60 text-white',
    dot: 'bg-st-dup',
    chip: 'bg-st-dup/20 text-st-dup',
  },
  trading: {
    card: 'bg-st-trade/20 border-st-trade/60 text-white',
    dot: 'bg-st-trade',
    chip: 'bg-st-trade/25 text-st-trade',
  },
};
