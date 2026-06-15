import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';
import { buildCatalog } from '../lib/catalog.js';

// Carrega o catálogo (sections + stickers) do banco UMA vez e o disponibiliza
// já no formato das telas. Leitura pública (RLS), então não depende de login.
const CatalogContext = createContext(null);

export function CatalogProvider({ children }) {
  const [catalog, setCatalog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [secRes, stkRes] = await Promise.all([
      supabase
        .from('sections')
        .select('code, name, flag, confed, wc_group, type, tradeable, position'),
      supabase.from('stickers').select('code, section_code, n, description'),
    ]);
    if (secRes.error || stkRes.error) {
      setError(secRes.error || stkRes.error);
      setLoading(false);
      return;
    }
    setCatalog(buildCatalog(secRes.data, stkRes.data));
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <CatalogContext.Provider value={{ catalog, loading, error, reload: load }}>
      {children}
    </CatalogContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error('useCatalog precisa estar dentro de <CatalogProvider>');
  return ctx;
}
