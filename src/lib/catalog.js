// catalog.js — helpers de código + montagem do catálogo a partir do banco.
//
// O catálogo (seções + cromos) vive nas tabelas `sections`/`stickers` do
// Supabase e é carregado no boot pelo CatalogProvider. Aqui só ficam helpers
// puros de código e a função que transforma as linhas do banco no formato que
// as telas consomem (a mesma forma do antigo seed estático: SECTIONS[] com
// `.stickers`, `sectionOf`, `allCodes`, `total`).

export const pad2 = (n) => String(n).padStart(2, '0');

// código do cromo: BRA-01, WAP-03, FAN-12
export function stickerCode(sectionCode, n) {
  return `${sectionCode}-${pad2(n)}`;
}

// prefixo de seção a partir de um código de cromo (BRA-01 → BRA)
export function sectionCodeOf(code) {
  return code.split('-')[0];
}

// Monta o catálogo no formato das telas a partir das linhas do banco.
//   sectionsRows: { code, name, flag, confed, wc_group, type, tradeable, position }
//   stickersRows: { code, section_code, n, description }
export function buildCatalog(sectionsRows, stickersRows) {
  // mapa nome da seção → bandeira (p/ dar a bandeira do país aos Fan Stickers,
  // cuja `description` é o nome de um país)
  const flagByName = new Map(sectionsRows.map((s) => [s.name, s.flag]));

  const bySection = new Map();
  for (const st of stickersRows) {
    if (!bySection.has(st.section_code)) bySection.set(st.section_code, []);
    bySection.get(st.section_code).push(st);
  }

  const sections = [...sectionsRows]
    .sort((a, b) => a.position - b.position)
    .map((s) => {
      const stickers = (bySection.get(s.code) || [])
        .slice()
        .sort((a, b) => a.n - b.n)
        .map((r) => ({
          n: r.n,
          code: r.code,
          label: r.description,
          flag: flagByName.get(r.description) || s.flag,
        }));
      return {
        code: s.code,
        name: s.name,
        flag: s.flag,
        confed: s.confed,
        wcGroup: s.wc_group,
        type: s.type,
        tradeable: s.tradeable,
        position: s.position,
        count: stickers.length,
        stickers,
      };
    });

  const sectionByCode = Object.fromEntries(sections.map((s) => [s.code, s]));
  const allCodes = sections.flatMap((s) => s.stickers.map((st) => st.code));

  return {
    sections,
    sectionByCode,
    sectionOf: (code) => sectionByCode[sectionCodeOf(code)],
    allCodes,
    total: allCodes.length,
  };
}
