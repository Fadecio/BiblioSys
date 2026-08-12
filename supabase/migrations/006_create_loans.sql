-- 006_create_loans.sql

create table if not exists public.loans (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books (id) on delete restrict on update cascade,
  student_id uuid not null references public.students (id) on delete restrict on update cascade,
  loan_date date not null default current_date,
  due_date date not null,
  return_date date,
  status text not null default 'borrowed' check (status in ('borrowed', 'returned', 'overdue')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint due_date_after_loan_date check (due_date >= loan_date),
  constraint return_date_after_loan_date check (return_date is null or return_date >= loan_date)
);

comment on table public.loans is 'Histórico de empréstimos/devoluções. status é mantido em sincronia por trigger, mas a fonte de verdade para "atrasado" é a view overdue_loans (return_date IS NULL AND due_date < CURRENT_DATE).';

-- book_id/student_id usam ON DELETE RESTRICT: um livro ou aluno com empréstimos no histórico
-- não pode ser excluído, para não perder o histórico (livro "desativar" em vez de apagar, se
-- necessário, é uma decisão de produto fora do escopo deste MVP).
