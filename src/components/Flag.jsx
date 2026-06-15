// Renderiza a bandeira de um país como SVG (flag-icons), a partir do emoji de
// bandeira que já vem no catálogo. Resolve o problema de SO/fonte que não exibe
// emoji de bandeira (Windows mostra "BR" em vez de 🇧🇷).
//
// Emoji de bandeira regional (🇧🇷) = par de indicadores regionais = código ISO.
// Inglaterra/Escócia usam tag sequence (🏴 + tags) → gb-eng / gb-sct.
// Emojis que não são bandeira (✨/💛/🎉 das seções especiais) → fallback: o emoji.

function flagCode(emoji) {
  if (!emoji) return null;
  const cps = [...emoji].map((c) => c.codePointAt(0));

  // par de indicadores regionais (U+1F1E6..U+1F1FF) → ISO 3166-1 alpha-2
  const ri = cps.filter((cp) => cp >= 0x1f1e6 && cp <= 0x1f1ff);
  if (ri.length === 2) {
    return ri.map((cp) => String.fromCharCode(cp - 0x1f1e6 + 97)).join('');
  }

  // tag sequence (🏴 + tags U+E0061..U+E007A) → ex.: "gbeng" → "gb-eng"
  if (cps[0] === 0x1f3f4) {
    const tags = cps
      .filter((cp) => cp >= 0xe0061 && cp <= 0xe007a)
      .map((cp) => String.fromCharCode(cp - 0xe0000))
      .join('');
    if (tags.startsWith('gb') && tags.length > 2) return `gb-${tags.slice(2)}`;
    if (tags) return tags;
  }

  return null;
}

export function Flag({ emoji, className = '' }) {
  const code = flagCode(emoji);
  if (!code) return <span className={className}>{emoji}</span>;
  return (
    <span
      className={`fi fi-${code} rounded-[3px] shadow-sm ${className}`}
      role="img"
      aria-label="bandeira"
    />
  );
}
