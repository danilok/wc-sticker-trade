import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';

// Carrega os cromos do usuário num mapa { [code]: { status, qty } } e
// expõe setStatus com update otimista + rollback em erro.
// status 'none' = ausência de linha no banco (delete).
export function useStickers(userId) {
  const [map, setMap] = useState({}); // só cromos possuídos
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('user_stickers')
      .select('sticker_code, status, quantity')
      .eq('user_id', userId);
    if (error) {
      setError(error);
    } else {
      const next = {};
      for (const r of data) next[r.sticker_code] = { status: r.status, qty: r.quantity };
      setMap(next);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  // helper de leitura: cromo sem registro = none
  const getStatus = useCallback(
    (code) => map[code] || { status: 'none', qty: 0 },
    [map]
  );

  const setStatus = useCallback(
    async (code, status, qty = 1) => {
      const prev = map[code]; // p/ rollback

      // update otimista
      setMap((m) => {
        const next = { ...m };
        if (status === 'none') delete next[code];
        else next[code] = { status, qty };
        return next;
      });

      try {
        if (status === 'none') {
          const { error } = await supabase
            .from('user_stickers')
            .delete()
            .eq('user_id', userId)
            .eq('sticker_code', code);
          if (error) throw error;
        } else {
          const { error } = await supabase.from('user_stickers').upsert(
            { user_id: userId, sticker_code: code, status, quantity: qty },
            { onConflict: 'user_id,sticker_code' }
          );
          if (error) throw error;
        }
        return true;
      } catch (err) {
        // rollback
        setMap((m) => {
          const next = { ...m };
          if (prev) next[code] = prev;
          else delete next[code];
          return next;
        });
        throw err;
      }
    },
    [map, userId]
  );

  return { map, getStatus, setStatus, loading, error, reload: load };
}
