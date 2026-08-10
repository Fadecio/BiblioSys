import { createContext, useContext, useState, type ReactNode } from 'react'
import { storage } from '@/services/storage'
import type { Livro } from '@/types'

export type DadosLivro = Omit<Livro, 'id' | 'quantidadeDisponivel'>

interface LivrosContextValor {
  livros: Livro[]
  adicionar: (dados: DadosLivro) => void
  atualizar: (id: string, dados: DadosLivro) => void
  remover: (id: string) => void
  decrementarDisponibilidade: (id: string) => void
  incrementarDisponibilidade: (id: string) => void
}

const LivrosContext = createContext<LivrosContextValor | null>(null)

export const LivrosProvider = ({ children }: { children: ReactNode }) => {
  const [livros, setLivros] = useState<Livro[]>(() => storage.getLivros())

  const persistir = (proximo: Livro[]) => {
    setLivros(proximo)
    storage.setLivros(proximo)
  }

  const adicionar = (dados: DadosLivro) => {
    const novo: Livro = { ...dados, id: crypto.randomUUID(), quantidadeDisponivel: dados.quantidadeTotal }
    persistir([...livros, novo])
  }

  // ao editar o total de exemplares, ajusta a disponibilidade pelo mesmo delta (nunca abaixo de 0) —
  // regra mínima necessária pra manter os dois campos do spec consistentes entre si
  const atualizar = (id: string, dados: DadosLivro) => {
    persistir(
      livros.map((livro) => {
        if (livro.id !== id) return livro
        const delta = dados.quantidadeTotal - livro.quantidadeTotal
        return { ...livro, ...dados, quantidadeDisponivel: Math.max(0, livro.quantidadeDisponivel + delta) }
      }),
    )
  }

  const remover = (id: string) => {
    persistir(livros.filter((livro) => livro.id !== id))
  }

  const decrementarDisponibilidade = (id: string) => {
    persistir(
      livros.map((livro) =>
        livro.id === id ? { ...livro, quantidadeDisponivel: livro.quantidadeDisponivel - 1 } : livro,
      ),
    )
  }

  const incrementarDisponibilidade = (id: string) => {
    persistir(
      livros.map((livro) =>
        livro.id === id
          ? { ...livro, quantidadeDisponivel: Math.min(livro.quantidadeTotal, livro.quantidadeDisponivel + 1) }
          : livro,
      ),
    )
  }

  return (
    <LivrosContext.Provider
      value={{ livros, adicionar, atualizar, remover, decrementarDisponibilidade, incrementarDisponibilidade }}
    >
      {children}
    </LivrosContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components -- Context e hook coexistem no mesmo arquivo por design (spec §10)
export const useLivros = () => {
  const contexto = useContext(LivrosContext)
  if (!contexto) throw new Error('useLivros deve ser usado dentro de LivrosProvider')
  return contexto
}
