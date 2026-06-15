// onboarding.jsx — Tela 2: Configuração de perfil e grupo
function OnboardingScreen({ defaultEmail, onSave }){
  const [username, setUsername] = React.useState('');
  const [groupId, setGroupId]   = React.useState('');
  const [groupName, setGroupName] = React.useState('');
  const [groupPass, setGroupPass] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [touched, setTouched] = React.useState(false);

  const cleanUser = username.replace(/[^a-z0-9_.]/gi,'').toLowerCase();
  const valid = cleanUser.length >= 3 && groupId.trim().length >= 3 && groupName.trim().length >= 2;

  const save = () => {
    setTouched(true);
    if(!valid) return;
    setSaving(true);
    setTimeout(() => { // simula UPDATE na tabela profiles
      setSaving(false);
      onSave({ username:cleanUser, groupId:groupId.trim(), groupName:groupName.trim(), groupPass:groupPass.trim() });
    }, 1100);
  };

  return (
    <div className="ob">
      <div className="ob-hero">
        <div className="ob-step">Passo único · Perfil</div>
        <div className="ob-h1">Configure seu grupo</div>
        <div className="ob-p">Pra encontrar trocas, diga seu apelido e em qual grupo de colecionadores você está.</div>
      </div>

      <div className="ob-body">
        <div className="field">
          <label>Nome de usuário</label>
          <div className="input-wrap">
            <span className="lead" style={{fontWeight:700,color:'var(--accent)'}}>@</span>
            <input className={'input has-lead'+(touched&&cleanUser.length<3?' err':'')} placeholder="seu_apelido"
              autoCapitalize="none" value={username} onChange={e=>setUsername(e.target.value)} />
          </div>
          {touched && cleanUser.length<3
            ? <div className="err-msg"><Ic.Alert size={14}/> Pelo menos 3 caracteres.</div>
            : <div className="hint">Vai aparecer como <b style={{color:'var(--accent)'}}>@{cleanUser||'seu_apelido'}</b> pro grupo.</div>}
        </div>

        <div className="field">
          <label>Código / ID do grupo</label>
          <div className="input-wrap">
            <span className="lead"><Ic.Layers size={18}/></span>
            <input className={'input has-lead'+(touched&&groupId.trim().length<3?' err':'')} placeholder="ex: PAN-7X2K9"
              autoCapitalize="characters" value={groupId} onChange={e=>setGroupId(e.target.value.toUpperCase())} />
          </div>
          {touched && groupId.trim().length<3 && <div className="err-msg"><Ic.Alert size={14}/> Informe o código do grupo.</div>}
        </div>

        <div className="field">
          <label>Nome do grupo</label>
          <input className={'input'+(touched&&groupName.trim().length<2?' err':'')} placeholder="ex: Galera do Bairro"
            value={groupName} onChange={e=>setGroupName(e.target.value)} />
        </div>

        <div className="field">
          <label>Senha do grupo <span style={{color:'var(--ink-faint)',fontWeight:500}}>(opcional)</span></label>
          <input className="input" placeholder="só pra consulta rápida"
            value={groupPass} onChange={e=>setGroupPass(e.target.value)} />
          <div className="hint">Guardada só pra você repassar a quem quiser entrar no grupo.</div>
        </div>

        <button className="cta" style={{marginTop:8}} onClick={save} disabled={saving}>
          {saving ? <><span className="spinner" style={{width:20,height:20,borderWidth:3}}/> Salvando…</>
                  : <>Salvar e ir pro álbum <Ic.Chevron size={20}/></>}
        </button>
      </div>
    </div>
  );
}
window.OnboardingScreen = OnboardingScreen;
