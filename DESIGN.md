# DESIGN.md — Decisões de design e arquitetura do BiblioSys

Este arquivo documenta **o porquê** de cada decisão técnica e de design tomada no
projeto — não repete o que já está em `spec.md` (escopo, modelagem, regras de
negócio), mas explica as escolhas feitas em cima dele, principalmente onde o
spec deixou espaço de decisão (como o sistema de design) ou onde precisei
inferir algo que o spec não cobria explicitamente.

**Como este arquivo funciona:** é um log vivo. Toda vez que o projeto for
implementado ou alterado de forma relevante, uma nova entrada é adicionada na
seção [Histórico de alterações](#histórico-de-alterações), no topo. As seções
de referência (stack, design system, modelagem) são atualizadas in-place
quando a decisão que descrevem muda.

---

## Stack técnica

Segue exatamente a tabela do `spec.md` §4 — Vite, React + TypeScript,
Tailwind + shadcn/ui, Recharts, React Router, date-fns, `localStorage` atrás
de `services/`, Context API + hooks customizados. Nenhuma lib fora dessa
lista foi adicionada sem justificar:

| Decisão | Motivo |
|---|---|
| React 19 (spec cita React 18) | O scaffold do Vite já veio com React 19.2.8. Nenhuma regra do MVP depende de API exclusiva do React 18 — trocar geraria trabalho sem ganho. Desvio consciente, não um erro. |
| shadcn/ui via CLI oficial (`npx shadcn@latest`) | Mais confiável que copiar componentes de memória — garante acessibilidade via Radix e evita bugs sutis de versão. |
| `lucide-react` para ícones | É o ícone padrão oficial do shadcn/ui, já vem como transitiva da escolha de stack — não é dependência extra não justificada. |
| Sem react-hook-form / zod | Não estão na lista de stack do spec. Formulários são `useState` controlado + validação manual simples. |
| Sem lib de toast | Idem. Feedback de ações é inline (mensagem no formulário, `AlertDialog` do shadcn pra confirmação de exclusão). |
| `@radix-ui` (via shadcn) para o menu mobile (`sheet`) | Mesma origem dos componentes já usados — não é uma lib nova, é outro primitivo do mesmo sistema. |
| `Popover` do pacote `radix-ui` (já dependência, sem instalar nada novo) para o combobox de busca em Aluno/Livro do empréstimo | Evita adicionar `cmdk` (lib do combobox "oficial" do shadcn) só pra isso — o filtro em si é `Array.filter` + `normalizarTexto`, reaproveitando o padrão de busca já usado em Livros/Alunos. |

## Sistema de design ("Utilitário limpo")

Escolhido explicitamente pelo usuário entre 3 direções propostas (utilitário
limpo / minimalista editorial / industrial-tático), rejeitando os guias de
estilo "anti-slop" pra landing page que já estavam no repo
(`.agents/skills/*`) por não se aplicarem a um dashboard interno.

- **Paleta base:** neutra `zinc` (bg `zinc-50`, superfície branca, bordas
  `zinc-200`, texto `zinc-900`/`zinc-500`). Sem modo escuro (é V3 no roadmap
  do spec, não implementado).
- **Acento único:** `blue-600`, aplicado editando só `--primary`/`--ring` no
  `index.css` — assim todo componente shadcn herda o acento automaticamente.
- **Cores semânticas de status** (zinc/âmbar/vermelho) — justificadas pelo
  spec §8, que exige "destaque de cor" pra atrasado/a vencer; não são cores
  inventadas.
- **Tipografia:** stack sans nativo do sistema operacional, sem webfont
  customizada. O preset padrão do shadcn (`Nova`) veio com a fonte `Geist`
  via `@fontsource-variable/geist` — removi essa dependência porque uma
  ferramenta interna de biblioteca escolar não precisa de identidade visual
  de marca, e é uma dependência a menos pra manter.
- **Raio de borda:** único valor consistente (`rounded-md`, default do
  shadcn) em todos os componentes.
- **Densidade:** moderada — paddings default do shadcn, sem customização
  extra (tabelas de dados precisam respirar menos que uma landing page).

## Modelagem de dados e regras de negócio

`types/index.ts` é cópia fiel do spec §6 — nenhum campo foi adicionado ou
removido.

- **Status do empréstimo nunca é lido do valor salvo.** `derivarStatus()`
  (`utils/emprestimo.ts`) recalcula sempre a partir da data atual (spec §6).
  O hook `useEmprestimos` já devolve a lista com o status recalculado, então
  nenhuma tela corre risco de mostrar um status desatualizado.
- **`statusExibicao()`** é um conceito só de UI
  (`em-dia | a-vencer | atrasado | devolvido`), separado do tipo `status` da
  interface — porque "a vencer" é uma nuance de exibição do spec §7, não um
  valor do union type persistido.
- **Única regra inferida (não coberta pelo spec):** o que acontece ao editar
  `quantidadeTotal` de um livro já existente. Resolvido ajustando
  `quantidadeDisponivel` pelo mesmo delta (nunca abaixo de zero) — é a única
  forma de manter os dois campos que o spec já define consistentes entre si,
  sem inventar campo novo.

## Estrutura de pastas e padrões de código

Segue exatamente `spec.md` §10. Um detalhe de implementação: cada hook
(`useAlunos.tsx`, `useLivros.tsx`, `useEmprestimos.tsx`) contém o Context, o
Provider e o hook no mesmo arquivo — assim bate com a estrutura de pastas do
spec (`hooks/useAlunos.ts`) sem precisar criar uma pasta `context/` que o
spec não pede. O ESLint (`react-refresh/only-export-components`) reclama
desse padrão, mas os próprios arquivos gerados pelo shadcn (`button.tsx`,
`badge.tsx`, `tabs.tsx`) têm o mesmo "problema" — é uma limitação conhecida
da regra com esse padrão, documentada com `eslint-disable` explicando o
motivo em cada ocorrência.

## Responsividade

A sidebar era fixa (240px, sempre visível) sem nenhum tratamento pra telas
menores. Resolvido com o que já estava disponível no stack (shadcn/ui +
Radix), sem introduzir nenhuma lib nova:

- Componente `sheet` do shadcn adicionado pra servir de gaveta lateral em
  mobile.
- `SidebarConteudo` extraído pra ser reaproveitado tanto na sidebar fixa de
  desktop quanto dentro da gaveta mobile — sem duplicar a navegação.
- `Sidebar` vira `hidden md:flex` (só aparece a partir de 768px); abaixo
  disso, `MobileNav` mostra uma barra fina no topo com botão de menu (☰) que
  abre a gaveta — fecha sozinha ao clicar num link.
- Cabeçalhos de página, grids de formulário e abas de filtro empilham em
  coluna abaixo do breakpoint `sm:`.
- Gráfico "livros mais procurados" e tabelas rolam horizontalmente
  (`overflow-x-auto`) em vez de espremer o conteúdo — padrão consistente em
  todo o app pra dado tabular/denso em telas estreitas.

---

## Histórico de alterações

### 2026-08-11 — Busca por nome nos campos de aluno/livro do empréstimo
- **Pedido:** no cadastro de empréstimo, tanto o campo de aluno quanto o de
  livro precisavam permitir digitar o nome pra encontrar mais fácil na
  lista — os `Select` simples do shadcn não têm busca embutida.
- **Implementação:** criado `ui/popover.tsx` (primitivo `Popover` do pacote
  `radix-ui`, já dependência do projeto) e `ui/combobox.tsx`, um combobox
  genérico (trigger + campo de busca + lista filtrada, com opção
  `disabled` por item) reutilizado nos dois campos de
  `EmprestimoForm.tsx`. A busca usa `normalizarTexto` (mesma função de
  Livros/Alunos, tolerante a acento/caixa) sobre nome+turma+matrícula do
  aluno e título+autor+código do livro. Testado no navegador (Playwright):
  abrir o combobox, filtrar, selecionar e enviar o formulário funcionam
  sem erros de console.
- **Por que não usei o combobox "oficial" do shadcn:** ele depende da lib
  `cmdk`, fora da stack do spec. Como o volume de itens é pequeno
  (dezenas, não milhares), um filtro simples com `Array.filter` sobre o
  `Popover` já existente resolve sem dependência nova.

### 2026-08-11 — Truncar texto longo nas colunas de nome/título/autor
- **Sintoma:** em Livros e Alunos, um título, autor ou nome de aluno muito
  longo forçava a coluna a crescer, estourando a largura da tabela e
  criando uma barra de rolagem horizontal — a `TableCell` base usa
  `whitespace-nowrap` sem limite de largura.
- **Correção:** adicionado `max-w-60`/`max-w-45` (Título/Autor em
  `LivroTable.tsx`, Nome em `AlunoTable.tsx`) combinado com `truncate`
  (ellipsis) nas células e no `TableHead` correspondente, para que o texto
  seja cortado com "…" em vez de expandir a coluna. Adicionado atributo
  `title` nativo na célula para mostrar o texto completo ao passar o mouse,
  já que não há lib de tooltip na stack.

### 2026-08-11 — Numeração dos livros na tabela
- **Pedido:** além da ordenação alfabética por título já existente, o usuário
  pediu uma numeração visível para ter controle da quantidade de títulos
  cadastrados.
- **Implementação:** adicionada coluna "Nº" em `LivroTable.tsx`, exibindo a
  posição sequencial (`index + 1`) de cada linha — a numeração segue a ordem
  já aplicada em `LivrosPage.tsx` (alfabética por título, `localeCompare`
  pt-BR), então reflete a lista filtrada/ordenada atual, não um ID fixo do
  livro. Adicionado também um contador de total de títulos ("N títulos") no
  cabeçalho da página, ao lado da descrição.

### 2026-08-09 — Correção: gráfico do dashboard "piscando" ao carregar
- **Sintoma:** o gráfico "livros mais procurados" nascia visivelmente menor e
  "saltava" pro tamanho final logo após o carregamento — introduzido pela
  correção de responsividade anterior (a div extra com `min-w-[480px]`
  amplificou um comportamento que já existia no `ResponsiveContainer` do
  Recharts, que só descobre o tamanho real do container de forma assíncrona
  via `ResizeObserver`, depois do primeiro paint).
- **Causa raiz completa (duas causas empilhadas):** (1) o `ResponsiveContainer`
  realmente media o container errado no primeiro frame (confirmado até no
  build de produção via `vite preview`, não era só um artefato do
  StrictMode); (2) por cima disso, a animação de entrada padrão do Recharts
  (`isAnimationActive`, barras crescendo da esquerda) fazia o efeito parecer
  ainda mais quebrado.
- **Correção:** substituí o `ResponsiveContainer` por uma medição própria do
  container via `useLayoutEffect` + `ResizeObserver` (mede antes do
  navegador pintar a tela, então o primeiro frame já nasce com o tamanho
  final) e desliguei a animação de entrada da barra (`isAnimationActive=
  {false}`) — juntas, essas duas mudanças eliminam qualquer variação visível
  no carregamento.
- **Verificação:** testado em produção (`vite preview`) com 3 execuções
  seguidas + navegação via SPA (não só reload direto) + viewport mobile —
  em todos os casos as barras nascem direto com a largura e proporção
  finais corretas, sem nenhum passo intermediário visível.

### 2026-08-09 — Responsividade mobile/tablet
- Sidebar fixa virou `hidden md:flex`; navegação mobile passou a usar o
  componente `sheet` do shadcn como gaveta lateral, com `MobileNav` novo.
- `SidebarConteudo` extraído de `Sidebar.tsx` pra reaproveitamento entre
  desktop e mobile.
- Cabeçalhos de `AlunosPage`, `LivrosPage`, `EmprestimosPage` e os grids de
  `AlunoForm`/`LivroForm` passaram a empilhar em coluna abaixo de `sm:`.
- `EmprestimosPage`: `TabsList` ganhou `overflow-x-auto` como rede de
  segurança em telas muito estreitas.
- `GraficoMaisProcurados`: eixo Y de largura fixa (180px) espremia demais em
  mobile; o card agora rola horizontalmente com uma largura mínima interna.
- Testado em 375px (mobile), 820px (tablet) e desktop via Chromium headless
  (Playwright) — build e lint seguem limpos.

### 2026-08-09 — Correção de 6 bugs encontrados em revisão de código
Uma revisão de código completa (agente em segundo plano) encontrou 6 problemas
reais, todos corrigidos:
- **Exclusão de aluno/livro não bloqueava empréstimo ativo vinculado** —
  `useEmprestimos` ganhou `alunoTemEmprestimoAtivo`/`livroTemEmprestimoAtivo`;
  `AlunoTable`/`LivroTable` agora desabilitam o botão excluir (com `title`
  explicando o motivo) quando há empréstimo em aberto. Isso também elimina o
  sintoma secundário de "devolver" um empréstimo cujo livro já foi excluído
  silenciosamente não restaurar a disponibilidade — o cenário não pode mais
  acontecer.
- **Reduzir `quantidadeTotal` de um livro abaixo do que já está emprestado
  não era validado** — `LivroForm` agora bloqueia com erro inline se o novo
  total for menor que `quantidadeTotal - quantidadeDisponivel` do registro
  original.
- **Busca em Alunos/Livros não ignorava acentos** — criado
  `utils/texto.ts` (`normalizarTexto`, via `NFD` + remoção de marcas
  diacríticas `\p{Mn}` + lowercase) e aplicado nos dois filtros; "sitio"
  agora encontra "Sítio do Picapau Amarelo".
- **`AlunoForm`/`LivroForm` não resetavam ao trocar de item editado
  rapidamente** — adicionado `key={item?.id ?? 'novo'}` nos dois formulários
  dentro dos respectivos `Dialog`, forçando remount ao trocar de alvo.
- **`storage.ts` derrubava a aplicação inteira com dado corrompido no
  localStorage** — `JSON.parse` envolvido em `try/catch`, degradando pra
  lista vazia em vez de quebrar a tela toda.
- **`EmprestimoTable` usava `alert()` nativo** pra erros de renovar/devolver,
  inconsistente com o padrão inline do resto do app — trocado por um
  parágrafo de erro (`text-destructive`) acima da tabela, no mesmo estilo
  usado nos formulários.
- **Efeito colateral descoberto durante a correção:** os inputs `type=
  "number"` com `min` disparavam a validação **nativa** do navegador antes
  do meu próprio `onSubmit` rodar, bloqueando o envio silenciosamente sem
  nunca chegar a mostrar a mensagem de erro customizada (`total < 1`).
  Adicionado `noValidate` nos três formulários (`AlunoForm`, `LivroForm`,
  `EmprestimoForm`) pra garantir que só a validação em JS (inline,
  consistente) seja usada — nunca o balão nativo do navegador.
- **Verificação:** cada correção testada isoladamente via Chromium headless
  contra o build de produção (bloqueio de exclusão, validação de
  quantidade com 2 empréstimos simultâneos forçados via UI, busca sem
  acento, reset de formulário trocando de item, localStorage corrompido
  propositalmente, ausência de diálogos nativos). Build e lint limpos.

### 2026-08-09 — Correção: gráfico do dashboard "piscando" ao carregar
- **Sintoma:** o gráfico "livros mais procurados" nascia visivelmente menor e
  "saltava" pro tamanho final logo após o carregamento — introduzido pela
  correção de responsividade anterior (a div extra com `min-w-[480px]`
  amplificou um comportamento que já existia no `ResponsiveContainer` do
  Recharts, que só descobre o tamanho real do container de forma assíncrona
  via `ResizeObserver`, depois do primeiro paint).
- **Causa raiz completa (duas causas empilhadas):** (1) o `ResponsiveContainer`
  realmente media o container errado no primeiro frame (confirmado até no
  build de produção via `vite preview`, não era só um artefato do
  StrictMode); (2) por cima disso, a animação de entrada padrão do Recharts
  (`isAnimationActive`, barras crescendo da esquerda) fazia o efeito parecer
  ainda mais quebrado.
- **Correção:** substituí o `ResponsiveContainer` por uma medição própria do
  container via `useLayoutEffect` + `ResizeObserver` (mede antes do
  navegador pintar a tela, então o primeiro frame já nasce com o tamanho
  final) e desliguei a animação de entrada da barra (`isAnimationActive=
  {false}`) — juntas, essas duas mudanças eliminam qualquer variação visível
  no carregamento.
- **Verificação:** testado em produção (`vite preview`) com 3 execuções
  seguidas + navegação via SPA (não só reload direto) + viewport mobile —
  em todos os casos as barras nascem direto com a largura e proporção
  finais corretas, sem nenhum passo intermediário visível.

### 2026-08-09 — Implementação inicial do MVP (V1)
- Setup: alias `@/*`, shadcn/ui inicializado (preset Nova + base Radix),
  componentes `button/input/label/select/dialog/alert-dialog/table/badge/
  card/tabs` adicionados; `react-router-dom`, `date-fns`, `recharts`
  instalados.
- Sistema de design "utilitário limpo" aplicado (ver seção acima);
  dependência de webfont (`@fontsource-variable/geist`) removida.
- `types/index.ts`, `utils/emprestimo.ts` (regras de status/renovação/
  ranking), `services/storage.ts` (camada sobre `localStorage` + seed de
  demonstração cobrindo os 4 estados de empréstimo e um livro com 0
  exemplares disponíveis) criados.
- Hooks `useAlunos`, `useLivros`, `useEmprestimos` (Context + hook
  customizado por arquivo) implementados, com `useEmprestimos` orquestrando
  `useLivros` pra decrementar/incrementar disponibilidade.
- Telas construídas: `DashboardPage` (cards + gráfico Recharts),
  `AlunosPage`/`LivrosPage` (CRUD com busca), `EmprestimosPage` (registrar,
  devolver, renovar, filtro por status).
- Build (`tsc -b && vite build`) e `npm run lint` limpos (exceto 3 achados
  pré-existentes em arquivos gerados pelo shadcn, não modificados). Fluxo
  completo testado via Chromium headless (Playwright): CRUD de aluno/livro,
  bloqueio de empréstimo com disponibilidade zero, filtros de status,
  registrar/renovar/devolver com atualização correta de disponibilidade.
