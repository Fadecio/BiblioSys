import { useContext } from 'react'
import { LivrosContext } from '@/contexts/LivrosContext'

export const useLivros = () => {
  const contexto = useContext(LivrosContext)
  if (!contexto) throw new Error('useLivros deve ser usado dentro de LivrosProvider')
  return contexto
}
