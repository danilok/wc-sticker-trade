# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**Trocaê** — MVP mobile-first para gerenciar e sinalizar trocas de figurinhas do álbum virtual da Copa 2026. O usuário marca o status de cada cromo (tenho / repetida / em troca) e vê, num painel de grupo, quais repetidas os outros membros do mesmo grupo Panini têm — para então pedir a troca no app oficial da Panini. Sem match automático nem chat: o app é só a camada de visibilidade.

## Estado atual do repositório

O repo está em transição de **protótipo de design** para **MVP real**:

- **Protótipo (legado, em `_design-reference/`):** `app.jsx`, `auth.jsx`, `album.jsx`, `group.jsx`, `profile.jsx`, `onboarding.jsx`, `data.jsx`, `icons.jsx`, `tweaks-panel.jsx`, `styles.css`, `Trocaê.html`, `frames/`. É React via CDN + Babel no navegador, rodando dentro de uma moldura iOS com painel de Tweaks. **Estado 100% simulado** (`setTimeout`, mocks). Serve como **referência visual/UX** ao reescrever em Tailwind — não faz parte do build final.
- **MVP novo (em construção, em `src/`):** o app real Vite + React + Tailwind + Supabase. Hoje contém só `src/lib/catalog.js` (o seed do álbum).

Ao portar telas, copie o visual/UX do protótipo correspondente, mas troque os mocks por chamadas reais ao Supabase.

## Decisões de arquitetura (já fechadas)

- **Build:** Vite + npm. **Deploy:** Vercel (env vars das chaves Supabase, output `dist`, rewrite SPA).
- **Estilo:** TailwindCSS. Portar os tokens de cor do `styles.css` legado para `tailwind.config.js` (verde "festa", accent, cores de status). Não reaproveitar o `styles.css` no build.
- **Roteamento:** `react-router` com URLs reais (`/login`, `/onboarding`, `/album`, `/album/:section`, `/grupo`, `/perfil`).
- **Backend:** Supabase (Auth + PostgreSQL + `@supabase/supabase-js`). Login Google (OAuth) + e-mail/senha.

## Modelo de dados (Supabase)

Quatro tabelas + uma RPC. Script em `supabase/schema.sql`; seed do catálogo em `supabase/seed.sql`.

Tabelas **por usuário** (RLS por dono):

- **`profiles`**: `id uuid pk → auth.users(id)`, `username`, `panini_group_id`, `panini_group_name`, `panini_group_password`. RLS: dono lê/edita só o próprio. Trigger `handle_new_user` cria a linha no signup.
- **`user_stickers`**: `id bigint identity pk`, `user_id uuid fk`, `sticker_code text`, `status text check in ('got','duplicate','trading')`, `quantity int`, `unique(user_id, sticker_code)`. RLS: dono faz CRUD só nos próprios.

Tabelas de **catálogo** (leitura pública via RLS `using (true)`; escrita só `service_role`):

- **`sections`**: `code text pk`, `name`, `flag`, `confed`, `wc_group`, `type check in ('team','special')`, `tradeable bool`, `position int unique`. A **ordem de exibição do álbum** vive em `position`.
- **`stickers`**: `code text pk` (`BRA-02`), `section_code text fk → sections(code)`, `n int`, `description text`, `unique(section_code, n)`. Dado mestre de cada cromo (nome do jogador / rótulo).

- **RPC `group_duplicates()`** `SECURITY DEFINER`: resolve a Tela 4 sem abrir leitura cruzada na RLS. Retorna `sticker_code, description, section_code, username, quantity` de **outros** usuários do **mesmo `panini_group_id`** com `status='duplicate'` (left join em `stickers` p/ o nome), ordenado por código.

**Regra de status:** `'none'` (não tenho registro) = **ausência de linha** em `user_stickers`. Marcar got/duplicate/trading faz upsert; voltar para `none` faz delete. O catálogo (`sections`+`stickers`) é leitura pública compartilhada; `user_stickers` guarda só o que cada usuário possui.

## O catálogo / seed

Fonte da verdade do álbum (51 seções, 647 cromos): os CSVs em **`data/`**, que geram o seed do banco.

- **`data/sections.csv`** e **`data/stickers.csv`** — dado editável à mão. Colunas batem com as tabelas `sections`/`stickers`.
- **`data/csv_to_seed.py`** — gera `supabase/seed.sql` (upsert idempotente por `code`) a partir dos CSVs. Rodar `python3 data/csv_to_seed.py` após editar.
- Ordem do álbum: WAP (pos 1) → 48 seleções nos grupos A–L da Copa (pos 2–49) → ATF (50) → FAN (51). Só WAP e seleções são `tradeable`.
- Código do cromo = `SECTION-NN` → `BRA-01`, `WAP-03`, `FAN-12`. Ordem global = `sections.position`, depois `stickers.n`.
- Pendências de dados: ordem de **FAN** assumida igual à dos 48 times (confirmar).
- **No client:** `CatalogProvider` (`src/context/CatalogProvider.jsx`) carrega `sections`+`stickers` do banco uma vez no boot e expõe via `useCatalog()` o catálogo já montado (`sections[]` com `.stickers`, `sectionByCode`, `sectionOf`, `allCodes`, `total`). `src/lib/catalog.js` virou só helpers puros (`stickerCode`, `sectionCodeOf`) + `buildCatalog(rows)`. `STATUS_META` (status → label + token Tailwind `slate`/`green`/`amber`/`violet`) mora em `src/lib/statusStyles.js`.

## Jornada do usuário (4 telas)

1. **Auth** — login/cadastro e-mail+senha + "Entrar com o Google" (Supabase Auth).
2. **Onboarding** — exibida no 1º login se o perfil não tem grupo. Salva `username` + dados do grupo Panini em `profiles`.
3. **Álbum** — abas/grade por seção; grid de cards compactos coloridos por status; tocar abre bottom-sheet para trocar status, ajustar quantidade de repetidas e confirmar troca concluída.
4. **Painel do Grupo** — cabeçalho com dados do grupo (nome/ID/senha p/ consulta); botão "Buscar repetidas do grupo" → `rpc('group_duplicates')`; lista scannável `[código] nome do cromo | @username | quantidade`.

## Comandos

> Scaffold Vite já criado (React + Tailwind + Supabase + react-router). `node` não está no PATH: usar nvm (`node 20.18.2`) + **pnpm**.

```bash
pnpm install
pnpm dev      # servidor de desenvolvimento Vite
pnpm build    # build de produção → dist/
pnpm preview  # serve o build localmente
```

Variáveis de ambiente (`.env`, nunca commitar): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.

Setup Supabase: rodar `supabase/schema.sql` e depois `supabase/seed.sql` no SQL editor; habilitar provider Google em Auth com as redirect URLs de `localhost` e do domínio Vercel.
