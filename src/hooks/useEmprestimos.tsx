import { useContext } from 'react'
import { EmprestimosContext } from '@/contexts/EmprestimosContext'

export const useEmprestimos = () => {
  const contexto = useContext(EmprestimosContext)
  if (!contexto) throw new Error('useEmprestimos deve ser usado dentro de EmprestimosProvider')
  return contexto
}
