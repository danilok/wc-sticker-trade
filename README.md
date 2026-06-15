# Trocaê

MVP mobile-first para gerenciar e sinalizar trocas de figurinhas do álbum virtual da Copa 2026. Marque o status de cada cromo (tenho / repetida / em troca) e veja, no painel do grupo, quais repetidas os outros membros do mesmo grupo Panini têm — para pedir a troca no app oficial.

**Stack:** React + Vite + TailwindCSS + react-router · Supabase (Auth + PostgreSQL) · deploy Vercel.

## Rodar localmente

```bash
npm install
cp .env.example .env   # preencha com as chaves do seu projeto Supabase
npm run dev
```

`.env`:

```
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key
```

## Configurar o Supabase

1. **Banco:** abra o SQL Editor e rode [`supabase/schema.sql`](supabase/schema.sql). Cria as tabelas `profiles` e `user_stickers`, as policies de RLS, o trigger que cria o perfil no signup e a RPC `group_duplicates`.
2. **Login Google:** Authentication → Providers → Google → habilite e cole Client ID/Secret (criados no Google Cloud Console). Em Authentication → URL Configuration, adicione as redirect URLs: `http://localhost:5173` e o domínio da Vercel.
3. **E-mail/senha:** já vem habilitado. Para testar sem caixa de entrada, desative "Confirm email" em Authentication → Providers → Email.

## Deploy na Vercel

1. Importe o repositório (framework detectado: Vite; build `vite build`, output `dist`).
2. Em Settings → Environment Variables, defina `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
3. Após o primeiro deploy, adicione o domínio Vercel nas redirect URLs do Supabase (passo 2 acima). `vercel.json` já cuida do rewrite SPA.

## Arquitetura

Ver [`CLAUDE.md`](CLAUDE.md) para detalhes. Resumo:

- **`src/lib/catalog.js`** — seed do álbum (647 cromos: 48 seleções × 12 + 3 seções especiais). Fonte única; o banco guarda só o que cada usuário possui.
- **`src/context/`** — `AuthProvider` (sessão + perfil) e `ToastProvider`.
- **`src/hooks/useStickers.js`** — carrega/edita `user_stickers` com update otimista. `status='none'` = ausência de linha.
- **`src/pages/`** — 4 telas: `AuthPage`, `OnboardingPage`, `AlbumPage`/`SectionPage`, `GroupPage` (+ `ProfilePage`).

O protótipo de design original está em `_design-reference/` (`*.jsx`, `styles.css`, `Trocaê.html`) como referência visual — não faz parte do build.
