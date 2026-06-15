import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';

const AuthContext = createContext(null);

// perfil é "completo" (tem grupo configurado) quando há panini_group_id
export function profileIsComplete(profile) {
  return !!(profile && profile.panini_group_id);
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true); // carregando sessão+perfil inicial

  const fetchProfile = useCallback(async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (error) {
      console.error('Erro ao carregar perfil:', error.message);
      return null;
    }
    return data;
  }, []);

  // sessão inicial + assinatura de mudanças de auth
  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!active) return;
      setSession(session);
      if (session?.user) setProfile(await fetchProfile(session.user.id));
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!active) return;
      setSession(session);
      setProfile(session?.user ? await fetchProfile(session.user.id) : null);
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // ---- ações de auth (lançam erro p/ a tela tratar) ----
  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) throw error;
  }, []);

  const signInWithEmail = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signUpWithEmail = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data; // data.session é null quando exige confirmação de e-mail
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
  }, []);

  // salva/atualiza o perfil (onboarding) e reflete no estado
  const saveProfile = useCallback(
    async (fields) => {
      if (!session?.user) throw new Error('Sem sessão');
      // upsert (não update): cria a linha se o trigger handle_new_user não a
      // tiver criado (ex.: conta feita antes do schema). PK = id.
      const { data, error } = await supabase
        .from('profiles')
        .upsert({ id: session.user.id, ...fields }, { onConflict: 'id' })
        .select()
        .single();
      if (error) throw error;
      setProfile(data);
      return data;
    },
    [session]
  );

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    saveProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve estar dentro de AuthProvider');
  return ctx;
}
