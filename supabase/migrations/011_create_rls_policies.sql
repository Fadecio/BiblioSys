-- 011_create_rls_policies.sql
--
-- Papéis considerados (BD.md §6): admin e librarian ("funcionário da biblioteca") operam o
-- sistema; student é preparado para o futuro (auth de aluno), mas hoje o aluno é só um
-- registro em public.students, não um usuário logado — por isso as tabelas operacionais
-- (students, loans) não têm policy alguma para o role 'student': nenhuma linha fica visível
-- pra esse papel até o produto decidir dar autoatendimento ao aluno (ver docs/database.md).
--
-- Nenhuma policy usa `USING (true)`: cada uma expressa a regra de acesso real.

-- ── profiles ────────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;

create policy "profiles_select_own_or_staff"
  on public.profiles for select
  to authenticated
  using (id = auth.uid() or public.is_staff());

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- impede o próprio usuário de se autopromover a admin/librarian pela mesma policy de update
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

-- insert/delete de profiles não têm policy própria: a linha é criada só pelo trigger
-- on_auth_user_created (001), que roda como owner da tabela e não depende de RLS.

-- ── authors / categories / books ──────────────────────────────────────────
-- catálogo: leitura liberada pra qualquer usuário autenticado (não é dado sensível),
-- escrita restrita a quem administra o acervo.
alter table public.authors enable row level security;
alter table public.categories enable row level security;
alter table public.books enable row level security;

create policy "authors_select_authenticated" on public.authors for select to authenticated using (true);
create policy "authors_write_staff" on public.authors for all to authenticated using (public.is_staff()) with check (public.is_staff());

create policy "categories_select_authenticated" on public.categories for select to authenticated using (true);
create policy "categories_write_staff" on public.categories for all to authenticated using (public.is_staff()) with check (public.is_staff());

create policy "books_select_authenticated" on public.books for select to authenticated using (true);
create policy "books_write_staff" on public.books for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- ── students ────────────────────────────────────────────────────────────────
-- dado pessoal do aluno (nome, telefone, data de nascimento) — só a equipe da biblioteca
-- acessa. Sem policy para 'student' até existir vínculo aluno↔usuário autenticado.
alter table public.students enable row level security;

create policy "students_all_staff"
  on public.students for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- ── loans ───────────────────────────────────────────────────────────────────
-- histórico de empréstimo: equipe da biblioteca lê/cria/atualiza; exclusão só para admin
-- (correção pontual de erro de cadastro — o fluxo normal é sempre via devolução, não delete).
alter table public.loans enable row level security;

create policy "loans_select_staff" on public.loans for select to authenticated using (public.is_staff());
create policy "loans_insert_staff" on public.loans for insert to authenticated with check (public.is_staff());
create policy "loans_update_staff" on public.loans for update to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "loans_delete_admin" on public.loans for delete to authenticated using (public.get_my_role() = 'admin');
