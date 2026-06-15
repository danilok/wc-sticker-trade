// group.jsx — Tela 4: Painel do Grupo (buscar repetidas do grupo)
function GroupScreen({ profile, stickers, simulateError, openInAlbum, toast }){
  const { GROUP_MEMBERS, countryOf, COUNTRIES } = window.TROCAE;
  const [phase, setPhase] = React.useState('idle'); // idle | loading | done | error | empty
  const [results, setResults] = React.useState([]);
  const [filter, setFilter] = React.useState('ALL');
  const [revealPass, setRevealPass] = React.useState(false);
  const errRef = React.useRef(simulateError);
  React.useEffect(()=>{ errRef.current = simulateError; }, [simulateError]);

  const search = () => {
    setPhase('loading');
    // simula query leve no Supabase: status='duplicate' de outros do mesmo panini_group_id
    setTimeout(() => {
      if(errRef.current){ setPhase('error'); return; }
      const rows = [];
      GROUP_MEMBERS.forEach(m => {
        Object.entries(m.dups).forEach(([code,qty]) => rows.push({ code, user:m.user, qty }));
      });
      rows.sort((a,b)=> a.code.localeCompare(b.code));
      setResults(rows);
      setPhase(rows.length ? 'done' : 'empty');
    }, 1300);
  };

  const countriesPresent = React.useMemo(()=>{
    const set = new Set(results.map(r=>r.code.split('-')[0]));
    return COUNTRIES.filter(c=>set.has(c.code));
  }, [results]);

  const shown = filter==='ALL' ? results : results.filter(r=>r.code.startsWith(filter));
  const copy = (txt,label) => { try{navigator.clipboard&&navigator.clipboard.writeText(txt);}catch(e){} toast(label+' copiado'); };

  return (
    <>
      <header className="hdr">
        <div className="hdr-row">
          <div className="hdr-titles">
            <div className="hdr-kicker">Painel do grupo</div>
            <div className="hdr-title">Trocas do Grupo</div>
          </div>
        </div>
      </header>
      <div className="body">
        <div className="pad">

          <div className="group-card">
            <div className="gc-name">{profile.groupName}</div>
            <div className="group-members"><Ic.User size={14}/> {GROUP_MEMBERS.length+1} colecionadores no grupo</div>
            <div className="gc-meta">
              <div className="cred">
                <div className="cl">Código do grupo</div>
                <div className="cv">{profile.groupId}
                  <button className="copy-btn" onClick={()=>copy(profile.groupId,'Código')}><Ic.Copy size={16}/></button>
                </div>
              </div>
              {profile.groupPass ? (
                <div className="cred">
                  <div className="cl">Senha</div>
                  <div className="cv">
                    {revealPass ? profile.groupPass : '••••••'}
                    <button className="copy-btn" onClick={()=>setRevealPass(v=>!v)}>{revealPass?<Ic.EyeOff size={16}/>:<Ic.Eye size={16}/>}</button>
                    <button className="copy-btn" onClick={()=>copy(profile.groupPass,'Senha')}><Ic.Copy size={16}/></button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <button className="search-cta" onClick={search} disabled={phase==='loading'}>
            {phase==='loading' ? <><span className="spinner" style={{width:20,height:20,borderWidth:3}}/> Buscando…</>
              : <><Ic.Search size={20} stroke={2.4}/> Buscar repetidas do grupo</>}
          </button>

          {phase==='idle' && (
            <div className="state-box">
              <div className="si"><Ic.Sparkle size={26}/></div>
              <div className="st">Veja quem tem o que você precisa</div>
              <div className="sp">A busca mostra as repetidas dos outros colecionadores do seu grupo. É só pedir a troca no app oficial.</div>
            </div>
          )}

          {phase==='loading' && (
            <div className="match-list" style={{marginTop:16}}>
              {Array.from({length:6}).map((_,i)=><div key={i} className="skel"/>)}
            </div>
          )}

          {phase==='error' && (
            <div className="state-box">
              <div className="si" style={{color:'#ef4444'}}><Ic.Alert size={26}/></div>
              <div className="st">Não rolou a busca</div>
              <div className="sp">Falha ao conectar com o servidor. Verifique sua conexão e tente de novo.</div>
              <button className="retry-btn" onClick={search}>Tentar de novo</button>
            </div>
          )}

          {phase==='empty' && (
            <div className="state-box">
              <div className="si"><Ic.Inbox size={26}/></div>
              <div className="st">Nenhuma repetida agora</div>
              <div className="sp">Ninguém do grupo tem repetidas no momento. Volte mais tarde!</div>
            </div>
          )}

          {phase==='done' && (
            <>
              <div className="filter-row">
                <button className={'chip'+(filter==='ALL'?' active':'')} onClick={()=>setFilter('ALL')}>Tudo ({results.length})</button>
                {countriesPresent.map(c=>(
                  <button key={c.code} className={'chip'+(filter===c.code?' active':'')} onClick={()=>setFilter(c.code)}>{c.flag} {c.code}</button>
                ))}
              </div>
              <div className="sec-sub" style={{margin:'4px 2px 10px'}}>Ordenado por código · toque pra ver no seu álbum</div>
              <div className="match-list">
                {shown.map((r,i)=>{
                  const c = countryOf(r.code);
                  const mine = stickers[r.code];
                  const need = mine && mine.status==='none';
                  return (
                    <div key={i} className="match" onClick={()=>openInAlbum(r.code)} style={{cursor:'pointer'}}>
                      <span className="match-flag">{c.flag}</span>
                      <span className="match-code">{r.code}</span>
                      <div className="match-mid">
                        <div className="match-user">@{r.user}</div>
                        <div className="match-country">{c.name}{need && ' · você precisa!'}</div>
                      </div>
                      {need && <span style={{color:'var(--st-got)',marginRight:2}}><Ic.Sparkle size={16}/></span>}
                      <div className="match-qty"><b>{r.qty}</b><span>repet.</span></div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

        </div>
      </div>
    </>
  );
}
window.GroupScreen = GroupScreen;
