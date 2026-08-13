-- ============================================================================
-- Fadecio BiblioSys — consolidação do schema PT (livros/alunos/emprestimos)
-- no schema EN (books/students/loans) usado pela aplicação.
--
-- Contexto do problema:
--   1. O banco tinha dois modelos paralelos. Os dados estavam nas tabelas em
--      português; a aplicação (e as views active_loans, overdue_loans e
--      dashboard_stats) lê as tabelas em inglês, que estavam vazias.
--   2. As tabelas em português estavam com RLS habilitado e ZERO políticas,
--      o que faz o Postgres negar todo SELECT vindo das chaves anon/authenticated.
--      O Table Editor exibia as linhas porque usa a role `postgres`, que ignora RLS.
--
-- Executado em: 2026-08-13 · projeto dukxyivrgqqdnnbunqvy
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Backup antes de qualquer escrita
-- ---------------------------------------------------------------------------
create schema if not exists backup;

create table if not exists backup.livros_snapshot      as select * from public.livros;
create table if not exists backup.alunos_snapshot      as select * from public.alunos;
create table if not exists backup.emprestimos_snapshot as select * from public.emprestimos;

-- ---------------------------------------------------------------------------
-- 2. Normalizar autores e categorias (eram campos texto em `livros`)
--    O group by lower(btrim(...)) evita duplicar "Jorge Amado" e "jorge amado".
-- ---------------------------------------------------------------------------
insert into public.authors (name)
select s.nome
from (
    select min(btrim(l.autor)) as nome
    from public.livros l
    where btrim(coalesce(l.autor, '')) <> ''
    group by lower(btrim(l.autor))
) s
where not exists (
    select 1 from public.authors a where lower(a.name) = lower(s.nome)
);

insert into public.categories (name)
select s.nome
from (
    select min(btrim(l.categoria)) as nome
    from public.livros l
    where btrim(coalesce(l.categoria, '')) <> ''
    group by lower(btrim(l.categoria))
) s
where not exists (
    select 1 from public.categories c where lower(c.name) = lower(s.nome)
);

-- ---------------------------------------------------------------------------
-- 3. livros -> books (preservando os UUIDs originais, para não quebrar
--    as referências de emprestimos.livro_id)
--    greatest/least respeitam o CHECK (available_copies between 0 and total_copies).
-- ---------------------------------------------------------------------------
insert into public.books (
    id, title, code, total_copies, available_copies, author_id, category_id
)
select
    l.id,
    coalesce(nullif(btrim(l.titulo), ''), 'Sem titulo'),
    nullif(btrim(coalesce(l.codigo, '')), ''),
    greatest(coalesce(l.quantidade_total, 1), 0),
    greatest(
        least(
            coalesce(l.quantidade_disponivel, l.quantidade_total, 1),
            greatest(coalesce(l.quantidade_total, 1), 0)
        ),
        0
    ),
    a.id,
    c.id
from public.livros l
left join public.authors    a on lower(a.name) = lower(btrim(l.autor))
left join public.categories c on lower(c.name) = lower(btrim(l.categoria))
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- 4. alunos -> students
--    students.registration_number é NOT NULL e não existe origem em `alunos`,
--    então gera-se uma matrícula determinística a partir do UUID.
-- ---------------------------------------------------------------------------
insert into public.students (
    id, name, registration_number, class, grade, active, created_at, updated_at
)
select
    a.id,
    a.nome,
    'MIG-' || upper(substr(replace(a.id::text, '-', ''), 1, 8)),
    a.turma,
    a.serie,
    true,
    coalesce(a.criado_em, now()),
    now()
from public.alunos a
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- 5. emprestimos -> loans
--    Os triggers de negócio são desligados durante a carga: o
--    trg_loans_before_insert rejeita empréstimo de livro com available_copies = 0,
--    e o trg_loans_after_insert decrementaria o estoque de novo — mas a baixa
--    já veio refletida em livros.quantidade_disponivel.
-- ---------------------------------------------------------------------------
alter table public.loans disable trigger trg_loans_before_insert;
alter table public.loans disable trigger trg_loans_after_insert;

insert into public.loans (
    id, book_id, student_id, loan_date, due_date, status, renewals,
    created_at, updated_at
)
select
    e.id,
    e.livro_id,
    e.aluno_id,
    coalesce(e.data_emprestimo::date, current_date),
    greatest(
        coalesce(e.data_prevista_devolucao::date,
                 coalesce(e.data_emprestimo::date, current_date) + 7),
        coalesce(e.data_emprestimo::date, current_date)
    ),  -- garante o CHECK (due_date >= loan_date)
    case
        when lower(coalesce(e.status, '')) in ('devolvido', 'returned') then 'returned'
        when lower(coalesce(e.status, '')) in ('atrasado', 'overdue')   then 'overdue'
        else 'borrowed'
    end,
    coalesce(e.renovacoes, 0),
    now(),
    now()
from public.emprestimos e
where exists (select 1 from public.books    b where b.id = e.livro_id)
  and exists (select 1 from public.students s where s.id = e.aluno_id)
on conflict (id) do nothing;

alter table public.loans enable trigger trg_loans_before_insert;
alter table public.loans enable trigger trg_loans_after_insert;

-- ---------------------------------------------------------------------------
-- 6. RLS: students e loans só tinham políticas com using (auth.role() = 'anon'),
--    ou seja, usuário logado (role `authenticated`) recebia resultado vazio.
--    Alinhado ao padrão já usado em books/authors/categories.
-- ---------------------------------------------------------------------------
drop policy if exists students_select_all on public.students;
create policy students_select_all on public.students
    for select to anon, authenticated using (true);

drop policy if exists loans_select_all on public.loans;
create policy loans_select_all on public.loans
    for select to anon, authenticated using (true);

-- ---------------------------------------------------------------------------
-- 7. Retirar as tabelas em português do schema público (e, portanto, da API).
--    Reversível: alter table backup.livros set schema public;
-- ---------------------------------------------------------------------------
alter table public.livros      set schema backup;
alter table public.alunos      set schema backup;
alter table public.emprestimos set schema backup;

-- ---------------------------------------------------------------------------
-- 8. Verificação — incluindo a leitura sob a role `authenticated`,
--    que é a que a aplicação realmente usa.
-- ---------------------------------------------------------------------------
set local role authenticated;

select
    (select count(*) from public.books)           as books,        -- 154
    (select count(*) from public.authors)         as authors,      -- 140
    (select count(*) from public.categories)      as categories,   --   8
    (select count(*) from public.students)        as students,     --   1
    (select count(*) from public.loans)           as loans,        --   1
    (select count(*) from public.active_loans)    as ativos,       --   1
    (select count(*) from public.dashboard_stats) as dash;         --   1

reset role;
