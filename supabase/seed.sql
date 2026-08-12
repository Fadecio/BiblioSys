
-- ── authors (10) ──────────────────────────────────────────────────────────
insert into public.authors (id, name, biography) values
  ('a0000000-0000-0000-0000-000000000001', 'Machado de Assis', 'Romancista, contista e cronista brasileiro, considerado um dos maiores nomes da literatura nacional.'),
  ('a0000000-0000-0000-0000-000000000002', 'Antoine de Saint-Exupéry', 'Escritor e aviador francês, autor de O Pequeno Príncipe.'),
  ('a0000000-0000-0000-0000-000000000003', 'Graciliano Ramos', 'Escritor alagoano, expoente da segunda geração do modernismo brasileiro.'),
  ('a0000000-0000-0000-0000-000000000004', 'Jorge Amado', 'Romancista baiano, um dos autores brasileiros mais traduzidos no exterior.'),
  ('a0000000-0000-0000-0000-000000000005', 'José de Alencar', 'Escritor cearense, figura central do romantismo brasileiro.'),
  ('a0000000-0000-0000-0000-000000000006', 'Aluísio Azevedo', 'Escritor maranhense, principal nome do naturalismo no Brasil.'),
  ('a0000000-0000-0000-0000-000000000007', 'Monteiro Lobato', 'Escritor paulista, criador do Sítio do Picapau Amarelo.'),
  ('a0000000-0000-0000-0000-000000000008', 'Joaquim Manuel de Macedo', 'Romancista fluminense, autor de A Moreninha.'),
  ('a0000000-0000-0000-0000-000000000009', 'Cecília Meireles', 'Poeta e professora carioca, uma das vozes centrais da poesia brasileira.'),
  ('a0000000-0000-0000-0000-000000000010', 'Ziraldo', 'Cartunista e escritor mineiro, autor de O Menino Maluquinho.')
on conflict (id) do nothing;

-- ── categories (8) ────────────────────────────────────────────────────────
insert into public.categories (id, name, description) values
  ('c0000000-0000-0000-0000-000000000001', 'Romance', 'Narrativas de ficção com foco em personagens e enredo.'),
  ('c0000000-0000-0000-0000-000000000002', 'Infantojuvenil', 'Obras voltadas para crianças e adolescentes.'),
  ('c0000000-0000-0000-0000-000000000003', 'Didático', 'Material de apoio pedagógico e consulta escolar.'),
  ('c0000000-0000-0000-0000-000000000004', 'Poesia', 'Coletâneas e obras em verso.'),
  ('c0000000-0000-0000-0000-000000000005', 'Conto', 'Coletâneas de contos e narrativas curtas.'),
  ('c0000000-0000-0000-0000-000000000006', 'Ciências', 'Divulgação científica para o público escolar.'),
  ('c0000000-0000-0000-0000-000000000007', 'História', 'Obras sobre história do Brasil e do mundo.'),
  ('c0000000-0000-0000-0000-000000000008', 'Quadrinhos', 'Histórias em quadrinhos e graphic novels.')
on conflict (id) do nothing;

insert into public.books (id, title, isbn, code, publisher, publication_year, total_copies, available_copies, author_id, category_id) values
  ('b0000000-0000-0000-0000-000000000001', 'Dom Casmurro', '9788535910663', 'LIT-001', 'Companhia das Letras', 1899, 3, 3, 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000002', 'Memórias Póstumas de Brás Cubas', '9788535910670', 'LIT-002', 'Companhia das Letras', 1881, 2, 2, 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000003', 'Quincas Borba', '9788535910687', 'LIT-003', 'Companhia das Letras', 1891, 2, 2, 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000004', 'O Pequeno Príncipe', '9788574065070', 'LIT-004', 'Agir', 1943, 4, 4, 'a0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002'),
  ('b0000000-0000-0000-0000-000000000005', 'Vidas Secas', '9788520925215', 'LIT-005', 'Record', 1938, 2, 2, 'a0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000006', 'São Bernardo', '9788520925222', 'LIT-006', 'Record', 1934, 2, 2, 'a0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000007', 'Capitães da Areia', '9788535914713', 'LIT-007', 'Companhia das Letras', 1937, 3, 3, 'a0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000008', 'Gabriela, Cravo e Canela', '9788535914720', 'LIT-008', 'Companhia das Letras', 1958, 2, 2, 'a0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000009', 'Iracema', '9788508162665', 'LIT-009', 'Ática', 1865, 2, 2, 'a0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000010', 'O Guarani', '9788508162672', 'LIT-010', 'Ática', 1857, 2, 2, 'a0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000011', 'O Cortiço', '9788508162689', 'LIT-011', 'Ática', 1890, 2, 2, 'a0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000012', 'Sítio do Picapau Amarelo', '9788525056101', 'LIT-012', 'Globo', 1920, 3, 3, 'a0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000002'),
  ('b0000000-0000-0000-0000-000000000013', 'Reinações de Narizinho', '9788525056118', 'LIT-013', 'Globo', 1931, 3, 3, 'a0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000002'),
  ('b0000000-0000-0000-0000-000000000014', 'A Moreninha', '9788508162696', 'LIT-014', 'Ática', 1844, 1, 1, 'a0000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000015', 'Ou Isto ou Aquilo', '9788520006174', 'LIT-015', 'Nova Fronteira', 1964, 3, 3, 'a0000000-0000-0000-0000-000000000009', 'c0000000-0000-0000-0000-000000000004'),
  ('b0000000-0000-0000-0000-000000000016', 'O Menino Maluquinho', '9788532502279', 'LIT-016', 'Melhoramentos', 1980, 4, 4, 'a0000000-0000-0000-0000-000000000010', 'c0000000-0000-0000-0000-000000000008'),
  ('b0000000-0000-0000-0000-000000000017', 'Enciclopédia de Ciências Ilustrada', '9788572085001', 'LIT-017', 'Editora Ática', 2015, 2, 2, null, 'c0000000-0000-0000-0000-000000000006'),
  ('b0000000-0000-0000-0000-000000000018', 'Atlas Geográfico Escolar', '9788572085018', 'LIT-018', 'IBGE Educa', 2019, 2, 2, null, 'c0000000-0000-0000-0000-000000000003'),
  ('b0000000-0000-0000-0000-000000000019', 'História do Brasil para Jovens', '9788572085025', 'LIT-019', 'Moderna', 2018, 2, 2, null, 'c0000000-0000-0000-0000-000000000007'),
  ('b0000000-0000-0000-0000-000000000020', 'Contos Brasileiros Essenciais', '9788572085032', 'LIT-020', 'Moderna', 2012, 2, 2, null, 'c0000000-0000-0000-0000-000000000005')
on conflict (id) do nothing;

-- ── students (15) ─────────────────────────────────────────────────────────
insert into public.students (id, name, registration_number, class, grade, active) values
  ('d0000000-0000-0000-0000-000000000001', 'Ana Beatriz Souza', '2026-0001', '5A', '5º ano', true),
  ('d0000000-0000-0000-0000-000000000002', 'Bruno Carvalho Lima', '2026-0002', '5A', '5º ano', true),
  ('d0000000-0000-0000-0000-000000000003', 'Carla Mendes Rocha', '2026-0003', '6B', '6º ano', true),
  ('d0000000-0000-0000-0000-000000000004', 'Diego Fernandes Alves', '2026-0004', '6B', '6º ano', true),
  ('d0000000-0000-0000-0000-000000000005', 'Elisa Ramos Teixeira', '2026-0005', '7A', '7º ano', true),
  ('d0000000-0000-0000-0000-000000000006', 'Felipe Nogueira Dias', '2026-0006', '7A', '7º ano', true),
  ('d0000000-0000-0000-0000-000000000007', 'Gabriela Pinto Duarte', '2026-0007', '8C', '8º ano', true),
  ('d0000000-0000-0000-0000-000000000008', 'Henrique Barbosa Cunha', '2026-0008', '8C', '8º ano', true),
  ('d0000000-0000-0000-0000-000000000009', 'Isabela Cardoso Martins', '2026-0009', '9A', '9º ano', true),
  ('d0000000-0000-0000-0000-000000000010', 'João Pedro Azevedo', '2026-0010', '9A', '9º ano', true),
  ('d0000000-0000-0000-0000-000000000011', 'Karina Souza Lopes', '2026-0011', '5B', '5º ano', true),
  ('d0000000-0000-0000-0000-000000000012', 'Lucas Martins Farias', '2026-0012', '6A', '6º ano', true),
  ('d0000000-0000-0000-0000-000000000013', 'Mariana Costa Ribeiro', '2026-0013', '7B', '7º ano', true),
  ('d0000000-0000-0000-0000-000000000014', 'Nícolas Almeida Silva', '2026-0014', '8A', '8º ano', true),
  ('d0000000-0000-0000-0000-000000000015', 'Olívia Torres Nunes', '2026-0015', '9B', '9º ano', false)
on conflict (id) do nothing;

-- ── loans ─────────────────────────────────────────────────────────────────
insert into public.loans (id, book_id, student_id, loan_date, due_date, return_date, status) values
  -- ativos (dentro do prazo)
  ('e0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', current_date - 3, current_date + 4, null, 'borrowed'),
  ('e0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000002', current_date - 2, current_date + 5, null, 'borrowed'),
  ('e0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000012', 'd0000000-0000-0000-0000-000000000008', current_date - 1, current_date + 6, null, 'borrowed'),
  ('e0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000016', 'd0000000-0000-0000-0000-000000000011', current_date, current_date + 7, null, 'borrowed'),
  -- atrasados (due_date no passado, sem devolução)
  ('e0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000014', 'd0000000-0000-0000-0000-000000000004', current_date - 10, current_date - 3, null, 'borrowed'),
  ('e0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000007', 'd0000000-0000-0000-0000-000000000005', current_date - 17, current_date - 10, null, 'borrowed'),
  ('e0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000009', 'd0000000-0000-0000-0000-000000000012', current_date - 15, current_date - 8, null, 'borrowed'),
  -- devolvidos
  ('e0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000006', current_date - 20, current_date - 13, current_date - 12, 'returned'),
  ('e0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000007', current_date - 15, current_date - 8, current_date - 7, 'returned'),
  ('e0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000009', current_date - 12, current_date - 5, current_date - 4, 'returned'),
  ('e0000000-0000-0000-0000-000000000011', 'b0000000-0000-0000-0000-000000000013', 'd0000000-0000-0000-0000-000000000010', current_date - 9, current_date - 2, current_date - 1, 'returned'),
  ('e0000000-0000-0000-0000-000000000012', 'b0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000013', current_date - 30, current_date - 23, current_date - 22, 'returned')
on conflict (id) do nothing;

update public.books b
set available_copies = b.total_copies - coalesce((
  select count(*) from public.loans l where l.book_id = b.id and l.return_date is null
), 0)
where b.id in (select distinct book_id from public.loans);

select public.sync_overdue_loans();
