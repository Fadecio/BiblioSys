-- 001_create_profiles.sql
-- Perfil do usuário autenticado (Supabase Auth). Não duplica dados que já existem em
-- auth.users (email, senha, etc.) — guarda só o que é específico da aplicação.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text not null,
  role text not null default 'student' check (role in ('admin', 'librarian', 'student')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Perfil da aplicação para cada usuário autenticado via Supabase Auth.';
comment on column public.profiles.role is 'Nível de acesso: admin (controle total), librarian (opera o dia a dia da biblioteca), student (acesso restrito/futuro).';

-- cria automaticamente um profile quando um novo usuário se cadastra no Supabase Auth
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
