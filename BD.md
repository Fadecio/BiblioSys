Crie e configure um banco de dados completo no **Supabase (PostgreSQL)** para o meu projeto de **Sistema de Biblioteca Escolar**.

Antes de criar qualquer coisa, analise a estrutura atual do projeto para entender quais entidades, telas, funcionalidades e dados já existem. Não altere o frontend sem necessidade.

## 1. Objetivo do banco

O sistema deve permitir:

* Cadastro de livros
* Cadastro de autores
* Cadastro de categorias/gêneros
* Cadastro de alunos/usuários
* Controle de exemplares disponíveis
* Empréstimo de livros
* Devolução de livros
* Controle de livros atrasados
* Histórico de empréstimos
* Pesquisa e filtros de livros
* Dashboard com informações da biblioteca
* Controle de disponibilidade dos livros
* Futuramente permitir autenticação de usuários e diferentes níveis de acesso

## 2. Estrutura das tabelas

Crie uma estrutura relacional normalizada.

### authors

Campos sugeridos:

* id
* name
* biography
* created_at

### categories

Campos:

* id
* name
* description
* created_at

### books

Campos:

* id
* title
* isbn
* description
* cover_url
* publisher
* publication_year
* total_copies
* available_copies
* author_id
* category_id
* created_at
* updated_at

Relacionamentos:

* books.author_id → authors.id
* books.category_id → categories.id

### students

Campos:

* id
* name
* registration_number
* email
* phone
* class
* birth_date
* active
* created_at
* updated_at

O registration_number deve ser único.

### loans

Campos:

* id
* book_id
* student_id
* loan_date
* due_date
* return_date
* status
* created_at
* updated_at

Relacionamentos:

* loans.book_id → books.id
* loans.student_id → students.id

O campo status deve permitir estados como:

* borrowed
* returned
* overdue

## 3. Regras de negócio

Implemente as regras diretamente no banco sempre que fizer sentido.

### Empréstimo

Ao registrar um empréstimo:

1. Verificar se existe exemplar disponível.
2. Não permitir empréstimo quando available_copies = 0.
3. Diminuir available_copies em 1.
4. Criar o registro em loans.
5. Definir automaticamente loan_date.
6. Definir due_date conforme a regra estabelecida pelo sistema.
7. Definir status como "borrowed".

### Devolução

Ao registrar uma devolução:

1. Preencher return_date.
2. Alterar status para "returned".
3. Aumentar available_copies em 1.
4. Impedir que o mesmo empréstimo seja devolvido duas vezes.

### Atrasos

Um empréstimo deve ser considerado atrasado quando:

* return_date IS NULL
* due_date < CURRENT_DATE

Avalie se é melhor utilizar uma VIEW ou função para calcular os empréstimos atrasados em vez de depender exclusivamente de um campo armazenado.

## 4. Integridade dos dados

Utilize:

* PRIMARY KEY
* FOREIGN KEY
* UNIQUE
* NOT NULL
* CHECK constraints
* DEFAULT values
* índices apropriados

Evite duplicação desnecessária de informações.

Defina corretamente as regras de ON DELETE e ON UPDATE para preservar a integridade dos dados.

## 5. Índices

Crie índices para campos utilizados frequentemente em:

* pesquisa de livros
* ISBN
* título
* nome do aluno
* matrícula do aluno
* categoria
* autor
* status do empréstimo
* due_date
* book_id
* student_id

Não crie índices desnecessários.

## 6. Row Level Security — RLS

Ative RLS nas tabelas que precisarem de proteção.

Estruture as políticas pensando em:

* usuário autenticado
* administrador da biblioteca
* funcionário da biblioteca
* aluno/usuário comum

No MVP, mantenha a estrutura simples e segura.

Não utilize políticas excessivamente permissivas como:

```sql
USING (true)
```

sem justificar o motivo.

Explique no código quais políticas são necessárias e por quê.

## 7. Supabase Auth

Prepare o banco para utilizar o:

Supabase Authentication.

Considere uma tabela/perfil relacionada ao usuário autenticado, por exemplo:

### profiles

Campos:

* id
* full_name
* email
* role
* created_at
* updated_at

O campo id deve estar relacionado ao:

auth.users(id)

Os possíveis roles inicialmente podem ser:

* admin
* librarian
* student

Não duplique informações desnecessariamente que já existem no auth.users.

## 8. Triggers e funções

Crie funções e triggers somente quando realmente agregarem valor.

Considere utilizar triggers para:

* atualizar updated_at automaticamente
* manter regras de consistência necessárias
* atualizar automaticamente a disponibilidade dos livros quando houver empréstimo/devolução, caso essa abordagem seja mais segura

Evite colocar toda a lógica do sistema em triggers.

A regra deve permanecer simples de entender e manter.

## 9. Views para o Dashboard

Crie views úteis para o frontend, por exemplo:

### dashboard_stats

Informações como:

* total de livros
* total de exemplares
* exemplares disponíveis
* total de alunos
* empréstimos ativos
* empréstimos atrasados
* livros devolvidos

### active_loans

Mostrar:

* livro
* aluno
* data do empréstimo
* data prevista de devolução
* status

### overdue_loans

Mostrar somente empréstimos atrasados.

## 10. Segurança

Nunca coloque:

* service_role key
* senha
* credenciais administrativas
* secrets

no frontend.

O frontend deve utilizar somente as credenciais públicas apropriadas do Supabase.

Explique onde cada variável de ambiente deve ficar.

Exemplo:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Se o projeto utilizar Next.js, adapte para:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## 11. Migrations

Não faça alterações diretamente de maneira desorganizada.

Organize o banco utilizando migrations SQL versionadas.

Crie uma estrutura semelhante a:

supabase/
└── migrations/
├── 001_create_profiles.sql
├── 002_create_authors.sql
├── 003_create_categories.sql
├── 004_create_books.sql
├── 005_create_students.sql
├── 006_create_loans.sql
├── 007_create_indexes.sql
├── 008_create_functions.sql
├── 009_create_triggers.sql
├── 010_create_views.sql
└── 011_create_rls_policies.sql

Adapte essa estrutura se a organização atual do projeto exigir outra abordagem.

## 12. Seed

Crie também um arquivo de seed para desenvolvimento contendo dados fictícios.

Inclua aproximadamente:

* 10 autores
* 8 categorias
* 20 livros
* 15 alunos
* alguns empréstimos ativos
* alguns empréstimos devolvidos
* alguns empréstimos atrasados

Utilize somente dados fictícios.

## 13. Integração com o frontend

Depois de criar o banco, analise o frontend atual e identifique:

* quais dados atualmente estão em arrays
* quais dados estão no LocalStorage
* quais dados devem migrar para o Supabase
* quais funções precisam ser alteradas
* quais componentes precisam consumir dados reais

Não reescreva o projeto inteiro.

Faça a migração de forma incremental, preservando a arquitetura atual.

## 14. Cliente Supabase

Crie uma camada responsável pela comunicação com o Supabase.

Evite espalhar chamadas diretamente pelo frontend.

Organize algo semelhante a:

src/
├── lib/
│   └── supabase.ts
├── services/
│   ├── books.service.ts
│   ├── students.service.ts
│   ├── loans.service.ts
│   └── authors.service.ts
└── types/
└── database.types.ts

Adapte os caminhos à arquitetura existente do projeto.

## 15. TypeScript

Se o projeto utilizar TypeScript:

* gere/organize os tipos do banco
* evite utilizar `any`
* tipifique respostas das queries
* tipifique entidades
* mantenha os tipos sincronizados com o banco

## 16. Tratamento de erros

As operações com Supabase devem tratar corretamente:

* erro de conexão
* registro inexistente
* ISBN duplicado
* matrícula duplicada
* livro indisponível
* aluno inativo
* empréstimo inexistente
* tentativa de devolver um livro já devolvido
* erro de autenticação
* erro de permissão/RLS

Não utilize `try/catch` apenas para esconder erros.

Mostre mensagens úteis para o usuário e mantenha informações técnicas no console/log apropriado.

## 17. Documentação

Depois de criar o banco, gere um documento:

docs/database.md

Explicando:

* arquitetura do banco
* tabelas
* campos principais
* relacionamentos
* regras de negócio
* funções
* triggers
* views
* índices
* RLS
* autenticação
* como executar as migrations
* como executar o seed
* variáveis de ambiente necessárias

Inclua também um diagrama textual semelhante a:

authors
│
└──── books ──── categories
│
│
loans
│
│
students

## 18. Importante

Antes de executar qualquer alteração:

1. Analise o projeto.
2. Identifique a stack utilizada.
3. Identifique a estrutura atual de pastas.
4. Identifique como os dados estão sendo armazenados atualmente.
5. Verifique se já existe integração com Supabase.
6. Verifique se já existem migrations.
7. Não sobrescreva arquivos existentes sem necessidade.
8. Não remova funcionalidades existentes.
9. Não altere o design da aplicação.
10. Não invente entidades que não sejam necessárias.

Ao final, apresente:

### Banco de dados

* tabelas criadas
* relacionamentos
* constraints
* índices

### Segurança

* RLS
* policies
* autenticação

### Backend/Supabase

* functions
* triggers
* views
* migrations
* seed

### Frontend

* arquivos alterados
* serviços criados
* tipos criados
* mudanças necessárias

Uma observação importante: como já estava usando LocalStorage no MVP, não faça uma migração "apagando tudo e começando de novo". O melhor caminho é fazer o que já existe e migrar gradualmente LocalStorage → Supabase.

### Próximos passos

Informe exatamente o que ainda precisa ser configurado no painel do Supabase e como testar o sistema.

Priorize **simplicidade, segurança, normalização, escalabilidade e facilidade de manutenção**.

Não faça alterações destrutivas sem minha confirmação.

