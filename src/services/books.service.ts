import { supabase } from '@/lib/supabase'
import { run } from '@/services/errors'
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

  remove: (id: string) =>
    run('booksService.remove', async () => {
      const { error } = await supabase.from('books').delete().eq('id', id)
      return { data: null, error }
    }),
}
