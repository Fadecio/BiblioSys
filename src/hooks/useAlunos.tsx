import { useContext } from 'react'
import { AlunosContext } from '@/contexts/AlunosContext'

export const useAlunos = () => {
  const contexto = useContext(AlunosContext)
  if (!contexto) throw new Error('useAlunos deve ser usado dentro de AlunosProvider')
  return contexto
}
