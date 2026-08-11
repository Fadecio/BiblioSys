# BiblioSys

Sistema de gerenciamento de biblioteca escolar: um dashboard interno para controlar o cadastro de alunos, livros e empréstimos, com indicadores consolidados.


## Funcionalidades

- **Dashboard**: cards de indicadores e gráfico dos livros mais procurados.
- **Alunos**: cadastro, edição, exclusão e busca (tolerante a acentos).
- **Livros**: cadastro, edição, exclusão e busca, com controle de quantidade total/disponível.
- **Empréstimos**: registrar, renovar e devolver, com status calculado automaticamente (em dia, a vencer, atrasado, devolvido) e filtro por status.
- Campos de aluno/livro do formulário de empréstimo com busca via combobox.
- Bloqueio de exclusão de aluno/livro com empréstimo ativo vinculado.
- Layout responsivo: sidebar fixa no desktop e gaveta lateral (sheet) no mobile.

## Tecnologias

- React 19 + TypeScript
- Vite
- Tailwind CSS + shadcn/ui (Radix)
- React Router
- Recharts (gráficos)
- date-fns
- Persistência em `localStorage`, isolada em uma camada de `services/`
- Context API + hooks customizados para estado global (alunos, livros, empréstimos)

## Estrutura de pastas

```
src/
├── components/   # Componentes de UI e de domínio (formulários, tabelas, sidebar etc.)
├── hooks/        # Contexts + hooks customizados (useAlunos, useLivros, useEmprestimos)
├── lib/          # Utilidades e configurações compartilhadas
├── pages/        # Páginas da aplicação (Dashboard, Alunos, Livros, Empréstimos)
├── services/     # Camada de acesso a dados (localStorage)
├── types/        # Tipagens TypeScript do domínio
└── utils/        # Funções auxiliares (status de empréstimo, normalização de texto etc.)
```

## Como executar localmente

Pré-requisitos: Node.js instalado.

```bash
npm install
npm run dev
```

A aplicação ficará disponível em `http://localhost:5173` (porta padrão do Vite).

### Outros scripts

- `npm run build` — gera o build de produção
- `npm run lint` — executa o ESLint
- `npm run preview` — pré-visualiza o build de produção localmente

## Documentação adicional

O arquivo [DESIGN.md](./DESIGN.md) reúne as decisões de design e arquitetura do projeto, além do histórico de alterações.
