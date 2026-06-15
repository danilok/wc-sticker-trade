-- ============================================================================
-- Trocaê — schema Supabase (rodar no SQL Editor do projeto)
-- Tabelas: profiles, user_stickers | RLS por dono | RPC group_duplicates
-- ============================================================================

-- ---------------------------------------------------------------------------
-- profiles: 1 linha por usuário (id = auth.users.id)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id                     uuid primary key references auth.users (id) on delete cascade,
  username               text,
  panini_group_id        text,
  panini_group_name      text,
  panini_group_password  text,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

-- índice p/ a busca por grupo (RPC group_duplicates)
create index if not exists profiles_group_idx on public.profiles (panini_group_id);

-- ---------------------------------------------------------------------------
-- user_stickers: cromos que o usuário possui (status 'none' = SEM linha)
-- ---------------------------------------------------------------------------
create table if not exists public.user_stickers (
  id           bigint generated always as identity primary key,
  user_id      uuid not null references auth.users (id) on delete cascade,
  sticker_code text not null,
  status       text not null check (status in ('got', 'duplicate', 'trading')),
  quantity     integer not null default 1 check (quantity >= 1),
  updated_at   timestamptz not null default now(),
  unique (user_id, sticker_code)
);

create index if not exists user_stickers_user_idx on public.user_stickers (user_id);
-- acelera a RPC: filtra repetidas e ordena por código
create index if not exists user_stickers_dup_idx
  on public.user_stickers (sticker_code)
  where status = 'duplicate';

-- ---------------------------------------------------------------------------
-- trigger: cria profile vazio no signup
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- updated_at automático
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

drop trigger if exists user_stickers_touch on public.user_stickers;
create trigger user_stickers_touch before update on public.user_stickers
  for each row execute function public.touch_updated_at();

-- ============================================================================
-- RLS — cada usuário só enxerga/edita o que é seu
-- ============================================================================
alter table public.profiles      enable row level security;
alter table public.user_stickers enable row level security;

-- profiles: dono lê/insere/atualiza o próprio
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select using (auth.uid() = id);

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- user_stickers: dono faz CRUD só nos próprios
drop policy if exists stickers_select_own on public.user_stickers;
create policy stickers_select_own on public.user_stickers
  for select using (auth.uid() = user_id);

drop policy if exists stickers_insert_own on public.user_stickers;
create policy stickers_insert_own on public.user_stickers
  for insert with check (auth.uid() = user_id);

drop policy if exists stickers_update_own on public.user_stickers;
create policy stickers_update_own on public.user_stickers
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists stickers_delete_own on public.user_stickers;
create policy stickers_delete_own on public.user_stickers
  for delete using (auth.uid() = user_id);

-- ============================================================================
-- CATÁLOGO — sections + stickers (dado mestre da coleção, 647 cromos)
-- Conteúdo público (não é segredo). Popular com supabase/seed.sql.
-- Criado ANTES da RPC group_duplicates, que faz join em stickers.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- sections: cada aba/grade do álbum. A ordem de exibição vive em `position`.
-- ---------------------------------------------------------------------------
create table if not exists public.sections (
  code       text primary key,                 -- WAP, BRA, FAN ...
  name       text not null,
  flag       text,                             -- emoji bandeira (null em especiais)
  confed     text,                             -- só seleções (CONMEBOL, UEFA ...)
  wc_group   text,                             -- grupo da Copa A..L (null em especiais)
  type       text not null check (type in ('team', 'special')),
  tradeable  boolean not null default true,    -- ATF/FAN = false
  position   integer not null unique           -- ordem global do álbum
);

-- ---------------------------------------------------------------------------
-- stickers: dado mestre de cada cromo. Ordem dentro da seção = `n`.
-- ---------------------------------------------------------------------------
create table if not exists public.stickers (
  code         text primary key,               -- BRA-02, WAP-03, FAN-12
  section_code text not null references public.sections (code) on delete cascade,
  n            integer not null,               -- posição dentro da seção (1 = escudo)
  description  text not null,                  -- nome do jogador / rótulo do cromo
  unique (section_code, n)
);

create index if not exists stickers_section_idx on public.stickers (section_code);

-- ---------------------------------------------------------------------------
-- RLS: catálogo é leitura pública (anon + autenticados); escrita só service_role
-- ---------------------------------------------------------------------------
alter table public.sections enable row level security;
alter table public.stickers enable row level security;

drop policy if exists sections_read_all on public.sections;
create policy sections_read_all on public.sections
  for select using (true);

drop policy if exists stickers_read_all on public.stickers;
create policy stickers_read_all on public.stickers
  for select using (true);

-- ============================================================================
-- RPC group_duplicates — Tela 4 (Painel do Grupo)
-- Retorna repetidas de OUTROS membros do mesmo panini_group_id.
-- SECURITY DEFINER: faz o join cruzado sem precisar afrouxar a RLS de leitura.
-- ============================================================================
create or replace function public.group_duplicates()
returns table (
  sticker_code text,
  description  text,
  section_code text,
  username     text,
  quantity     integer
)
language sql
security definer
set search_path = public
as $$
  select us.sticker_code, s.description, s.section_code, p.username, us.quantity
  from public.user_stickers us
  join public.profiles p on p.id = us.user_id
  left join public.stickers s on s.code = us.sticker_code
  where us.status = 'duplicate'
    and us.user_id <> auth.uid()
    and p.panini_group_id is not null
    and p.panini_group_id = (
      select panini_group_id from public.profiles where id = auth.uid()
    )
  order by us.sticker_code;
$$;

-- só usuários autenticados podem chamar
revoke all on function public.group_duplicates() from public;
grant execute on function public.group_duplicates() to authenticated;
