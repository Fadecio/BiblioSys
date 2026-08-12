
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default now()
);

comment on table public.categories is 'Categorias/gêneros dos livros (ex.: Romance, Infantojuvenil, Didático).';
