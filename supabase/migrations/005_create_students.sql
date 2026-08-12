
create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  registration_number text not null unique,
  email text,
  phone text,
  class text,
  birth_date date,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.students is 'Alunos da escola — são o dado gerenciado pelo sistema, não usuários autenticados no MVP.';
comment on column public.students.registration_number is 'Matrícula escolar, única por aluno.';
comment on column public.students.active is 'Aluno inativo (ex.: transferido/formado) não pode fazer novos empréstimos.';
