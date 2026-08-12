
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.get_my_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.get_my_role() in ('admin', 'librarian'), false);
$$;

create or replace function public.register_loan(
  p_book_id uuid,
  p_student_id uuid,
  p_loan_days int default 7
)
returns public.loans
language plpgsql
security definer
set search_path = public
as $$
declare
  v_available int;
  v_active boolean;
  v_loan public.loans;
begin
  select available_copies into v_available from public.books where id = p_book_id for update;
  if v_available is null then
    raise exception 'Livro não encontrado.' using errcode = 'P0002';
  end if;
  if v_available <= 0 then
    raise exception 'Não há exemplares disponíveis para este livro.' using errcode = 'P0001';
  end if;

  select active into v_active from public.students where id = p_student_id;
  if v_active is null then
    raise exception 'Aluno não encontrado.' using errcode = 'P0002';
  end if;
  if not v_active then
    raise exception 'Aluno inativo não pode realizar empréstimos.' using errcode = 'P0001';
  end if;

  insert into public.loans (book_id, student_id, loan_date, due_date, status)
  values (p_book_id, p_student_id, current_date, current_date + p_loan_days, 'borrowed')
  returning * into v_loan;

  return v_loan;
end;
$$;

create or replace function public.return_loan(p_loan_id uuid)
returns public.loans
language plpgsql
security definer
set search_path = public
as $$
declare
  v_loan public.loans;
begin
  select * into v_loan from public.loans where id = p_loan_id for update;
  if v_loan is null then
    raise exception 'Empréstimo não encontrado.' using errcode = 'P0002';
  end if;
  if v_loan.return_date is not null then
    raise exception 'Este empréstimo já foi devolvido.' using errcode = 'P0001';
  end if;

  update public.loans
  set return_date = current_date, status = 'returned'
  where id = p_loan_id
  returning * into v_loan;

  return v_loan;
end;
$$;

create or replace function public.sync_overdue_loans()
returns void
language sql
as $$
  update public.loans
  set status = 'overdue'
  where return_date is null
    and due_date < current_date
    and status <> 'overdue';
$$;
