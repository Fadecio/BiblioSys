
create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  isbn text unique,
  description text,
  cover_url text,
  publisher text,
  publication_year int check (
    publication_year between 1400 and extract(year from now())::int + 1
  ),
  total_copies int not null default 1 check (total_copies >= 0),
  available_copies int not null default 1 check (
    available_copies >= 0 and available_copies <= total_copies
  ),
  author_id uuid references public.authors (id) on delete set null on update cascade,
  category_id uuid references public.categories (id) on delete set null on update cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.books is 'Títulos do acervo. total_copies = exemplares fisicamente existentes; available_copies = exemplares livres para empréstimo.';
comment on column public.books.available_copies is 'Nunca pode ficar negativo nem ultrapassar total_copies (garantido por CHECK e pelos triggers de empréstimo/devolução).';
