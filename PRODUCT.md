# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Bibliotecária ou responsável pela biblioteca escolar, operando em um computador fixo dentro da escola. Usuária única por sessão; não há auto-atendimento de alunos nem acesso remoto frequente. O fluxo é presencial: aluno chega ao balcão, a bibliotecária registra o empréstimo ou devolução.

## Product Purpose

BiblioSys gerencia o acervo e os empréstimos de uma biblioteca escolar: cadastro de alunos, livros e empréstimos; controle de disponibilidade; dashboard com indicadores consolidados e gráfico dos livros mais procurados. Sucesso significa que a bibliotecária consegue registrar, renovar e devolver empréstimos rapidamente, sem erro e sem precisar manter planilhas paralelas.

## Positioning

Ferramenta interna de gestão feita especificamente para a rotina da biblioteca da escola — não é um catálogo público nem um sistema genérico de ERP. A proximidade com o fluxo real (empréstimo por aluno/série/turma, status calculado automaticamente, bloqueio de exclusão com empréstimo ativo) é o que o diferencia de adaptações genéricas.

## Operating Context

- Computador desktop ou laptop fixo na escola (tela >= 1024 px é o cenário primário; mobile existe mas é acesso eventual, não a operação principal).
- Conexão com Supabase para persistência (dados compartilhados entre dispositivos da escola).
- Dois usuários autenticados: `fadeciolemos@gmail.com` e `bibliotecamirtes@gmail.com`, ambos com role `librarian`.
- Acervo real em uso: alunos agrupados por série e turma; livros com código próprio separado de ISBN; prazo padrão de empréstimo de 7 dias.

## Capabilities and Constraints

- **CRUD completo:** alunos (nome, série, turma, matrícula gerada automaticamente), livros (título, autor, categoria, código, ISBN, quantidade total/disponível), empréstimos (registrar, renovar, devolver, editar data).
- **Status de empréstimo calculado:** sempre derivado da data atual — nunca lido de um campo salvo. Quatro estados: em dia, a vencer (<=3 dias), atrasado, devolvido.
- **Busca tolerante a acentos e variações ordinais** (`normalizarTexto` via NFD + remoção de `º/°/ª`).
- **Sem auto-atendimento de alunos:** o sistema é 100% operado pela bibliotecária.
- **Sem relatórios de exportação** por enquanto (roadmap V3+ no spec original).
- **Sem modo escuro** implementado (roadmap V3 no spec original).
- **Stack:** React 19 + TypeScript, Vite, Tailwind CSS + shadcn/ui (Radix), Recharts, React Router, date-fns, Supabase (PostgreSQL + RLS + funções PL/pgSQL).

## Brand Commitments

- Nome do produto: **BiblioSys** (sem subtítulo ou nome de escola vinculado).
- Sem logotipo, identidade visual ou cor de marca definidos — o sistema de design atual é "utilitário limpo" (zinc + blue-600), escolhido explicitamente pelo usuário na implementação inicial, mas aberto a redesign completo conforme decisão registrada neste init.

## Evidence on Hand

- Codebase completa em produção: React SPA com Supabase, deployada no Vercel (`vercel.json` presente).
- `docs/DESIGN.md`: histórico detalhado de todas as decisões técnicas e de design desde o MVP.
- `supabase/migrations/`: 14 migrations documentadas (schema, RLS, funções, seed).
- Dados reais de alunos, livros e empréstimos já registrados no Supabase de produção.
- Sem logotipo, sem guia de marca, sem imagens oficiais da escola.

## Product Principles

1. **A rotina da bibliotecária é a medida de tudo.** Qualquer adição de complexidade visual ou funcional deve ser justificada pelo que ela faz em um dia de trabalho real — não pelo que parece sofisticado.
2. **Dado correto antes de dado bonito.** Status calculado, bloqueios de integridade e validações inline existem porque a ferramenta é operacional — um erro de empréstimo tem consequência real no acervo.
3. **Velocidade de operação.** Registrar um empréstimo ou devolução deve exigir o mínimo de cliques; o design deve privilegiar densidade de informação e ação imediata sobre expressão visual.
4. **Coerência acima de originalidade.** Componentes, padrões de formulário e feedback de erro devem ser idênticos em todas as telas — a bibliotecária não deve reaprender a interação a cada página.
5. **Escala humana.** O acervo é de uma escola, não de uma rede; o design pode ser expressivo e com identidade sem precisar ser "enterprise".

## Accessibility & Inclusion

Nenhum requisito de acessibilidade específico registrado. Os componentes shadcn/ui (Radix) proveem acessibilidade via teclado e ARIA por padrão — manter esse piso nos trabalhos futuros.
