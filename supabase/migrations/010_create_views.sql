-- 010_create_views.sql
-- "Atrasado" nunca é lido de loans.status (que é só uma cópia sincronizada por conveniência,
-- ver sync_overdue_loans em 008) — as views abaixo recalculam a partir de return_date/due_date,
-- que são a fonte de verdade real (BD.md §3).

create or replace view public.overdue_loans as
select
  l.id,
  l.book_id,
  b.title as book_title,
  l.student_id,
  s.name as student_name,
  l.loan_date,
  l.due_date,
  current_date - l.due_date as days_overdue
from public.loans l
join public.books b on b.id = l.book_id
join public.students s on s.id = l.student_id
where l.return_date is null
  and l.due_date < current_date;

comment on view public.overdue_loans is 'Somente empréstimos em atraso (não devolvidos e com due_date vencida).';

create or replace view public.active_loans as
select
  l.id,
  l.book_id,
  b.title as book_title,
  l.student_id,
  s.name as student_name,
  l.loan_date,
  l.due_date,
  case when l.due_date < current_date then 'overdue' else 'borrowed' end as status
from public.loans l
join public.books b on b.id = l.book_id
join public.students s on s.id = l.student_id
where l.return_date is null;

comment on view public.active_loans is 'Empréstimos ainda não devolvidos, com status recalculado (borrowed/overdue).';

create or replace view public.dashboard_stats as
select
  (select count(*) from public.books) as total_books,
  (select coalesce(sum(total_copies), 0) from public.books) as total_copies,
  (select coalesce(sum(available_copies), 0) from public.books) as available_copies,
  (select count(*) from public.students where active) as total_students,
  (select count(*) from public.loans where return_date is null) as active_loans,
  (select count(*) from public.loans where return_date is null and due_date < current_date) as overdue_loans,
  (select count(*) from public.loans where return_date is not null) as returned_loans;

comment on view public.dashboard_stats is 'Uma linha só, com os contadores usados nos cards do dashboard.';
