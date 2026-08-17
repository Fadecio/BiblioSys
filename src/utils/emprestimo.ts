import { addDays, differenceInCalendarDays, format, isAfter, parseISO, startOfDay } from 'date-fns'
import type { Emprestimo, Livro, StatusEmprestimo } from '@/types'

export const PRAZO_PADRAO_DIAS = 7

export type StatusExibicao = 'em-dia' | 'a-vencer' | 'atrasado' | 'devolvido'

// loan_date/due_date/return_date são colunas `date` do Postgres ("2026-08-17", sem hora/fuso).
// new Date(...) interpreta esse formato como meia-noite UTC, o que em fusos atrás de UTC
// (ex.: Brasil, UTC-3) "voltava" um dia ao formatar/comparar na hora local. parseISO trata a
// mesma string como meia-noite local, então a data calendário fica sempre correta.
export const calcularDataPrevista = (dataEmprestimo: string) =>
  format(addDays(parseISO(dataEmprestimo), PRAZO_PADRAO_DIAS), 'yyyy-MM-dd')

// status é sempre derivado da data atual, nunca lido como fonte de verdade (spec §6)
export const derivarStatus = (emprestimo: Emprestimo): StatusEmprestimo => {
  if (emprestimo.dataDevolucao) return 'devolvido'

  const hoje = startOfDay(new Date())
  const prevista = startOfDay(parseISO(emprestimo.dataPrevistaDevolucao))

  if (isAfter(hoje, prevista)) return 'atrasado'
  return 'ativo'
}

// refina 'ativo' em 'a-vencer' quando faltam <= 2 dias (spec §7); uso exclusivo de UI (badge/filtro/cards)
export const statusExibicao = (emprestimo: Emprestimo): StatusExibicao => {
  const status = derivarStatus(emprestimo)
  if (status !== 'ativo') return status

  const hoje = startOfDay(new Date())
  const prevista = startOfDay(parseISO(emprestimo.dataPrevistaDevolucao))
  const diasRestantes = differenceInCalendarDays(prevista, hoje)

  return diasRestantes <= 2 ? 'a-vencer' : 'em-dia'
}

export const podeRenovar = (emprestimo: Emprestimo) => derivarStatus(emprestimo) === 'ativo'

export const renovarEmprestimo = (emprestimo: Emprestimo): Emprestimo => ({
  ...emprestimo,
  dataPrevistaDevolucao: format(
    addDays(parseISO(emprestimo.dataPrevistaDevolucao), PRAZO_PADRAO_DIAS),
    'yyyy-MM-dd',
  ),
  renovacoes: emprestimo.renovacoes + 1,
})

export interface LivroProcurado {
  livroId: string
  titulo: string
  total: number
}

// conta todos os empréstimos (inclusive devolvidos), agrupados por livro (spec §7)
export const livrosMaisProcurados = (
  emprestimos: Emprestimo[],
  livros: Livro[],
  top = 5,
): LivroProcurado[] => {
  const contagem = new Map<string, number>()
  for (const emprestimo of emprestimos) {
    contagem.set(emprestimo.livroId, (contagem.get(emprestimo.livroId) ?? 0) + 1)
  }

  return Array.from(contagem.entries())
    .map(([livroId, total]) => ({
      livroId,
      titulo: livros.find((livro) => livro.id === livroId)?.titulo ?? 'Livro removido',
      total,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, top)
}
