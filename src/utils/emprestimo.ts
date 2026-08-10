import { addDays, differenceInCalendarDays, isAfter, startOfDay } from 'date-fns'
import type { Emprestimo, Livro, StatusEmprestimo } from '@/types'

export const PRAZO_PADRAO_DIAS = 7

export type StatusExibicao = 'em-dia' | 'a-vencer' | 'atrasado' | 'devolvido'

export const calcularDataPrevista = (dataEmprestimo: string) =>
  addDays(new Date(dataEmprestimo), PRAZO_PADRAO_DIAS).toISOString()

// status é sempre derivado da data atual, nunca lido como fonte de verdade (spec §6)
export const derivarStatus = (emprestimo: Emprestimo): StatusEmprestimo => {
  if (emprestimo.dataDevolucao) return 'devolvido'

  const hoje = startOfDay(new Date())
  const prevista = startOfDay(new Date(emprestimo.dataPrevistaDevolucao))

  if (isAfter(hoje, prevista)) return 'atrasado'
  return 'ativo'
}

// refina 'ativo' em 'a-vencer' quando faltam <= 2 dias (spec §7); uso exclusivo de UI (badge/filtro/cards)
export const statusExibicao = (emprestimo: Emprestimo): StatusExibicao => {
  const status = derivarStatus(emprestimo)
  if (status !== 'ativo') return status

  const hoje = startOfDay(new Date())
  const prevista = startOfDay(new Date(emprestimo.dataPrevistaDevolucao))
  const diasRestantes = differenceInCalendarDays(prevista, hoje)

  return diasRestantes <= 2 ? 'a-vencer' : 'em-dia'
}

export const podeRenovar = (emprestimo: Emprestimo) => derivarStatus(emprestimo) === 'ativo'

export const renovarEmprestimo = (emprestimo: Emprestimo): Emprestimo => ({
  ...emprestimo,
  dataPrevistaDevolucao: addDays(
    new Date(emprestimo.dataPrevistaDevolucao),
    PRAZO_PADRAO_DIAS,
  ).toISOString(),
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
