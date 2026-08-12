import { supabase } from '@/lib/supabase'
import { run, traduzirErroSupabase } from '@/services/errors'
import type { Database } from '@/types/database.types'

export type Book = Database['public']['Tables']['books']['Row']
export type BookInput = Database['public']['Tables']['books']['Insert']
export type BookUpdate = Database['public']['Tables']['books']['Update']

export interface BookWithRelations extends Book {
  authors: { name: string } | null
  categories: { name: string } | null
}

const SELECT_COM_RELACOES = '*, authors ( name ), categories ( name )'

export interface BuscarLivrosFiltro {
  termo?: string
  categoriaId?: string
  autorId?: string
}

// A tela de Livros usa texto livre pra autor/categoria (não uma lista de seleção), então o
// service resolve "nome digitado" -> linha existente ou nova em authors/categories antes de
// gravar o livro. authors.name e categories.name são UNIQUE (migration 003/012) justamente
// pra isso: mesmo nome digitado duas vezes reaproveita a mesma linha, via upsert atômico
// (evita duplicar em caso de dois saves concorrentes com o mesmo nome).
const resolveAuthorId = async (name: string): Promise<string> => {
  const { data, error } = await supabase
    .from('authors')
    .upsert({ name: name.trim() }, { onConflict: 'name', ignoreDuplicates: false })
    .select('id')
    .single()
  if (error) throw traduzirErroSupabase(error, 'booksService.resolveAuthorId')
  return data.id
}

const resolveCategoryId = async (name: string): Promise<string> => {
  const { data, error } = await supabase
    .from('categories')
    .upsert({ name: name.trim() }, { onConflict: 'name', ignoreDuplicates: false })
    .select('id')
    .single()
  if (error) throw traduzirErroSupabase(error, 'booksService.resolveCategoryId')
  return data.id
}

export interface LivroPorNomes {
  title: string
  authorName: string
  categoryName: string
  code: string
  totalCopies: number
}

export const booksService = {
  list: (filtro: BuscarLivrosFiltro = {}) =>
    run<BookWithRelations[]>('booksService.list', () => {
      let query = supabase.from('books').select(SELECT_COM_RELACOES).order('title')

      if (filtro.termo) query = query.or(`title.ilike.%${filtro.termo}%,isbn.ilike.%${filtro.termo}%`)
      if (filtro.categoriaId) query = query.eq('category_id', filtro.categoriaId)
      if (filtro.autorId) query = query.eq('author_id', filtro.autorId)

      return query
    }),

  getById: (id: string) =>
    run<BookWithRelations>('booksService.getById', () =>
      supabase.from('books').select(SELECT_COM_RELACOES).eq('id', id).single(),
    ),

  create: (input: BookInput) => run('booksService.create', () => supabase.from('books').insert(input).select().single()),

  update: (id: string, input: BookUpdate) =>
    run('booksService.update', () => supabase.from('books').update(input).eq('id', id).select().single()),

  // usado pelo formulário atual de Livros (campos de texto livre pra autor/categoria) —
  // resolve os nomes pra author_id/category_id antes de gravar.
  createFromNames: (input: LivroPorNomes) =>
    run<Book>('booksService.createFromNames', async () => {
      const [author_id, category_id] = await Promise.all([
        resolveAuthorId(input.authorName),
        resolveCategoryId(input.categoryName),
      ])
      return supabase
        .from('books')
        .insert({
          title: input.title,
          code: input.code,
          total_copies: input.totalCopies,
          available_copies: input.totalCopies,
          author_id,
          category_id,
        })
        .select()
        .single()
    }),

  updateFromNames: (id: string, input: LivroPorNomes, availableCopies: number) =>
    run<Book>('booksService.updateFromNames', async () => {
      const [author_id, category_id] = await Promise.all([
        resolveAuthorId(input.authorName),
        resolveCategoryId(input.categoryName),
      ])
      return supabase
        .from('books')
        .update({
          title: input.title,
          code: input.code,
          total_copies: input.totalCopies,
          available_copies: availableCopies,
          author_id,
          category_id,
        })
        .eq('id', id)
        .select()
        .single()
    }),

  remove: (id: string) =>
    run('booksService.remove', async () => {
      const { error } = await supabase.from('books').delete().eq('id', id)
      return { data: null, error }
    }),
}
