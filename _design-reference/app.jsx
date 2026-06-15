// app.jsx — root: roteamento, estado, tweaks, navegação
const { useState, useEffect, useRef } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "festa",
  "cromoCols": 4,
  "netError": false
}/*EDITMODE-END*/;

const THEME_LABEL = { festa:'Festa', clean:'Clean', estadio:'Estádio' };

function App(){
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [screen, setScreen] = useState('auth');   // auth | onboarding | app
  const [pendingEmail, setPendingEmail] = useState('');
  const [profile, setProfile] = useState(null);
  const [stickers, setStickers] = useState(() => window.TROCAE.buildInitialStickers());
  const [tab, setTab] = useState('album');         // album | group | profile
  const [openCountry, setOpenCountry] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const toastTimer = useRef(null);

  const toast = (msg) => {
    setToastMsg(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(()=>setToastMsg(null), 2400);
  };

  const setStatus = (code, status, qty) => {
    setStickers(s => ({ ...s, [code]: { status, qty } }));
    const m = window.TROCAE.STATUS_META[status];
    toast(code + ' → ' + m.label);
  };

  // login existente → álbum já configurado
  const onLogin = () => {
    setProfile({ username:'voce', groupName:'Galera do Bairro', groupId:'PAN-7X2K9', groupPass:'copa2026' });
    setTab('album'); setOpenCountry(null); setScreen('app');
  };
  const onSignup = ({ email }) => { setPendingEmail(email); setScreen('onboarding'); };
  const onSave = (p) => { setProfile(p); setTab('album'); setScreen('app'); };
  const onLogout = () => { setProfile(null); setScreen('auth'); };

  const openInAlbum = (code) => {
    setOpenCountry(code.split('-')[0]); setTab('album');
    toast('Abrindo ' + code + ' no seu álbum');
  };

  const statusDark = t.theme !== 'clean';

  let body;
  if(screen==='auth')        body = <AuthScreen onLogin={onLogin} onSignup={onSignup} />;
  else if(screen==='onboarding') body = <OnboardingScreen defaultEmail={pendingEmail} onSave={onSave} />;
  else if(tab==='album')     body = <AlbumScreen stickers={stickers} setStatus={setStatus} openCountry={openCountry} setOpenCountry={setOpenCountry} toast={toast} />;
  else if(tab==='group')     body = <GroupScreen profile={profile} stickers={stickers} simulateError={t.netError} openInAlbum={openInAlbum} toast={toast} />;
  else                       body = <ProfileScreen profile={profile} stickers={stickers} onLogout={onLogout} />;

  const navItems = [
    ['album','Álbum', Ic.Album],
    ['group','Grupo', Ic.Swap],
    ['profile','Perfil', Ic.User],
  ];

  return (
    <IOSDevice dark={statusDark}>
      <div className="app-root" data-theme={t.theme} style={{['--cromo-cols']:t.cromoCols}}>
        {body}

        {screen==='app' && (
          <nav className="nav">
            {navItems.map(([k,label,Icon]) => (
              <button key={k} className={'nav-item'+(tab===k?' active':'')}
                onClick={()=>{ setTab(k); if(k==='album') setOpenCountry(null); }}>
                <Icon size={24} stroke={tab===k?2.4:2}/>
                {label}
              </button>
            ))}
          </nav>
        )}

        {toastMsg && <div className="toast"><Ic.Check size={16} stroke={2.6} style={{color:'var(--accent)'}}/> {toastMsg}</div>}

        <TweaksPanel>
          <TweakSection label="Aparência" />
          <TweakRadio label="Tema" value={t.theme}
            options={[{value:'festa',label:'Festa'},{value:'clean',label:'Clean'},{value:'estadio',label:'Estádio'}]}
            onChange={(v)=>setTweak('theme', v)} />
          <TweakRadio label="Cromos por linha" value={t.cromoCols}
            options={[{value:3,label:'3'},{value:4,label:'4'},{value:5,label:'5'}]}
            onChange={(v)=>setTweak('cromoCols', v)} />
          <TweakSection label="Simulação" />
          <TweakToggle label="Simular erro de rede" value={t.netError}
            onChange={(v)=>setTweak('netError', v)} />
        </TweaksPanel>
      </div>
    </IOSDevice>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
