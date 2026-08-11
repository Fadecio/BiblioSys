import { createContext, useContext, useState, type ReactNode } from 'react'
import { storage } from '@/services/storage'
import type { Emprestimo } from '@/types'
import { calcularDataPrevista, derivarStatus, podeRenovar, renovarEmprestimo } from '@/utils/emprestimo'
import { useLivros } from '@/hooks/useLivros'

interface ResultadoAcao {
  sucesso: boolean
  mensagem?: string
}

interface EmprestimosContextValor {
  emprestimos: Emprestimo[]
  registrar: (alunoId: string, livroId: string) => ResultadoAcao
  devolver: (id: string) => ResultadoAcao
  renovar: (id: string) => ResultadoAcao
}

const EmprestimosContext = createContext<EmprestimosContextValor | null>(null)

export const EmprestimosProvider = ({ children }: { children: ReactNode }) => {
  const [emprestimosBrutos, setEmprestimosBrutos] = useState<Emprestimo[]>(() => storage.getEmprestimos())
  const { livros, decrementarDisponibilidade, incrementarDisponibilidade } = useLivros()

  const persistir = (proximo: Emprestimo[]) => {
    setEmprestimosBrutos(proximo)
    storage.setEmprestimos(proximo)
  }

  // status nunca é lido do dado salvo — é sempre recalculado a partir da data atual (spec §6)
  const emprestimos = emprestimosBrutos.map((emprestimo) => ({
    ...emprestimo,
    status: derivarStatus(emprestimo),
  }))

  const registrar = (alunoId: string, livroId: string): ResultadoAcao => {
    const livro = livros.find((item) => item.id === livroId)
    if (!livro || livro.quantidadeDisponivel === 0) {
      return { sucesso: false, mensagem: 'Não há exemplares disponíveis para este livro.' }
    }

    const dataEmprestimo = new Date().toISOString()
    const novo: Emprestimo = {
      id: crypto.randomUUID(),
      alunoId,
      livroId,
      dataEmprestimo,
      dataPrevistaDevolucao: calcularDataPrevista(dataEmprestimo),
      status: 'ativo',
      renovacoes: 0,
    }

    persistir([...emprestimosBrutos, novo])
    decrementarDisponibilidade(livroId)
    return { sucesso: true }
  }

  const devolver = (id: string): ResultadoAcao => {
    const emprestimo = emprestimosBrutos.find((item) => item.id === id)
    if (!emprestimo || emprestimo.dataDevolucao) {
      return { sucesso: false, mensagem: 'Empréstimo não encontrado ou já devolvido.' }
    }

    persistir(
      emprestimosBrutos.map((item) =>
        item.id === id
          ? { ...item, dataDevolucao: new Date().toISOString(), status: 'devolvido' }
          : item,
      ),
    )
    incrementarDisponibilidade(emprestimo.livroId)
    return { sucesso: true }
  }

  const renovar = (id: string): ResultadoAcao => {
    const emprestimo = emprestimosBrutos.find((item) => item.id === id)
    if (!emprestimo || !podeRenovar(emprestimo)) {
      return { sucesso: false, mensagem: 'Empréstimo atrasado não pode ser renovado — registre a devolução primeiro.' }
    }

    persistir(emprestimosBrutos.map((item) => (item.id === id ? renovarEmprestimo(item) : item)))
    return { sucesso: true }
  }

  return (
    <EmprestimosContext.Provider value={{ emprestimos, registrar, devolver, renovar }}>
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
