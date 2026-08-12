# Banco de dados — BiblioSys

Documentação do schema Supabase (PostgreSQL) criado a partir de `BD.md`. O frontend lê e
escreve direto no Supabase (`useAlunos`/`useLivros`/`useEmprestimos`, via `src/services/`) —
o antigo `services/storage.ts` sobre `localStorage` foi removido. Ver
[Camada de acesso (frontend)](#camada-de-acesso-frontend) pra como isso está organizado.

## Diagrama

```
auth.users (Supabase Auth)
      │
      ▼
  profiles (role: admin | librarian | student)


  authors ──┐
            ├──▶ books ◀── loans ──▶ students
  categories┘
```

`books.author_id` e `books.category_id` apontam pra `authors`/`categories` (ON DELETE SET
NULL — remover um autor não apaga os livros dele). `loans.book_id`/`loans.student_id`
apontam pra `books`/`students` (ON DELETE RESTRICT — não dá pra excluir um livro ou aluno
que tem empréstimo no histórico).

## Tabelas

| Tabela | Campos principais | Observações |
|---|---|---|
| `profiles` | `id` (= `auth.users.id`), `full_name`, `email`, `role` | Criada automaticamente por trigger quando um usuário se cadastra no Supabase Auth. `role` ∈ `admin`, `librarian`, `student`. |
| `authors` | `id`, `name`, `biography` | |
| `categories` | `id`, `name` (único), `description` | |
| `books` | `title`, `isbn` (único), `code`, `total_copies`, `available_copies`, `author_id`, `category_id` | `available_copies` nunca é maior que `total_copies` nem negativo (CHECK + triggers). `code` (migration 012) é o código interno do acervo (ex. "LIT-001"), separado do `isbn` real. |
| `students` | `name`, `registration_number` (único, gerado automaticamente), `class`, `grade`, `active` | Aluno é **dado gerenciado**, não usuário autenticado, no MVP. `active = false` bloqueia novos empréstimos. `grade` (série, migration 012) é independente de `class` (turma). `registration_number` tem `DEFAULT` via sequence (`ALU-00001`...) porque a tela de Alunos não coleta matrícula. |
| `loans` | `book_id`, `student_id`, `loan_date`, `due_date`, `return_date`, `status`, `renewals` | `status` ∈ `borrowed`, `returned`, `overdue` — mas a fonte de verdade pra "atrasado" é a view `overdue_loans`, não a coluna (ver [Regras de negócio](#regras-de-negócio)). `renewals` (migration 012) conta renovações, incrementado por `renew_loan()`. |

## Relacionamentos

- `books.author_id → authors.id` (`ON DELETE SET NULL`)
- `books.category_id → categories.id` (`ON DELETE SET NULL`)
- `loans.book_id → books.id` (`ON DELETE RESTRICT`)
- `loans.student_id → students.id` (`ON DELETE RESTRICT`)
- `profiles.id → auth.users.id` (`ON DELETE CASCADE`)

## Regras de negócio

### Empréstimo

Implementada na função `register_loan(p_book_id, p_student_id, p_loan_days default 7)`
**e** reforçada por um trigger `BEFORE INSERT` em `loans` (assim a regra vale mesmo se
alguém inserir direto na tabela, não só via RPC):

1. Bloqueia se `available_copies = 0` (mensagem: "Não há exemplares disponíveis").
2. Bloqueia se o aluno estiver `active = false`.
3. Insere o empréstimo com `status = 'borrowed'`, `loan_date = hoje`, `due_date = hoje + p_loan_days`.
4. Um trigger `AFTER INSERT` decrementa `books.available_copies` em 1.

### Devolução

Implementada na função `return_loan(p_loan_id)` e reforçada por triggers em `loans`:

1. Levanta erro se o empréstimo já tiver `return_date` preenchida (não devolve duas vezes).
2. Preenche `return_date = hoje` e `status = 'returned'`.
3. Um trigger `AFTER UPDATE` incrementa `books.available_copies` em 1 quando `return_date`
   passa de `NULL` para preenchida.

### Renovação

Implementada na função `renew_loan(p_loan_id, p_extra_days default 7)` (migration 012 —
não existia no schema original de `BD.md`; foi adicionada porque o frontend já tinha essa
funcionalidade desde o MVP em `localStorage`, ver `src/utils/emprestimo.ts`):

1. Levanta erro se o empréstimo já tiver sido devolvido.
2. Levanta erro se `due_date < hoje` (atrasado precisa ser devolvido primeiro, não renovado).
3. Estende `due_date` em `p_extra_days` e incrementa `renewals`.

### Atrasos

**Decisão de design:** atraso é *calculado*, não armazenado como fonte de verdade — evita
que `loans.status` fique dessincronizado da data atual (mesma lógica que o frontend já usa
em `src/utils/emprestimo.ts` para `localStorage`). A view `overdue_loans` sempre reflete o
estado real:

```sql
where return_date is null and due_date < current_date
```

A coluna `loans.status` pode ser sincronizada opcionalmente com `select
public.sync_overdue_loans();` (útil se algum relatório preferir filtrar
`status = 'overdue'` direto, sem join) — não é chamada automaticamente por trigger, porque
"atrasado" depende da data atual, não de um evento no banco.

## Funções

| Função | Uso |
|---|---|
| `register_loan(p_book_id, p_student_id, p_loan_days=7)` | Cria um empréstimo validando disponibilidade e aluno ativo. |
| `return_loan(p_loan_id)` | Registra devolução, bloqueando devolução duplicada. |
| `renew_loan(p_loan_id, p_extra_days=7)` | Estende `due_date`, bloqueando renovação de atrasado/devolvido (migration 012). |
| `sync_overdue_loans()` | Atualiza `loans.status = 'overdue'` para empréstimos vencidos (opcional/manual). |
| `get_my_role()` / `is_staff()` | Helpers de RLS — leem o `role` do usuário autenticado. |
| `set_updated_at()` | Genérica, usada pelos triggers de `updated_at`. |
| `handle_new_user()` | Cria a linha em `profiles` quando um usuário se cadastra no Auth. |

## Triggers

| Trigger | Tabela | Evento | O que faz |
|---|---|---|---|
| `on_auth_user_created` | `auth.users` | AFTER INSERT | Cria o `profile` correspondente. |
| `trg_*_updated_at` | `profiles`, `books`, `students`, `loans` | BEFORE UPDATE | Atualiza `updated_at`. |
| `trg_loans_before_insert` | `loans` | BEFORE INSERT | Valida disponibilidade/aluno ativo. |
| `trg_loans_after_insert` | `loans` | AFTER INSERT | Decrementa `available_copies`. |
| `trg_loans_before_update` | `loans` | BEFORE UPDATE | Bloqueia devolução duplicada; sincroniza `status`. |
| `trg_loans_after_update` | `loans` | AFTER UPDATE | Incrementa `available_copies` na devolução. |
| `trg_profiles_protect_role` | `profiles` | BEFORE UPDATE | Impede que um usuário mude o próprio `role` sem ser admin. |

## Views

| View | Uso |
|---|---|
| `dashboard_stats` | Uma linha com os contadores dos cards do dashboard (total de livros, exemplares, alunos, empréstimos ativos/atrasados/devolvidos). |
| `active_loans` | Empréstimos em aberto (`return_date IS NULL`), com título do livro e nome do aluno já resolvidos. |
| `overdue_loans` | Só os empréstimos atrasados, com `days_overdue` calculado. |

## Índices

`pg_trgm` habilitado para busca "contém" (usada na pesquisa por título/nome, que no
frontend é `ILIKE '%termo%'`):

- `idx_books_title_trgm` (GIN, trigram) — busca de livro por título.
- `idx_books_isbn`, `idx_books_author_id`, `idx_books_category_id`.
- `idx_students_name_trgm` (GIN, trigram) — busca de aluno por nome.
- `idx_students_registration_number`.
- `idx_loans_status`, `idx_loans_due_date`, `idx_loans_book_id`, `idx_loans_student_id`.
- `idx_loans_open_due_date` (parcial: só `WHERE return_date IS NULL`) — acelera a view `overdue_loans`.

`UNIQUE` em `books.isbn` e `students.registration_number` já cria índice próprio (não
duplicado).

## RLS (Row Level Security)

RLS habilitado em todas as 6 tabelas. Papéis considerados: **admin** e **librarian**
(funcionário da biblioteca) operam o sistema; **student** é preparado pro futuro mas hoje
não tem policy nas tabelas operacionais, porque não existe vínculo aluno↔usuário
autenticado no MVP (aluno é dado, não login).

A tabela abaixo já reflete a migration **013** (`013_relax_rls_for_anon.sql`), que libera o
role `anon` — necessário porque o frontend V1 não tem login (ver
[Sobre autenticação](#sobre-autenticação-por-que-existe-a-migration-013)):

| Tabela | Select | Insert/Update | Delete |
|---|---|---|---|
| `profiles` | dono da linha ou staff | dono só pode editar a própria linha (role protegida por trigger) | ninguém |
| `authors`, `categories`, `books` | qualquer autenticado ou `anon` | `anon` ou admin/librarian | `anon` ou admin/librarian |
| `students` | `anon` ou admin/librarian | `anon` ou admin/librarian | `anon` ou admin/librarian |
| `loans` | `anon` ou admin/librarian | `anon` ou admin/librarian | `anon` ou admin |

Por que catálogo (`authors`/`categories`/`books`) é legível por qualquer autenticado: não é
dado sensível e uma futura tela de consulta do aluno vai precisar ler isso. `students` e
`loans` guardam dado pessoal (nome, telefone, histórico) — em condições normais (com login)
ficariam restritos à equipe; hoje ficam abertos pra `anon` pelo mesmo motivo de tudo o mais
(sem login, não há como distinguir "o bibliotecário" de qualquer outro chamador).

## Autenticação (Supabase Auth)

- `profiles` é criada automaticamente no signup (trigger `on_auth_user_created`).
- Roles possíveis: `admin`, `librarian`, `student` (default `student` — promova manualmente
  pelo SQL editor após o primeiro cadastro, ver [Próximos passos](#próximos-passos-no-painel-do-supabase)).
- O frontend V1 não tem tela de login — a integração de Auth é preparação para V2.

## Como executar as migrations

As migrations estão numeradas em `supabase/migrations/001_...sql` a `013_...sql` e devem
rodar **nessa ordem**, uma vez cada (não são idempotentes — `CREATE POLICY`, por exemplo,
falha se rodar duas vezes; `seed.sql`, sim, é idempotente).

> Se seu projeto já tinha as migrations 001–011 aplicadas antes de 2026-08-12, falta rodar
> a **012** (`012_add_grade_code_renewals.sql`: `students.grade`, `books.code`,
> `loans.renewals`/`renew_loan()`, `DEFAULT` automático de `students.registration_number`)
> e a **013** (`013_relax_rls_for_anon.sql`: sem essa, o app carrega listas vazias — ver
> [Sobre autenticação](#sobre-autenticação-por-que-existe-a-migration-013)).

**Opção A — SQL Editor do Supabase (mais simples, sem instalar nada):**
Abra cada arquivo em `supabase/migrations/`, na ordem, e rode o conteúdo no SQL Editor do
painel do projeto.

**Opção B — Supabase CLI:**
```bash
supabase login
supabase link --project-ref <seu-project-ref>
# renomeie os arquivos para o formato <timestamp>_nome.sql exigido pela CLI, ou rode:
supabase db push
```

## Como executar o seed

`supabase/seed.sql` contém dados fictícios (10 autores, 8 categorias, 20 livros, 15 alunos,
empréstimos ativos/atrasados/devolvidos) e é seguro rodar mais de uma vez (usa
`ON CONFLICT ... DO NOTHING` com UUIDs fixos). Rode depois das 11 migrations, via SQL
Editor ou `supabase db reset` (que aplica migrations + seed automaticamente em ambiente
local). **Não rode em produção.**

## Variáveis de ambiente

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Copie `.env.example` para `.env` (já está no `.gitignore`) e preencha com os valores de
**Project Settings → API** no painel do Supabase. A `anon key` é pública por design — a
proteção real é o RLS acima. A `service_role key` **nunca** entra no frontend; ela só seria
usada em um contexto de servidor/admin, que este projeto não tem hoje.

## Camada de acesso (frontend)

```
src/
├── lib/
│   └── supabase.ts          # cliente único, lê as env vars (lança erro claro se ausentes)
├── services/
│   ├── errors.ts            # traduz erro do Postgres/Supabase em ServiceError com mensagem pra UI
│   ├── authors.service.ts
│   ├── categories.service.ts
│   ├── books.service.ts     # createFromNames/updateFromNames resolvem autor/categoria por nome
│   ├── students.service.ts
│   ├── loans.service.ts     # register()/returnLoan()/renew() chamam as RPCs do banco
│   └── dashboard.service.ts # lê a view dashboard_stats
└── types/
    └── database.types.ts    # tipos do schema (à mão, até existir project-id pra gerar via CLI)
```

`useAlunos`/`useLivros`/`useEmprestimos` (`src/hooks/`) usam esses services diretamente —
não há mais `localStorage` no projeto. Cada hook busca os dados no mount (`useEffect`),
expõe `carregando`/`erro`, e as mutações (`adicionar`/`atualizar`/`remover`/`registrar`/
`devolver`/`renovar`) retornam `Promise<{ sucesso, mensagem? }>` em vez de `void`, porque
uma chamada de rede pode falhar de formas que `localStorage` nunca falhava (offline, RLS,
dado duplicado) — os formulários (`AlunoForm`, `LivroForm`, `EmprestimoForm`) e as tabelas
mostram essa mensagem inline (`text-destructive`), mesmo padrão que já existia em Empréstimos.

**Mapeamento de campos** (a UI continua 100% em português, sem nenhuma tela alterada):

| Frontend (`src/types/index.ts`) | Banco | Observação |
|---|---|---|
| `Aluno.nome/turma/serie` | `students.name/class/grade` | `registration_number` nunca é enviado pelo frontend — o banco gera sozinho. |
| `Livro.autor` (texto livre) | `books.author_id` → `authors.name` | `booksService.createFromNames` resolve nome → linha existente ou nova (upsert por `authors.name`, que é `UNIQUE`). |
| `Livro.categoria` (texto livre) | `books.category_id` → `categories.name` | Mesma resolução, via `categories.name` (`UNIQUE`). |
| `Livro.codigo` | `books.code` | Independente de `isbn`. |
| `Emprestimo.*` | `loans.*` | Mapeamento direto; `status` do banco é só ponto de partida — `derivarStatus()` (`utils/emprestimo.ts`) sempre recalcula a partir da data atual, como já fazia sobre `localStorage`. |

**Coordenação entre hooks:** `useEmprestimos` chama `useLivros().recarregar()` depois de um
`registrar`/`devolver` bem-sucedido, porque `available_copies` muda no banco via trigger
(não no cliente) — sem isso, a lista de livros em memória ficaria com a disponibilidade
desatualizada até a próxima navegação.

**Limitação conhecida:** `resolveAuthorId`/`resolveCategoryId` (upsert por nome) não são
atômicos entre si nem protegidos por transação explícita — em uso normal (poucos
bibliotecários, não muitos saves simultâneos do mesmo autor/categoria) isso não é um
problema real; o `UNIQUE` em `authors.name`/`categories.name` garante que o pior caso é uma
constraint reprovando uma corrida rara, não duplicação silenciosa.

## Próximos passos no painel do Supabase

Se o projeto, as migrations 001–011 e o seed já estavam prontos antes de 2026-08-12, só
falta:

1. Rodar as migrations **012** (`012_add_grade_code_renewals.sql`) e **013**
   (`013_relax_rls_for_anon.sql`) no SQL Editor, nessa ordem.
2. Criar `.env` na raiz do projeto (copiando `.env.example`) com `VITE_SUPABASE_URL` e
   `VITE_SUPABASE_ANON_KEY` de **Project Settings → API** — sem isso o app lança um erro
   claro no console (`src/lib/supabase.ts`) em vez de tentar rodar sem credenciais.

### Sobre autenticação (por que existe a migration 013)

As policies de RLS originais (011) exigiam usuário autenticado com role `admin`/`librarian`
em `profiles`. Isso pressupõe login — mas o frontend não tem tela de login (spec.md, "v1 é
single-user, sem login"), então toda chamada do app chega no Postgres como role `anon`, sem
`auth.uid()`. Sem ajuste, o app carregaria listas **vazias** (RLS filtra silenciosamente no
select) e falharia ao salvar com "Você não tem permissão para realizar esta ação".

A migration 013 libera o role `anon` nas mesmas operações que a "equipe da biblioteca"
tinha — mesmo nível de proteção que o MVP já tinha em produção sobre `localStorage` (zero
controle de acesso; segurança = não divulgar a URL). RLS continua **ativo**, só as policies
passam a aceitar `anon`. Quando o projeto ganhar login de verdade (roadmap V2), reverta 013
(policies voltam a exigir só `authenticated` + `is_staff()`) e adicione a tela de login.

### Testar direto no SQL Editor

```sql
select public.register_loan('<book_id>', '<student_id>');
select public.return_loan('<loan_id>');
select public.renew_loan('<loan_id>');
select * from public.overdue_loans;
select * from public.dashboard_stats;
```
