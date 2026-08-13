
alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own_or_staff" on public.profiles;
create policy "profiles_select_own_or_staff"
  on public.profiles for select
  to authenticated
  using (id = auth.uid() or public.is_staff());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create or replace function public.trg_profiles_protect_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and public.get_my_role() <> 'admin' then
    raise exception 'Somente admin pode alterar o papel (role) de um usuário.' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_profiles_protect_role on public.profiles;
create trigger trg_profiles_protect_role
  before update on public.profiles
  for each row execute function public.trg_profiles_protect_role();

alter table public.authors enable row level security;
alter table public.categories enable row level security;
alter table public.books enable row level security;

drop policy if exists "authors_select_authenticated" on public.authors;
create policy "authors_select_authenticated" on public.authors for select to authenticated using (true);
drop policy if exists "authors_write_staff" on public.authors;
create policy "authors_write_staff" on public.authors for all to authenticated using (public.is_staff()) with check (public.is_staff());

drop policy if exists "categories_select_authenticated" on public.categories;
create policy "categories_select_authenticated" on public.categories for select to authenticated using (true);
drop policy if exists "categories_write_staff" on public.categories;
create policy "categories_write_staff" on public.categories for all to authenticated using (public.is_staff()) with check (public.is_staff());

drop policy if exists "books_select_authenticated" on public.books;
create policy "books_select_authenticated" on public.books for select to authenticated using (true);
drop policy if exists "books_write_staff" on public.books;
create policy "books_write_staff" on public.books for all to authenticated using (public.is_staff()) with check (public.is_staff());

alter table public.students enable row level security;

drop policy if exists "students_all_staff" on public.students;
create policy "students_all_staff"
  on public.students for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

alter table public.loans enable row level security;

drop policy if exists "loans_select_staff" on public.loans;
create policy "loans_select_staff" on public.loans for select to authenticated using (public.is_staff());
drop policy if exists "loans_insert_staff" on public.loans;
create policy "loans_insert_staff" on public.loans for insert to authenticated with check (public.is_staff());
drop policy if exists "loans_update_staff" on public.loans;
create policy "loans_update_staff" on public.loans for update to authenticated using (public.is_staff()) with check (public.is_staff());
drop policy if exists "loans_delete_admin" on public.loans;
create policy "loans_delete_admin" on public.loans for delete to authenticated using (public.get_my_role() = 'admin');
