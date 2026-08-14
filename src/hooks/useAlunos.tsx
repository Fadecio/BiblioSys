import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { studentsService, type Student } from '@/services/students.service'
import { ServiceError } from '@/services/errors'
import type { Aluno, ResultadoAcao } from '@/types'

export type DadosAluno = Omit<Aluno, 'id' | 'criadoEm'>

interface AlunosContextValor {
  alunos: Aluno[]
  carregando: boolean
  erro: string | null
  adicionar: (dados: DadosAluno) => Promise<ResultadoAcao>
  atualizar: (id: string, dados: DadosAluno) => Promise<ResultadoAcao>
  remover: (id: string) => Promise<ResultadoAcao>
}

const AlunosContext = createContext<AlunosContextValor | null>(null)

// aluno é dado gerenciado (não usuário logado, spec §2) — a tela nunca coletou matrícula, e o
// banco gera registration_number sozinho (migration 012); "grade" (série) é a única coluna
// nova que veio só pra acomodar um campo que o formulário de Aluno já tinha desde o MVP.
const paraAluno = (student: Student): Aluno => ({
  id: student.id,
  nome: student.name,
  turma: student.class ?? '',
  serie: student.grade ?? '',
  telefone: student.phone ?? undefined,
  criadoEm: student.created_at,
})

export const AlunosProvider = ({ children }: { children: ReactNode }) => {
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    let cancelado = false

    studentsService
      .list()
      .then((students) => {
        if (!cancelado) setAlunos(students.map(paraAluno))
      })
      .catch((e: unknown) => {
        if (!cancelado) setErro(e instanceof ServiceError ? e.message : 'Não foi possível carregar os alunos.')
      })
      .finally(() => {
        if (!cancelado) setCarregando(false)
      })

    return () => {
      cancelado = true
    }
  }, [])

  const adicionar = async (dados: DadosAluno): Promise<ResultadoAcao> => {
    try {
      const criado = await studentsService.create({
        name: dados.nome,
        class: dados.turma,
        grade: dados.serie,
        phone: dados.telefone?.trim() || null,
      })
      setAlunos((atual) => [...atual, paraAluno(criado)])
      return { sucesso: true }
    } catch (e) {
      return { sucesso: false, mensagem: e instanceof ServiceError ? e.message : 'Erro inesperado ao salvar aluno.' }
    }
  }

  const atualizar = async (id: string, dados: DadosAluno): Promise<ResultadoAcao> => {
    try {
      const atualizado = await studentsService.update(id, {
        name: dados.nome,
        class: dados.turma,
        grade: dados.serie,
        phone: dados.telefone?.trim() || null,
      })
      setAlunos((atual) => atual.map((aluno) => (aluno.id === id ? paraAluno(atualizado) : aluno)))
      return { sucesso: true }
    } catch (e) {
      return { sucesso: false, mensagem: e instanceof ServiceError ? e.message : 'Erro inesperado ao salvar aluno.' }
    }
  }

  const remover = async (id: string): Promise<ResultadoAcao> => {
    try {
      await studentsService.remove(id)
      setAlunos((atual) => atual.filter((aluno) => aluno.id !== id))
      return { sucesso: true }
    } catch (e) {
      return { sucesso: false, mensagem: e instanceof ServiceError ? e.message : 'Erro inesperado ao excluir aluno.' }
    }
  }

  return (
    <AlunosContext.Provider value={{ alunos, carregando, erro, adicionar, atualizar, remover }}>
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
