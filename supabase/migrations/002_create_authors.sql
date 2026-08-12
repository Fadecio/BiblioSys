
create table if not exists public.authors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  biography text,
  created_at timestamptz not null default now()
);

comment on table public.authors is 'Autores dos livros do acervo.';
