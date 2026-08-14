-- 014_add_update_loan_date_function.sql
--
-- Permite corrigir a data de empréstimo (loan_date) depois de já registrado — ex.: o
-- bibliotecário esqueceu de lançar no dia certo e cadastrou depois. due_date é sempre
-- recalculado a partir da nova loan_date (mesma regra de 7 dias corridos usada em
-- register_loan, 008_create_functions.sql), nunca ajustado manualmente à parte.

create or replace function public.update_loan_date(
  p_loan_id uuid,
  p_loan_date date,
  p_loan_days int default 7
)
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

  update public.loans
  set loan_date = p_loan_date, due_date = p_loan_date + p_loan_days
  where id = p_loan_id
  returning * into v_loan;

  return v_loan;
end;
$$;
