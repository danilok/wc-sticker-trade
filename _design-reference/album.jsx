// album.jsx — Tela 3: Álbum / Inventário + modal de status
const { STATUS_META } = window.TROCAE;

// ---- modal de status (bottom sheet) ----
function StatusSheet({ sticker, current, onApply, onClose, toast }){
  const country = window.TROCAE.countryOf(sticker);
  const [status, setStatus] = React.useState(current.status==='none'?'got':current.status);
  const [qty, setQty] = React.useState(current.status==='duplicate' ? Math.max(2,current.qty) : 2);

  const pick = (s) => { setStatus(s); if(s==='duplicate' && qty<2) setQty(2); };

  const apply = () => {
    let q = 0;
    if(status==='got') q=1; else if(status==='trading') q=1; else if(status==='duplicate') q=Math.max(2,qty);
    onApply(status, q);
  };

  const confirmTrade = () => { onApply('got',1); toast('Troca concluída! '+sticker+' colado no álbum 🎉'); };

  const opts = [
    ['none','none'],['got','got'],['duplicate','duplicate'],['trading','trading'],
  ];

  return (
    <div className="scrim" onClick={onClose}>
      <div className="sheet" onClick={e=>e.stopPropagation()}>
        <div className="sheet-grip"/>
        <div className="sheet-head">
          <span className="sheet-flag">{country.flag}</span>
          <div>
            <div className="sheet-code">{sticker}</div>
            <div className="sheet-country">{country.name}</div>
          </div>
        </div>

        {current.status==='trading' && (
          <button className="confirm-trade" onClick={confirmTrade}>
            <Ic.Check size={18}/> Confirmar troca concluída
          </button>
        )}

        <div className="sheet-label">Status do cromo</div>
        <div className="opt-grid">
          {opts.map(([k,s]) => {
            const m = STATUS_META[s];
            return (
              <button key={k} className={'opt k-'+m.key+(status===s?' sel':'')} onClick={()=>pick(s)}>
                <span className="opt-dot" style={{background:m.color}}/>
                <span className="opt-t">{m.label}</span>
                <span className="opt-d">{m.desc}</span>
              </button>
            );
          })}
        </div>

        {status==='duplicate' && (
          <div className="stepper">
            <span className="st-lab">Quantas você tem?</span>
            <button className="step-btn" onClick={()=>setQty(q=>Math.max(2,q-1))} disabled={qty<=2}><Ic.Minus size={20}/></button>
            <span className="step-val">{qty}</span>
            <button className="step-btn" onClick={()=>setQty(q=>Math.min(20,q+1))}><Ic.Plus size={20}/></button>
          </div>
        )}

        <div className="sheet-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={apply}>Salvar</button>
        </div>
      </div>
    </div>
  );
}

// ---- card de cromo ----
function Cromo({ code, st, onClick }){
  const country = window.TROCAE.countryOf(code);
  const cls = st.status==='none'?'s-none':st.status==='got'?'s-got':st.status==='duplicate'?'s-dup':'s-trade';
  return (
    <button className={'cromo '+cls} onClick={onClick}>
      <span className="cr-flag">{country.flag}</span>
      <span className="cr-code">{code}</span>
      {st.status==='got' && <span className="cr-badge got"><Ic.Check size={12} stroke={3}/></span>}
      {st.status==='duplicate' && <span className="cr-qty">{st.qty}</span>}
      {st.status==='none' && <span className="cr-plus"><Ic.Plus size={13}/></span>}
      {st.status==='trading' && <span className="cr-ribbon">troca</span>}
    </button>
  );
}

// ---- tela ----
function AlbumScreen({ stickers, setStatus, openCountry, setOpenCountry, toast }){
  const { COUNTRIES, stickerCode } = window.TROCAE;
  const [sheet, setSheet] = React.useState(null); // código do cromo

  const filled = (codeArr) => codeArr.filter(c => stickers[c] && stickers[c].status!=='none').length;
  const codesOf = (c) => Array.from({length:c.n}, (_,i)=>stickerCode(c.code,i+1));
  const allCodes = COUNTRIES.flatMap(codesOf);
  const totalFilled = filled(allCodes);
  const totalAll = allCodes.length;
  const pct = Math.round(totalFilled/totalAll*100);

  const country = openCountry ? window.TROCAE.COUNTRY_BY_CODE[openCountry] : null;

  // ---------- subview: grade de uma seleção ----------
  if(country){
    const codes = codesOf(country);
    const got  = codes.filter(c=>stickers[c].status==='got').length;
    const dup  = codes.filter(c=>stickers[c].status==='duplicate').length;
    const trd  = codes.filter(c=>stickers[c].status==='trading').length;
    const have = codes.filter(c=>stickers[c].status!=='none').length;
    return (
      <>
        <header className="hdr">
          <div className="sub-top">
            <button className="back-btn" onClick={()=>setOpenCountry(null)}><Ic.Back size={20}/></button>
            <span className="sub-flag">{country.flag}</span>
            <div style={{flex:1}}>
              <div className="sub-name" style={{color:'var(--header-ink)'}}>{country.name}</div>
              <div className="sub-count" style={{color:'var(--header-sub)'}}>{have}/{country.n} cromos · {country.code}</div>
            </div>
          </div>
          <div className="hdr-prog" style={{marginTop:12}}>
            <div className="bar"><i style={{width:(have/country.n*100)+'%'}}/></div>
          </div>
        </header>
        <div className="body">
          <div className="pad">
            <div className="legend">
              <i><b style={{background:'var(--st-got)'}}/>Tenho {got}</i>
              <i><b style={{background:'var(--st-dup)'}}/>Repetidas {dup}</i>
              <i><b style={{background:'var(--st-trade)'}}/>Em troca {trd}</i>
              <i><b style={{background:'var(--st-none-ink)',opacity:.5}}/>Faltam {country.n-have}</i>
            </div>
            <div className="cromo-grid">
              {codes.map(code => (
                <Cromo key={code} code={code} st={stickers[code]} onClick={()=>setSheet(code)} />
              ))}
            </div>
          </div>
        </div>
        {sheet && (
          <StatusSheet sticker={sheet} current={stickers[sheet]} toast={toast}
            onClose={()=>setSheet(null)}
            onApply={(s,q)=>{ setStatus(sheet,s,q); setSheet(null); }} />
        )}
      </>
    );
  }

  // ---------- menu de seleções ----------
  return (
    <>
      <header className="hdr">
        <div className="hdr-row">
          <div className="hdr-titles">
            <div className="hdr-kicker">World Cup · Coleção</div>
            <div className="hdr-title">Meu Álbum</div>
          </div>
        </div>
        <div className="hdr-prog">
          <div className="hdr-prog-top">
            <span className="hdr-prog-pct">{pct}%</span>
            <span className="hdr-prog-count">{totalFilled} de {totalAll} cromos</span>
          </div>
          <div className="bar"><i style={{width:pct+'%'}}/></div>
        </div>
      </header>
      <div className="body">
        <div className="pad">
          <div className="sec-title">Seleções</div>
          <div className="sec-sub">Toque numa seleção pra abrir os cromos.</div>
          <div className="seq-grid">
            {COUNTRIES.map(c => {
              const codes = codesOf(c);
              const have = codes.filter(x=>stickers[x].status!=='none').length;
              const dups = codes.filter(x=>stickers[x].status==='duplicate').length;
              const done = have===c.n;
              return (
                <button key={c.code} className={'seq-card'+(done?' done':'')} onClick={()=>setOpenCountry(c.code)}>
                  <div className="seq-flag">{c.flag}</div>
                  <div className="seq-name">{c.name}</div>
                  <div className="seq-code">{c.code} · {c.n} cromos</div>
                  <div className="seq-foot">
                    <span className="seq-count">{have}/{c.n}</span>
                    <RingMini value={have/c.n}/>
                  </div>
                  {done && <span className="seq-badge-done"><Ic.Check size={13} stroke={3} style={{color:'#fff'}}/></span>}
                  {!done && dups>0 && <span className="seq-dupdot"><Ic.Swap size={11} stroke={2.6}/>{dups}</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

// anel de progresso compacto
function RingMini({ value }){
  const r=14, c=2*Math.PI*r, off=c*(1-value);
  return (
    <svg width="34" height="34" viewBox="0 0 34 34">
      <circle cx="17" cy="17" r={r} fill="none" stroke="var(--panel-line)" strokeWidth="4"/>
      <circle cx="17" cy="17" r={r} fill="none" stroke="var(--accent)" strokeWidth="4"
        strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" transform="rotate(-90 17 17)"/>
    </svg>
  );
}

window.AlbumScreen = AlbumScreen;
