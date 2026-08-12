
create extension if not exists pg_trgm;

create index if not exists idx_books_title_trgm on public.books using gin (title gin_trgm_ops);
create index if not exists idx_books_isbn on public.books (isbn);

create index if not exists idx_books_author_id on public.books (author_id);
create index if not exists idx_books_category_id on public.books (category_id);

create index if not exists idx_students_name_trgm on public.students using gin (name gin_trgm_ops);
create index if not exists idx_students_registration_number on public.students (registration_number);

create index if not exists idx_loans_status on public.loans (status);
create index if not exists idx_loans_due_date on public.loans (due_date);
create index if not exists idx_loans_book_id on public.loans (book_id);
create index if not exists idx_loans_student_id on public.loans (student_id);

create index if not exists idx_loans_open_due_date on public.loans (due_date) where return_date is null;
