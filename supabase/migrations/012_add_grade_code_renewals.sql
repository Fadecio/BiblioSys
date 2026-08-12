-- 012_add_grade_code_renewals.sql
-- Fecha 3 lacunas encontradas ao ligar o frontend (que já tinha esses conceitos desde o MVP
-- em localStorage) ao schema criado a partir de BD.md, que não previa esses campos.

-- ── students.grade (série) ──────────────────────────────────────────────────
-- O frontend sempre teve "turma" (class) E "série" (ex.: "5º ano") como campos
-- independentes; o schema original só tinha "class".
alter table public.students add column if not exists grade text;
comment on column public.students.grade is 'Série do aluno (ex.: "5º ano"), independente da turma (class).';

-- ── students.registration_number automático ─────────────────────────────────
-- A tela de Alunos nunca coletou matrícula manualmente; para não adicionar um campo novo
-- na UI, o banco passa a gerar um valor único sozinho quando o insert não informa um.
create sequence if not exists public.students_registration_seq;
alter table public.students
  alter column registration_number
  set default ('ALU-' || lpad(nextval('public.students_registration_seq')::text, 5, '0'));

-- ── books.code (código interno) ──────────────────────────────────────────────
-- Separado de isbn: "código" (ex.: "LIT-001") é um identificador interno do acervo,
-- não o ISBN real do livro — misturar os dois no mesmo campo corromperia o significado
-- de isbn pros livros que tiverem um ISBN de verdade cadastrado.
alter table public.books add column if not exists code text;
comment on column public.books.code is 'Código interno do acervo (ex.: "LIT-001"), distinto do ISBN.';

-- ── authors.name único ────────────────────────────────────────────────────────
-- A tela de Livros usa um campo de texto livre para autor (não uma lista de seleção).
-- Sem uma chave natural, cada livro salvo criaria um autor novo mesmo repetindo o nome.
-- Simplificação aceitável no MVP: mesmo nome = mesmo autor (sem desambiguação de homônimos).
alter table public.authors add constraint authors_name_key unique (name);

-- ── loans.renewals ────────────────────────────────────────────────────────────
alter table public.loans add column if not exists renewals int not null default 0;
comment on column public.loans.renewals is 'Contador informativo de renovações (não afeta regra de negócio).';

-- ── renovação de empréstimo ───────────────────────────────────────────────────
-- Mesma regra que já existia só no frontend (utils/emprestimo.ts): só renova quem está em
-- dia (não devolvido, não atrasado) — livro atrasado precisa ser devolvido primeiro.
create or replace function public.renew_loan(p_loan_id uuid, p_extra_days int default 7)
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
    raise exception 'Empréstimo já devolvido não pode ser renovado.' using errcode = 'P0001';
  end if;
  if v_loan.due_date < current_date then
    raise exception 'Empréstimo atrasado não pode ser renovado — registre a devolução primeiro.' using errcode = 'P0001';
  end if;

  update public.loans
  set due_date = due_date + p_extra_days, renewals = renewals + 1
  where id = p_loan_id
  returning * into v_loan;

  return v_loan;
end;
$$;
