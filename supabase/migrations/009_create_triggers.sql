
drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists trg_books_updated_at on public.books;
create trigger trg_books_updated_at
  before update on public.books
  for each row execute function public.set_updated_at();

drop trigger if exists trg_students_updated_at on public.students;
create trigger trg_students_updated_at
  before update on public.students
  for each row execute function public.set_updated_at();

drop trigger if exists trg_loans_updated_at on public.loans;
create trigger trg_loans_updated_at
  before update on public.loans
  for each row execute function public.set_updated_at();

create or replace function public.trg_loans_validate_insert()
returns trigger
language plpgsql
as $$
declare
  v_available int;
  v_active boolean;
begin
  select available_copies into v_available from public.books where id = new.book_id;
  if v_available is null then
    raise exception 'Livro não encontrado.' using errcode = 'P0002';
  end if;
  if v_available <= 0 then
    raise exception 'Não há exemplares disponíveis para este livro.' using errcode = 'P0001';
  end if;

  select active into v_active from public.students where id = new.student_id;
  if v_active is null then
    raise exception 'Aluno não encontrado.' using errcode = 'P0002';
  end if;
  if not v_active then
    raise exception 'Aluno inativo não pode realizar empréstimos.' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_loans_before_insert on public.loans;
create trigger trg_loans_before_insert
  before insert on public.loans
  for each row execute function public.trg_loans_validate_insert();

create or replace function public.trg_loans_after_insert()
returns trigger
language plpgsql
as $$
begin
  update public.books set available_copies = available_copies - 1 where id = new.book_id;
  return new;
end;
$$;

drop trigger if exists trg_loans_after_insert on public.loans;
create trigger trg_loans_after_insert
  after insert on public.loans
  for each row execute function public.trg_loans_after_insert();

create or replace function public.trg_loans_before_update()
returns trigger
language plpgsql
as $$
begin
  if old.return_date is not null and new.return_date is distinct from old.return_date then
    raise exception 'Este empréstimo já foi devolvido.' using errcode = 'P0001';
  end if;

  if new.return_date is not null then
    new.status = 'returned';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_loans_before_update on public.loans;
create trigger trg_loans_before_update
  before update on public.loans
  for each row execute function public.trg_loans_before_update();

create or replace function public.trg_loans_after_update()
returns trigger
language plpgsql
as $$
begin
  if old.return_date is null and new.return_date is not null then
    update public.books set available_copies = available_copies + 1 where id = new.book_id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_loans_after_update on public.loans;
create trigger trg_loans_after_update
  after update on public.loans
  for each row execute function public.trg_loans_after_update();
