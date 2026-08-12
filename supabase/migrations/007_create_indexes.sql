-- 007_create_indexes.sql
-- Índices para os acessos mais frequentes do sistema (busca de livros, listagem de
-- empréstimos por status/prazo, lookup de aluno). UNIQUE já cria índice implícito
-- (books.isbn, students.registration_number) — não duplicado aqui.

-- pg_trgm habilita índice GIN eficiente para busca "contém" (ILIKE '%termo%'), usada na
-- pesquisa de livros por título e de alunos por nome.
create extension if not exists pg_trgm;

-- busca de livros: título e ISBN
create index if not exists idx_books_title_trgm on public.books using gin (title gin_trgm_ops);
create index if not exists idx_books_isbn on public.books (isbn);

-- joins/filtros de livro por autor e categoria
create index if not exists idx_books_author_id on public.books (author_id);
create index if not exists idx_books_category_id on public.books (category_id);

-- busca de aluno por nome e matrícula
create index if not exists idx_students_name_trgm on public.students using gin (name gin_trgm_ops);
create index if not exists idx_students_registration_number on public.students (registration_number);

-- listagem/filtro de empréstimos: status, prazo, e lookups por livro/aluno
create index if not exists idx_loans_status on public.loans (status);
create index if not exists idx_loans_due_date on public.loans (due_date);
create index if not exists idx_loans_book_id on public.loans (book_id);
create index if not exists idx_loans_student_id on public.loans (student_id);

-- consulta de atrasados (view overdue_loans) filtra por return_date IS NULL + due_date
create index if not exists idx_loans_open_due_date on public.loans (due_date) where return_date is null;
