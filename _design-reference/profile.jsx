// profile.jsx — Perfil + info do grupo + sair
function ProfileScreen({ profile, stickers, onLogout }){
  const { COUNTRIES, stickerCode } = window.TROCAE;
  const allCodes = COUNTRIES.flatMap(c=>Array.from({length:c.n},(_,i)=>stickerCode(c.code,i+1)));
  const got   = allCodes.filter(c=>stickers[c].status!=='none').length;
  const dups  = allCodes.filter(c=>stickers[c].status==='duplicate').length;
  const trade = allCodes.filter(c=>stickers[c].status==='trading').length;
  const initials = (profile.username||'eu').slice(0,2).toUpperCase();

  return (
    <>
      <header className="hdr">
        <div className="hdr-row">
          <div className="hdr-titles">
            <div className="hdr-kicker">Sua conta</div>
            <div className="hdr-title">Perfil</div>
          </div>
        </div>
      </header>
      <div className="body">
        <div className="pad">
          <div className="prof-top">
            <div className="avatar">{initials}</div>
            <div>
              <div className="prof-name">@{profile.username}</div>
              <div className="prof-user">{profile.groupName}</div>
            </div>
          </div>

          <div className="stat-row">
            <div className="stat"><b style={{color:'var(--st-got)'}}>{got}</b><span>Colados</span></div>
            <div className="stat"><b style={{color:'var(--st-dup)'}}>{dups}</b><span>Repetidas</span></div>
            <div className="stat"><b style={{color:'var(--st-trade)'}}>{trade}</b><span>Em troca</span></div>
          </div>

          <div className="sec-title" style={{marginTop:6}}>Meu grupo</div>
          <div className="row-btn"><Ic.Layers size={20}/> Código <b style={{marginLeft:'auto',marginRight:0,fontFamily:'var(--disp)'}}>{profile.groupId}</b></div>
          {profile.groupPass && <div className="row-btn"><Ic.Lock size={20}/> Senha <b style={{marginLeft:'auto',fontFamily:'var(--disp)'}}>{profile.groupPass}</b></div>}

          <div className="sec-title" style={{marginTop:18}}>Ajustes</div>
          <button className="row-btn"><Ic.Bell size={20}/> Notificações de troca <span className="ra"><Ic.Chevron size={18}/></span></button>
          <button className="row-btn"><Ic.Palette size={20}/> Tema do app <span className="ra" style={{fontSize:12,color:'var(--ink-faint)'}}>nos Tweaks ↗</span></button>
          <button className="row-btn" style={{color:'#ef4444'}} onClick={onLogout}><Ic.Logout size={20}/> Sair da conta</button>

          <div style={{textAlign:'center',color:'var(--ink-faint)',fontSize:12,marginTop:22}}>Trocaê · protótipo · v0.1</div>
        </div>
      </div>
    </>
  );
}
window.ProfileScreen = ProfileScreen;
