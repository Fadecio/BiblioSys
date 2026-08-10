import { createContext, useContext, useState, type ReactNode } from 'react'
import { storage } from '@/services/storage'
import type { Aluno } from '@/types'

export type DadosAluno = Omit<Aluno, 'id' | 'criadoEm'>

interface AlunosContextValor {
  alunos: Aluno[]
  adicionar: (dados: DadosAluno) => void
  atualizar: (id: string, dados: DadosAluno) => void
  remover: (id: string) => void
}

const AlunosContext = createContext<AlunosContextValor | null>(null)

export const AlunosProvider = ({ children }: { children: ReactNode }) => {
  const [alunos, setAlunos] = useState<Aluno[]>(() => storage.getAlunos())

  const persistir = (proximo: Aluno[]) => {
    setAlunos(proximo)
    storage.setAlunos(proximo)
  }

  const adicionar = (dados: DadosAluno) => {
    const novo: Aluno = { ...dados, id: crypto.randomUUID(), criadoEm: new Date().toISOString() }
    persistir([...alunos, novo])
  }

  const atualizar = (id: string, dados: DadosAluno) => {
    persistir(alunos.map((aluno) => (aluno.id === id ? { ...aluno, ...dados } : aluno)))
  }

  const remover = (id: string) => {
    persistir(alunos.filter((aluno) => aluno.id !== id))
  }

  return (
    <AlunosContext.Provider value={{ alunos, adicionar, atualizar, remover }}>
      {children}
    </AlunosContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components -- Context e hook coexistem no mesmo arquivo por design (spec §10)
export const useAlunos = () => {
  const contexto = useContext(AlunosContext)
  if (!contexto) throw new Error('useAlunos deve ser usado dentro de AlunosProvider')
  return contexto
}
