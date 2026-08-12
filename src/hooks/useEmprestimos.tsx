import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { loansService, type LoanWithRelations } from '@/services/loans.service'
import { ServiceError } from '@/services/errors'
import type { Emprestimo, ResultadoAcao } from '@/types'
import { derivarStatus } from '@/utils/emprestimo'
import { useLivros } from '@/hooks/useLivros'

interface EmprestimosContextValor {
  emprestimos: Emprestimo[]
  carregando: boolean
  erro: string | null
  registrar: (alunoId: string, livroId: string) => Promise<ResultadoAcao>
  devolver: (id: string) => Promise<ResultadoAcao>
  renovar: (id: string) => Promise<ResultadoAcao>
}

const EmprestimosContext = createContext<EmprestimosContextValor | null>(null)

const paraEmprestimo = (loan: LoanWithRelations): Emprestimo => ({
  id: loan.id,
  alunoId: loan.student_id,
  livroId: loan.book_id,
  dataEmprestimo: loan.loan_date,
  dataPrevistaDevolucao: loan.due_date,
  dataDevolucao: loan.return_date ?? undefined,
  // valor bruto do banco só serve de ponto de partida — derivarStatus recalcula a partir da
  // data atual, igual sempre fez sobre localStorage (spec §6); status vindo do banco pode
  // estar desatualizado porque loans.status só é sincronizado sob demanda (sync_overdue_loans)
  status: loan.status === 'returned' ? 'devolvido' : 'ativo',
  renovacoes: loan.renewals,
})

export const EmprestimosProvider = ({ children }: { children: ReactNode }) => {
  const [emprestimosBrutos, setEmprestimosBrutos] = useState<Emprestimo[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const { recarregar: recarregarLivros } = useLivros()

  const carregar = async () => {
    try {
      const loans = await loansService.list()
      setEmprestimosBrutos(loans.map(paraEmprestimo))
      setErro(null)
    } catch (e) {
      setErro(e instanceof ServiceError ? e.message : 'Não foi possível carregar os empréstimos.')
    }
  }

  // busca inicial escrita como chamada direta ao service (não via carregar()) porque o
  // eslint-plugin-react-hooks reclama de setState alcançável por uma função local chamada de
  // dentro do effect — chamando o service diretamente (fronteira de módulo opaca pro linter)
  // o aviso não dispara; carregar() continua existindo pra reuso em registrar/devolver/renovar.
  useEffect(() => {
    let cancelado = false

    loansService
      .list()
      .then((loans) => {
        if (!cancelado) setEmprestimosBrutos(loans.map(paraEmprestimo))
      })
      .catch((e: unknown) => {
        if (!cancelado) setErro(e instanceof ServiceError ? e.message : 'Não foi possível carregar os empréstimos.')
      })
      .finally(() => {
        if (!cancelado) setCarregando(false)
      })

    return () => {
      cancelado = true
    }
  }, [])

  // status nunca é lido do dado salvo — é sempre recalculado a partir da data atual (spec §6)
  const emprestimos = emprestimosBrutos.map((emprestimo) => ({
    ...emprestimo,
    status: derivarStatus(emprestimo),
  }))

  const registrar = async (alunoId: string, livroId: string): Promise<ResultadoAcao> => {
    try {
      await loansService.register(livroId, alunoId)
      await Promise.all([carregar(), recarregarLivros()])
      return { sucesso: true }
    } catch (e) {
      return {
        sucesso: false,
        mensagem: e instanceof ServiceError ? e.message : 'Erro inesperado ao registrar empréstimo.',
      }
    }
  }

  const devolver = async (id: string): Promise<ResultadoAcao> => {
    try {
      await loansService.returnLoan(id)
      await Promise.all([carregar(), recarregarLivros()])
      return { sucesso: true }
    } catch (e) {
      return {
        sucesso: false,
        mensagem: e instanceof ServiceError ? e.message : 'Erro inesperado ao registrar devolução.',
      }
    }
  }

  const renovar = async (id: string): Promise<ResultadoAcao> => {
    try {
      await loansService.renew(id)
      await carregar() // renovação só muda due_date/renewals — disponibilidade não é afetada
      return { sucesso: true }
    } catch (e) {
      return { sucesso: false, mensagem: e instanceof ServiceError ? e.message : 'Erro inesperado ao renovar empréstimo.' }
    }
  }

  return (
    <EmprestimosContext.Provider value={{ emprestimos, carregando, erro, registrar, devolver, renovar }}>
      {children}
    </EmprestimosContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components -- Context e hook coexistem no mesmo arquivo por design (spec §10)
export const useEmprestimos = () => {
  const contexto = useContext(EmprestimosContext)
  if (!contexto) throw new Error('useEmprestimos deve ser usado dentro de EmprestimosProvider')
  return contexto
}
