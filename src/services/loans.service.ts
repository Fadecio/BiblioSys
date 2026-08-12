import { supabase } from '@/lib/supabase'
import { run } from '@/services/errors'
import type { Database, LoanStatus } from '@/types/database.types'

export type Loan = Database['public']['Tables']['loans']['Row']
export type ActiveLoanRow = Database['public']['Views']['active_loans']['Row']
export type OverdueLoanRow = Database['public']['Views']['overdue_loans']['Row']

export interface LoanWithRelations extends Loan {
  books: { title: string } | null
  students: { name: string } | null
}

const SELECT_COM_RELACOES = '*, books ( title ), students ( name )'

export interface BuscarEmprestimosFiltro {
  status?: LoanStatus
  studentId?: string
  bookId?: string
}

// registrar/devolver empréstimo passam pelas funções register_loan/return_loan do banco
// (supabase/migrations/008_create_functions.sql) em vez de INSERT/UPDATE direto: a validação
// de disponibilidade, aluno ativo e "já devolvido" fica centralizada no banco, não duplicada
// aqui (BD.md §3 e §16).
export const loansService = {
  list: (filtro: BuscarEmprestimosFiltro = {}) =>
    run<LoanWithRelations[]>('loansService.list', () => {
      let query = supabase.from('loans').select(SELECT_COM_RELACOES).order('loan_date', { ascending: false })

      if (filtro.status) query = query.eq('status', filtro.status)
      if (filtro.studentId) query = query.eq('student_id', filtro.studentId)
      if (filtro.bookId) query = query.eq('book_id', filtro.bookId)

      return query
    }),

  listActive: () => run<ActiveLoanRow[]>('loansService.listActive', () => supabase.from('active_loans').select('*')),

  listOverdue: () =>
    run<OverdueLoanRow[]>('loansService.listOverdue', () => supabase.from('overdue_loans').select('*')),

  register: (bookId: string, studentId: string, loanDays?: number) =>
    run<Loan>('loansService.register', () =>
      supabase.rpc('register_loan', { p_book_id: bookId, p_student_id: studentId, p_loan_days: loanDays }),
    ),

  returnLoan: (loanId: string) =>
    run<Loan>('loansService.returnLoan', () => supabase.rpc('return_loan', { p_loan_id: loanId })),
}
