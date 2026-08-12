-- 013_relax_rls_for_anon.sql
--
-- As policies de 011 exigiam `to authenticated` + role admin/librarian em profiles. Isso
-- pressupõe login — mas o frontend (spec.md §2: "v1 é single-user, sem login") nunca
-- autentica ninguém: toda chamada do app usa a anon key, ou seja, chega no Postgres como
-- role `anon`, sem `auth.uid()`. Com as policies de 011, isso barraria até leitura simples
-- (select) em todas as tabelas — o app carregaria listas vazias e falharia ao salvar,
-- mesmo com tudo corretamente configurado.
--
-- Solução consistente com a decisão de produto já tomada (sem login no V1): liberar o
-- role `anon` nas mesmas operações que hoje só a "equipe da biblioteca" (staff) tinha,
-- em vez de deixar o app quebrado. Isso é equivalente ao modelo de proteção que o MVP já
-- tinha em produção sobre localStorage (zero controle de acesso — segurança vem de não
-- divulgar a URL do app). RLS continua ATIVO nas 6 tabelas (não foi desligado); só as
-- policies passam a incluir `anon`.
--
-- Quando o projeto ganhar tela de login de verdade (roadmap V2, spec.md §9), a correção é
-- reverter isto: trocar as policies abaixo de volta pra exigir só `authenticated` +
-- `is_staff()`, sem tocar nas policies "select liberado pra autenticado" do catálogo.

-- ── authors / categories / books ──────────────────────────────────────────
drop policy if exists "authors_select_authenticated" on public.authors;
drop policy if exists "authors_write_staff" on public.authors;
create policy "authors_select_anon_or_authenticated" on public.authors for select to authenticated, anon using (true);
create policy "authors_write_anon_or_staff" on public.authors for all to authenticated, anon
  using (auth.role() = 'anon' or public.is_staff())
  with check (auth.role() = 'anon' or public.is_staff());

drop policy if exists "categories_select_authenticated" on public.categories;
drop policy if exists "categories_write_staff" on public.categories;
create policy "categories_select_anon_or_authenticated" on public.categories for select to authenticated, anon using (true);
create policy "categories_write_anon_or_staff" on public.categories for all to authenticated, anon
  using (auth.role() = 'anon' or public.is_staff())
  with check (auth.role() = 'anon' or public.is_staff());

drop policy if exists "books_select_authenticated" on public.books;
drop policy if exists "books_write_staff" on public.books;
create policy "books_select_anon_or_authenticated" on public.books for select to authenticated, anon using (true);
create policy "books_write_anon_or_staff" on public.books for all to authenticated, anon
  using (auth.role() = 'anon' or public.is_staff())
  with check (auth.role() = 'anon' or public.is_staff());

-- ── students ────────────────────────────────────────────────────────────────
drop policy if exists "students_all_staff" on public.students;
create policy "students_all_anon_or_staff" on public.students for all to authenticated, anon
  using (auth.role() = 'anon' or public.is_staff())
  with check (auth.role() = 'anon' or public.is_staff());

-- ── loans ───────────────────────────────────────────────────────────────────
drop policy if exists "loans_select_staff" on public.loans;
drop policy if exists "loans_insert_staff" on public.loans;
drop policy if exists "loans_update_staff" on public.loans;
drop policy if exists "loans_delete_admin" on public.loans;

create policy "loans_select_anon_or_staff" on public.loans for select to authenticated, anon
  using (auth.role() = 'anon' or public.is_staff());
create policy "loans_insert_anon_or_staff" on public.loans for insert to authenticated, anon
  with check (auth.role() = 'anon' or public.is_staff());
create policy "loans_update_anon_or_staff" on public.loans for update to authenticated, anon
  using (auth.role() = 'anon' or public.is_staff())
  with check (auth.role() = 'anon' or public.is_staff());
create policy "loans_delete_anon_or_admin" on public.loans for delete to authenticated, anon
  using (auth.role() = 'anon' or public.get_my_role() = 'admin');
