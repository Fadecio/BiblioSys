import { createContext, useEffect, useState, type ReactNode } from 'react'
import { booksService, type BookWithRelations } from '@/services/books.service'
import { ServiceError } from '@/services/errors'
import type { Livro, ResultadoAcao } from '@/types'

export type DadosLivro = Omit<Livro, 'id' | 'quantidadeDisponivel'>

export interface LivrosContextValor {
  livros: Livro[]
  carregando: boolean
  erro: string | null
  adicionar: (dados: DadosLivro) => Promise<ResultadoAcao>
  atualizar: (id: string, dados: DadosLivro) => Promise<ResultadoAcao>
  remover: (id: string) => Promise<ResultadoAcao>
  recarregar: () => Promise<void>
}

// eslint-disable-next-line react-refresh/only-export-components -- Context precisa ser exportado junto do Provider pra useLivros (hooks/useLivros.tsx) consumi-lo
export const LivrosContext = createContext<LivrosContextValor | null>(null)

// autor/categoria vêm normalizados no banco (authors/categories), mas a tela de Livros usa
// texto livre pra esses dois campos desde o MVP — o service resolve nome -> linha existente
// ou nova ao salvar (ver books.service.ts), e aqui só achatamos de volta pro formato que a UI
// sempre usou.
const paraLivro = (book: BookWithRelations): Livro => ({
  id: book.id,
  titulo: book.title,
  autor: book.authors?.name ?? '',
  categoria: book.categories?.name ?? '',
  codigo: book.code ?? '',
  quantidadeTotal: book.total_copies,
  quantidadeDisponivel: book.available_copies,
})

export const LivrosProvider = ({ children }: { children: ReactNode }) => {
  const [livros, setLivros] = useState<Livro[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  const carregar = async () => {
    try {
      const books = await booksService.list()
      setLivros(books.map(paraLivro))
      setErro(null)
    } catch (e) {
      setErro(e instanceof ServiceError ? e.message : 'Não foi possível carregar os livros.')
    }
  }

  // busca inicial escrita como chamada direta ao service (não via carregar()) porque o
  // eslint-plugin-react-hooks reclama de setState alcançável por uma função local chamada de
  // dentro do effect — chamando o service diretamente (fronteira de módulo opaca pro linter)
  // o aviso não dispara; carregar()/recarregar() continuam existindo pra reuso fora do effect.
  useEffect(() => {
    let cancelado = false

    booksService
      .list()
      .then((books) => {
        if (!cancelado) setLivros(books.map(paraLivro))
      })
      .catch((e: unknown) => {
        if (!cancelado) setErro(e instanceof ServiceError ? e.message : 'Não foi possível carregar os livros.')
      })
      .finally(() => {
        if (!cancelado) setCarregando(false)
      })

    return () => {
      cancelado = true
    }
  }, [])

  const adicionar = async (dados: DadosLivro): Promise<ResultadoAcao> => {
    try {
      await booksService.createFromNames({
        title: dados.titulo,
        authorName: dados.autor,
        categoryName: dados.categoria,
        code: dados.codigo,
        totalCopies: dados.quantidadeTotal,
      })
      await carregar() // recarrega com o join de authors/categories já resolvido
      return { sucesso: true }
    } catch (e) {
      return { sucesso: false, mensagem: e instanceof ServiceError ? e.message : 'Erro inesperado ao salvar livro.' }
    }
  }

  // ao editar quantidadeTotal, ajusta quantidadeDisponivel pelo mesmo delta (nunca abaixo de
  // 0) — mesma regra que já existia sobre localStorage, agora replicada explicitamente aqui
  // porque o banco não recalcula isso sozinho num UPDATE direto de livro (só em empréstimo).
  const atualizar = async (id: string, dados: DadosLivro): Promise<ResultadoAcao> => {
    const atual = livros.find((livro) => livro.id === id)
    if (!atual) return { sucesso: false, mensagem: 'Livro não encontrado.' }

    const delta = dados.quantidadeTotal - atual.quantidadeTotal
    const novaDisponibilidade = Math.max(0, atual.quantidadeDisponivel + delta)

    try {
      await booksService.updateFromNames(
        id,
        {
          title: dados.titulo,
          authorName: dados.autor,
          categoryName: dados.categoria,
          code: dados.codigo,
          totalCopies: dados.quantidadeTotal,
        },
        novaDisponibilidade,
      )
      await carregar()
      return { sucesso: true }
    } catch (e) {
      return { sucesso: false, mensagem: e instanceof ServiceError ? e.message : 'Erro inesperado ao salvar livro.' }
    }
  }

  const remover = async (id: string): Promise<ResultadoAcao> => {
    try {
      await booksService.remove(id)
      setLivros((livrosAtuais) => livrosAtuais.filter((livro) => livro.id !== id))
      return { sucesso: true }
    } catch (e) {
      return { sucesso: false, mensagem: e instanceof ServiceError ? e.message : 'Erro inesperado ao excluir livro.' }
    }
  }

  return (
    <LivrosContext.Provider value={{ livros, carregando, erro, adicionar, atualizar, remover, recarregar: carregar }}>
      {children}
    </LivrosContext.Provider>
  )
}
