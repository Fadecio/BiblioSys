# Spec — Sistema de Biblioteca Escolar

## 1. Visão geral

Aplicação web para gestão da biblioteca de uma escola pública municipal. Uso interno
(bibliotecário/gestão escolar), não é um app para o aluno acessar diretamente — o aluno
é o *dado* central do sistema (quem pega livro emprestado), não o usuário logado.

**Objetivo do projeto (contexto pessoal):** peça de portfólio para demonstrar domínio de
React + TypeScript com um caso de uso real, modelagem de dados limpa e regras de negócio
não triviais (cálculo de atraso/vencimento) — bom material pra falar em entrevista técnica.

## 2. Público-alvo do sistema (dados gerenciados)

- Alunos de uma escola pública municipal, organizados por **turma** e **série**.
- Volume esperado: escola de porte pequeno/médio (algumas centenas de alunos, acervo de
  algumas centenas a poucos milhares de livros).
- Quem opera o sistema: bibliotecário(a) ou funcionário da secretaria. Sem hierarquia de
  permissões no MVP (v1 é single-user, sem login).

## 3. Referência visual

O print enviado (Smart Library) serve de inspiração pro *dashboard*: cards de contadores
no topo, donut/bar charts, sidebar de navegação. Pra V1 vamos simplificar bastante — sem
multi-escola, sem chat, sem reservas, sem eBooks. Só o essencial:

- Cards: alunos, livros, empréstimos ativos, atrasados, a vencer
- Gráfico: livros mais procurados
- Sidebar simples: Dashboard / Alunos / Livros / Empréstimos

## 4. Stack técnica

| Camada | Escolha | Motivo |
|---|---|---|
| Build | Vite | rápido, padrão pra React+TS sem framework fullstack |
| UI | React 18 + TypeScript | seu stack atual |
| Estilo | TailwindCSS + shadcn/ui | componentes prontos e acessíveis (Radix por baixo) |
| Gráficos | Recharts | leve, boa integração com Tailwind |
| Roteamento | React Router DOM | simples e suficiente pro escopo |
| Datas | date-fns | cálculo de prazos/atrasos sem dor de cabeça |
| Persistência (V1) | `localStorage`, atrás de uma camada `services/` | permite trocar por API real na V2 sem tocar na UI |
| Estado | Context API + hooks customizados | Zustand/Redux não se justificam no tamanho do MVP |

## 5. Escopo do MVP (V1 — simplicidade primeiro)

**Entra:**
- CRUD de Aluno (nome, turma, série)
- CRUD de Livro (título, autor, categoria, código, quantidade)
- Registro de Empréstimo (aluno + livro + data prevista de devolução)
- Registro de Devolução
- Renovação de empréstimo (com limite de renovações)
- Cálculo automático de status: em dia / a vencer / atrasado
- Dashboard com contadores e gráfico de livros mais procurados

**Fica pra depois (V2+):** login/autenticação, backend real, notificações automáticas,
relatórios exportáveis, histórico avançado, multi-perfil. Ver seção 9.

## 6. Modelagem de dados

```ts
interface Aluno {
  id: string
  nome: string
  turma: string
  serie: string
  matricula?: string
  criadoEm: string
}

interface Livro {
  id: string
  titulo: string
  autor: string
  categoria: string
  codigo: string
  quantidadeTotal: number
  quantidadeDisponivel: number
}

interface Emprestimo {
  id: string
  alunoId: string
  livroId: string
  dataEmprestimo: string
  dataPrevistaDevolucao: string
  dataDevolucao?: string
  status: 'ativo' | 'devolvido' | 'atrasado'
  renovacoes: number
}
```

`status` do empréstimo é sempre **derivado**, nunca editado manualmente — evita
inconsistência entre o dado salvo e a data atual.

## 7. Regras de negócio

- **Prazo padrão de empréstimo:** 7 dias corridos (constante configurável, ex.
  `PRAZO_PADRAO_DIAS`).
- **Status "a vencer":** empréstimo ativo, faltam ≤ 2 dias pra `dataPrevistaDevolucao`.
- **Status "atrasado":** empréstimo ativo, `hoje > dataPrevistaDevolucao`.
- **Ao emprestar:** bloquear se `quantidadeDisponivel === 0`; decrementar em 1 ao confirmar.
- **Ao devolver:** `status = 'devolvido'`, `dataDevolucao = hoje`, `quantidadeDisponivel += 1`.
- **Livro mais procurado:** contagem de empréstimos (todos, não só ativos) agrupados por
  `livroId`, ordenado desc, top 5–10 no gráfico.
- **Renovação:** botão "Renovar" disponível por empréstimo, com a seguinte condição:
  - Só aparece habilitado se `status !== 'atrasado'` (livro atrasado precisa ser devolvido
    primeiro, não renovado — evita atraso indefinido).
  - Sem limite de quantidade de renovações — o aluno pode renovar quantas vezes quiser,
    desde que o empréstimo esteja em dia.
  - Ao renovar: `dataPrevistaDevolucao = dataPrevistaDevolucao + PRAZO_PADRAO_DIAS` e
    `renovacoes += 1` (campo mantido só como contador informativo, sem afetar regra).
    Não mexe em `quantidadeDisponivel` do livro (o exemplar continua emprestado).

## 8. Telas

| Rota | Conteúdo |
|---|---|
| `/dashboard` | Cards (alunos, livros, ativos, atrasados, a vencer) + gráfico de mais procurados |
| `/alunos` | Lista + busca + criar/editar/excluir |
| `/livros` | Lista + busca + criar/editar/excluir |
| `/emprestimos` | Lista de empréstimos com filtro por status (todos/ativos/atrasados/a vencer), ação de registrar novo, devolver e **renovar** (por linha, respeitando as regras de renovação) |

Aviso de atrasados/a vencer aparece tanto no card do dashboard (contador + destaque de cor)
quanto como filtro rápido na tela de empréstimos.

## 9. Roadmap de evolução

**V2 — escalar:**
- Backend real (Node/Express + banco, ou Supabase) substituindo o `localStorage`
- Autenticação simples (login do bibliotecário)
- Notificação automática de atraso (e-mail)
- Histórico de empréstimos por aluno
- Exportar relatório (PDF/Excel)

**V3 — polimento de portfólio:**
- Responsivo completo / PWA
- Testes automatizados (Vitest + Testing Library)
- Modo escuro
- Filtros avançados de busca

## 10. Estrutura de pastas (V1)

```
src/
  components/
    ui/            # shadcn
    layout/
    alunos/
    livros/
    emprestimos/
    dashboard/
  hooks/
    useAlunos.ts
    useLivros.ts
    useEmprestimos.ts
  services/
    storage.ts     # abstração sobre localStorage
  types/
    index.ts
  utils/
    emprestimo.ts  # cálculo de status, prazos
  pages/
  App.tsx
  main.tsx
DESIGN.md
spec.md
```

## 11. Convenções de código

Mantendo o padrão que você já usa: sem ponto-e-vírgula, `const` + arrow functions,
handlers prefixados com `handle`, retorno antecipado, commits convencionais
(`feat`/`fix`), nomes de variáveis em português.

## 12. Checklist de "pronto pra portfólio"

- [ ] README com prints e explicação das decisões técnicas
- [ ] `spec.md` (este arquivo) e `DESIGN.md` versionados no repo
- [ ] Regras de negócio testáveis isoladas em `utils/` (fácil de explicar em entrevista)
- [ ] Sem `any` no TypeScript
- [ ] Dados de exemplo (seed) pra demo funcionar sem input manual