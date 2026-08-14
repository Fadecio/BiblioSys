---
name: auto-commit
description: Cria commits Git profissionais seguindo Conventional Commits, analisando as alterações (git status, git diff) antes de commitar, checando arquivos sensíveis (.env, chaves, credenciais) e organizando o histórico para apresentação em portfólio. Use sempre que o usuário pedir para "fazer o commit", "commitar as alterações", "salvar no Git", "preparar o commit" ou "registrar as alterações" — e também quando uma tarefa acabar de ser concluída e o usuário já tiver combinado commits automáticos. Nunca faz push sozinha: push só acontece se pedido explicitamente.
---

# Auto Commit

## Objetivo

Analisar as alterações de um projeto e criar commits Git seguindo **Conventional Commits**, mantendo um histórico organizado, legível e adequado para apresentação profissional — o tipo de histórico que um recrutador ou outro dev consegue entender só de olhar o `git log`.

Um commit bom conta a história de *por que* algo mudou, não só *que* algo mudou. Por isso a análise (`git status`, `git diff`) sempre vem antes da mensagem: sem entender a alteração, não dá pra escrever uma mensagem que realmente a descreva.

---

## Fluxo de trabalho

1. **Ver o estado do repositório**
   ```bash
   git status --short
   git branch --show-current
   ```
   Se não houver nada para commitar, informe isso e pare — nunca use `git commit --allow-empty` para forçar um commit vazio.

2. **Entender o que mudou**
   ```bash
   git diff
   git diff --stat
   git diff --name-only
   ```
   O objetivo aqui é conseguir explicar a alteração em uma frase antes de escrever a mensagem — se isso não for possível, vale olhar os arquivos com mais calma.

3. **Checar arquivos sensíveis**
   Procure por `.env`, `.env.local`, `.env.*`, `*.pem`, `*.key`, `credentials.json`, `secrets.json` ou qualquer coisa que pareça um segredo, token ou senha. Esses arquivos nunca entram no commit — se algum já estiver sendo rastreado pelo Git, avise o usuário em vez de resolver silenciosamente.

4. **Avaliar o escopo**
   Alterações que servem ao mesmo propósito (ex.: botão de cadastro + validação + mensagem de sucesso) podem virar um único commit. Alterações sem relação entre si (ex.: cadastro de livros + README + config do ESLint) tendem a ficar mais claras em commits separados — quando notar isso, pergunte ao usuário antes de dividir.

5. **Adicionar os arquivos**
   Prefira listar os arquivos explicitamente (`git add arquivo1 arquivo2`) em vez de `git add .`, especialmente se houver risco de pegar algo fora do escopo da tarefa. `git add .` é aceitável quando todas as alterações pertencem claramente à mesma tarefa.

6. **Conferir o staging**
   ```bash
   git diff --cached --stat
   ```
   Confirme que só o que era esperado está staged antes de seguir.

7. **Criar o commit**
   ```bash
   git commit -m "tipo(escopo): descrição"
   ```

8. **Confirmar o resultado**
   ```bash
   git status --short
   git log -1 --oneline
   ```
   Reporte o resultado ao usuário no formato descrito em "Confirmação final".

---

## Regras de segurança

Estas regras existem porque um commit malfeito é fácil de corrigir, mas um `push` de segredo, um `reset --hard` ou um histórico reescrito sem querer podem ser difíceis (ou impossíveis) de desfazer. Por isso, sem autorização explícita do usuário, esta skill nunca:

- executa `git push`
- executa `git reset --hard`, `git clean -fd` ou qualquer coisa que apague trabalho do usuário
- adiciona `.env` ou outros arquivos sensíveis ao commit
- ignora hooks com `git commit --no-verify`
- reescreve histórico (`git rebase` interativo, `git commit --amend` em commits já compartilhados)
- cria commits vazios ou altera código só para "ter algo pra commitar"

Push só acontece quando o usuário pede depois, explicitamente (ex.: "agora pode fazer o push").

---

## Padrão da mensagem: Conventional Commits

```
tipo(escopo): descrição
```

| Tipo | Quando usar | Exemplo |
|---|---|---|
| `feat` | nova funcionalidade | `feat(books): adiciona cadastro de livros` |
| `fix` | correção de bug | `fix(login): corrige validação da senha` |
| `refactor` | reorganização sem mudar comportamento | `refactor(api): reorganiza serviço de requisições` |
| `style` | mudança puramente visual/formatação | `style(header): ajusta espaçamento do cabeçalho` |
| `docs` | documentação | `docs(readme): atualiza instruções de instalação` |
| `test` | criação/alteração de testes | `test(books): adiciona testes para cadastro` |
| `chore` | manutenção geral | `chore(deps): atualiza dependências` |
| `perf` | melhoria de performance | `perf(search): otimiza filtro de livros` |
| `build` | build ou dependências de build | `build(vite): ajusta configuração de produção` |
| `ci` | integração/entrega contínua | `ci(github): adiciona workflow de deploy` |

**Escopos comuns neste tipo de projeto:** `auth`, `login`, `users`, `books`, `authors`, `dashboard`, `ui`, `api`, `database`, `components`, `hooks`, `styles`, `config`, `docs` — use o que fizer sentido para o projeto, não precisa se limitar a essa lista.

**A mensagem deve:**
- estar no presente ("adiciona", não "adicionado")
- ser curta e objetiva, sem ponto final
- descrever o que mudou de forma específica

**Evite:**
- `update`, `mudanças`, `corrigido` (não dizem nada)
- `feat: fiz várias alterações no sistema de livros` (vago demais, deveria ser dividido ou especificado)

---

## Tratamento de erros

| Situação | O que fazer |
|---|---|
| Nada para commitar | Informar: "Não há alterações para criar um commit." Não usar `--allow-empty`. |
| Arquivos não rastreados | Analisar antes de adicionar — não adicionar arquivos suspeitos automaticamente. |
| Conflito ou merge/rebase em andamento | Não tentar resolver sozinho. Explicar a situação ao usuário e pedir orientação. |
| Commit falha por hook (`pre-commit`, `lint`, `test`, `typecheck`) | Reportar o erro. Não usar `--no-verify` a menos que o usuário peça explicitamente. |

---

## Confirmação final

Depois do commit, sempre responder de forma objetiva usando este formato:

```
Commit criado com sucesso.

Commit: feat(books): adiciona cadastro de livros
Hash: a1b2c3d
Push: não realizado
```