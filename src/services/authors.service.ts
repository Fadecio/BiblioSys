import { supabase } from '@/lib/supabase'
import { run } from '@/services/errors'
import type { Database } from '@/types/database.types'

export type Author = Database['public']['Tables']['authors']['Row']
export type AuthorInput = Database['public']['Tables']['authors']['Insert']
export type AuthorUpdate = Database['public']['Tables']['authors']['Update']

export const authorsService = {
  list: () => run<Author[]>('authorsService.list', () => supabase.from('authors').select('*').order('name')),

  create: (input: AuthorInput) =>
    run<Author>('authorsService.create', () => supabase.from('authors').insert(input).select().single()),

  update: (id: string, input: AuthorUpdate) =>
    run<Author>('authorsService.update', () => supabase.from('authors').update(input).eq('id', id).select().single()),

  remove: (id: string) =>
    run('authorsService.remove', async () => {
      const { error } = await supabase.from('authors').delete().eq('id', id)
      return { data: null, error }
    }),
}
