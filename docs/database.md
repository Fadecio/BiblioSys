# Banco de dados — BiblioSys

Documentação do schema Supabase (PostgreSQL) criado a partir de `BD.md`. O MVP atual do
frontend continua rodando 100% sobre `localStorage` (ver `src/services/storage.ts`) — este
banco é a base para a migração incremental descrita em [Integração com o frontend](#integração-com-o-frontend-v2)
e no roadmap V2 do `spec.md`. Nenhuma tela ou hook existente foi alterado por este trabalho.

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
| `books` | `title`, `isbn` (único), `total_copies`, `available_copies`, `author_id`, `category_id` | `available_copies` nunca é maior que `total_copies` nem negativo (CHECK + triggers). |
| `students` | `name`, `registration_number` (único), `class`, `active` | Aluno é **dado gerenciado**, não usuário autenticado, no MVP. `active = false` bloqueia novos empréstimos. |
| `loans` | `book_id`, `student_id`, `loan_date`, `due_date`, `return_date`, `status` | `status` ∈ `borrowed`, `returned`, `overdue` — mas a fonte de verdade pra "atrasado" é a view `overdue_loans`, não a coluna (ver [Regras de negócio](#regras-de-negócio)). |

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

RLS habilitado em todas as 6 tabelas. Nenhuma policy usa `USING (true)`. Papéis
considerados: **admin** e **librarian** (funcionário da biblioteca) operam o sistema;
**student** é preparado pro futuro mas hoje não tem policy nas tabelas operacionais, porque
não existe vínculo aluno↔usuário autenticado no MVP (aluno é dado, não login).

| Tabela | Select | Insert/Update | Delete |
|---|---|---|---|
| `profiles` | dono da linha ou staff | dono só pode editar a própria linha (role protegida por trigger) | ninguém |
| `authors`, `categories`, `books` | qualquer autenticado | só admin/librarian | só admin/librarian |
| `students` | só admin/librarian | só admin/librarian | só admin/librarian |
| `loans` | só admin/librarian | só admin/librarian | só admin |

Por que catálogo (`authors`/`categories`/`books`) é legível por qualquer autenticado: não é
dado sensível e uma futura tela de consulta do aluno vai precisar ler isso. `students` e
`loans` guardam dado pessoal (nome, telefone, histórico), por isso ficam restritos à equipe.

## Autenticação (Supabase Auth)

- `profiles` é criada automaticamente no signup (trigger `on_auth_user_created`).
- Roles possíveis: `admin`, `librarian`, `student` (default `student` — promova manualmente
  pelo SQL editor após o primeiro cadastro, ver [Próximos passos](#próximos-passos-no-painel-do-supabase)).
- O frontend V1 não tem tela de login — a integração de Auth é preparação para V2.

## Como executar as migrations

As migrations estão numeradas em `supabase/migrations/001_...sql` a `011_...sql` e devem
rodar **nessa ordem**, uma vez cada (não são idempotentes — `CREATE POLICY`, por exemplo,
falha se rodar duas vezes; `seed.sql`, sim, é idempotente).

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
│   └── supabase.ts          # cliente único, lê as env vars
├── services/
│   ├── errors.ts            # traduz erro do Postgres/Supabase em mensagem pra UI
│   ├── authors.service.ts
│   ├── categories.service.ts
│   ├── books.service.ts
│   ├── students.service.ts
│   ├── loans.service.ts     # register()/returnLoan() chamam as RPCs do banco
│   └── dashboard.service.ts # lê a view dashboard_stats
└── types/
    └── database.types.ts    # tipos do schema (mão, até existir project-id pra gerar via CLI)
```

Esses arquivos são **aditivos**: ainda não são usados pelos hooks/páginas atuais
(`useAlunos`, `useLivros`, `useEmprestimos` continuam sobre `localStorage`). Ver próxima
seção pra saber o que falta pra ligar um ao outro.

## Integração com o frontend (V2)

O que existe hoje no MVP, olhando `src/services/storage.ts` e os hooks em `src/hooks/`:

- **Dados em `localStorage`, não em arrays em memória**: `bibliosys:alunos`,
  `bibliosys:livros`, `bibliosys:emprestimos`, geridos por `useAlunos`, `useLivros`,
  `useEmprestimos` (Context API).
- **Modelagem em português, achatada**: `Livro.autor` e `Livro.categoria` são `string`
  livre, não FK — o banco novo normaliza isso em `authors`/`categories`. Migrar exige
  decidir como resolver os textos livres existentes para linhas de `authors`/`categories`
  (ex.: `INSERT ... ON CONFLICT DO NOTHING` a partir dos valores distintos já cadastrados).
- **Regras de negócio replicadas**: `src/utils/emprestimo.ts` (status derivado, prazo de 7
  dias, renovação) tem equivalente no banco (`register_loan`/`return_loan`/view
  `overdue_loans`), exceto **renovação**, que o schema atual não modela — é a única
  funcionalidade do frontend sem equivalente pronto no banco (ver nota abaixo).

O que precisaria mudar pra migrar de fato (não feito neste trabalho, por ser uma troca de
fonte de dados arriscada sem um projeto Supabase real pra testar contra):

1. Trocar o corpo de `useAlunos`/`useLivros`/`useEmprestimos` pra chamar
   `studentsService`/`booksService`/`loansService` em vez de `storage.ts`, mantendo a
   mesma interface pública dos hooks (o resto do app não precisa saber da troca).
2. Mapear os campos em português da UI (`nome`, `titulo`, `matricula`...) pros nomes em
   inglês do banco (`name`, `title`, `registration_number`...) — uma camada fina de adapter
   dentro dos hooks, não espalhada pelos componentes.
3. Adicionar uma migration extra pra **renovação de empréstimo** (estender `due_date` de um
   empréstimo em aberto), já que `BD.md` não pediu essa regra explicitamente e o schema
   atual não tem uma função pra isso — hoje só existe no frontend
   (`renovarEmprestimo` em `src/utils/emprestimo.ts`).
4. Trocar `AlunosProvider`/`LivrosProvider`/`EmprestimosProvider` de `useState` síncrono
   pra um estado assíncrono (loading/error), já que toda leitura passa a ser uma chamada de
   rede.

## Próximos passos no painel do Supabase

1. Criar um projeto em [app.supabase.com](https://app.supabase.com).
2. Rodar as 11 migrations em ordem (SQL Editor ou CLI, ver acima).
3. Rodar `supabase/seed.sql` pra ter dados de demonstração.
4. Copiar `Project URL` e `anon public key` de **Settings → API** pro `.env`.
5. Em **Authentication → Providers**, habilitar o método de login que for usar (ex.:
   email/senha) — não é usado pelo frontend V1 ainda, mas já deixa `profiles` funcional.
6. Cadastrar um usuário de teste (via `supabase.auth.signUp` ou pelo painel) e promovê-lo
   manualmente a admin: `update public.profiles set role = 'admin' where email = '...';`
7. Testar a regra de empréstimo direto no SQL Editor:
   ```sql
   select public.register_loan('<book_id>', '<student_id>');
   select public.return_loan('<loan_id>');
   select * from public.overdue_loans;
   select * from public.dashboard_stats;
   ```
8. Testar RLS: autenticado como o usuário de teste (via `supabase.auth` no frontend, ou
   `SET request.jwt.claims` no SQL Editor), confirmar que `select * from students` só
   funciona pra `admin`/`librarian`.
