import { Outlet } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthProvider.jsx';
import { CatalogProvider, useCatalog } from '../context/CatalogProvider.jsx';
import { useStickers } from '../hooks/useStickers.js';
import { BottomNav } from './BottomNav.jsx';
import { Spinner } from './Spinner.jsx';

// Shell das telas autenticadas. Carrega o catálogo (uma vez, via provider) e os
// cromos do usuário, compartilhando o estado com as páginas (álbum, grupo,
// perfil consomem o mesmo). Catálogo vem por context; cromos pelo Outlet.
export function AppLayout() {
  return (
    <CatalogProvider>
      <AppShell />
    </CatalogProvider>
  );
}

function AppShell() {
  const { user } = useAuth();
  const stickers = useStickers(user.id);
  const { loading, error, reload } = useCatalog();

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-brand-accent">
        <Spinner size={36} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
        <AlertCircle size={28} className="text-red-400" />
        <div className="font-semibold">Erro ao carregar o catálogo</div>
        <p className="max-w-xs text-sm text-white/60">
          Verifique sua conexão e tente novamente.
        </p>
        <button className="btn-ghost mt-1" onClick={reload}>
          Tentar de novo
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-full max-w-app flex-col">
      <main className="flex-1 overflow-y-auto">
        <Outlet context={stickers} />
      </main>
      <BottomNav />
    </div>
  );
}
