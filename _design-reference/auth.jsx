// auth.jsx — Tela 1: Login / Cadastro
function AuthScreen({ onLogin, onSignup }){
  const [mode, setMode] = React.useState('login'); // login | signup
  const [email, setEmail] = React.useState('');
  const [pass, setPass]   = React.useState('');
  const [show, setShow]   = React.useState(false);
  const [loading, setLoading] = React.useState(null); // null | 'email' | 'google'
  const [err, setErr] = React.useState('');

  const submit = () => {
    setErr('');
    if(!email.trim() || !/.+@.+\..+/.test(email)){ setErr('Informe um e-mail válido.'); return; }
    if(pass.length < 6){ setErr('A senha precisa de pelo menos 6 caracteres.'); return; }
    setLoading('email');
    // simula chamada ao Supabase Auth
    setTimeout(() => {
      setLoading(null);
      if(mode === 'signup') onSignup({ email });   // novo → onboarding
      else onLogin({ email });                      // existente → álbum
    }, 1100);
  };

  const google = () => {
    setErr(''); setLoading('google');
    setTimeout(() => { setLoading(null); onSignup({ email:'voce@gmail.com', google:true }); }, 1200);
  };

  return (
    <div className="auth">
      <div className="auth-inner">
        <div className="brand">
          <div className="logo"><Ic.Swap size={40} stroke={2.4} style={{color:'var(--accent-ink)'}}/></div>
          <div style={{textAlign:'center'}}>
            <div className="brand-name">Trocaê</div>
            <div className="brand-tag">Seu álbum da Copa, suas trocas — sem bagunça.</div>
          </div>
        </div>

        <div className="field">
          <label>E-mail</label>
          <div className="input-wrap">
            <span className="lead"><Ic.Mail size={18}/></span>
            <input className={'input has-lead'+(err && !/.+@.+\..+/.test(email)?' err':'')} type="email"
              inputMode="email" autoCapitalize="none" placeholder="voce@email.com"
              value={email} onChange={e=>setEmail(e.target.value)} />
          </div>
        </div>

        <div className="field">
          <label>Senha</label>
          <div className="input-wrap">
            <span className="lead"><Ic.Lock size={18}/></span>
            <input className="input has-lead" type={show?'text':'password'} placeholder="••••••••"
              value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==='Enter'&&submit()} />
            <button className="eye-btn" onClick={()=>setShow(s=>!s)} aria-label="mostrar senha">
              {show? <Ic.EyeOff size={20}/> : <Ic.Eye size={20}/>}
            </button>
          </div>
        </div>

        {err && <div className="err-msg"><Ic.Alert size={15}/> {err}</div>}

        <button className="cta" style={{marginTop:18}} onClick={submit} disabled={!!loading}>
          {loading==='email'
            ? <><span className="spinner" style={{width:20,height:20,borderWidth:3}}/> {mode==='login'?'Entrando…':'Criando conta…'}</>
            : (mode==='login' ? 'Entrar' : 'Criar conta')}
        </button>

        <div className="divider">ou</div>

        <button className="google-btn" onClick={google} disabled={!!loading}>
          {loading==='google' ? <span className="spinner" style={{width:18,height:18,borderWidth:3,borderTopColor:'#4285F4'}}/> : <Ic.Google/>}
          Entrar com o Google
        </button>

        <div className="switch-line">
          {mode==='login' ? 'Ainda não tem conta? ' : 'Já tem conta? '}
          <button onClick={()=>{setMode(m=>m==='login'?'signup':'login'); setErr('');}}>
            {mode==='login' ? 'Cadastre-se' : 'Entrar'}
          </button>
        </div>
      </div>
    </div>
  );
}
window.AuthScreen = AuthScreen;
