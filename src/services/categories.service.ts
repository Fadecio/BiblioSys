import { supabase } from '@/lib/supabase'
import { run } from '@/services/errors'
import type { Database } from '@/types/database.types'

export type Category = Database['public']['Tables']['categories']['Row']
export type CategoryInput = Database['public']['Tables']['categories']['Insert']
export type CategoryUpdate = Database['public']['Tables']['categories']['Update']

export const categoriesService = {
  list: () => run('categoriesService.list', () => supabase.from('categories').select('*').order('name')),

  create: (input: CategoryInput) =>
    run('categoriesService.create', () => supabase.from('categories').insert(input).select().single()),

  update: (id: string, input: CategoryUpdate) =>
    run('categoriesService.update', () => supabase.from('categories').update(input).eq('id', id).select().single()),

  remove: (id: string) =>
    run('categoriesService.remove', async () => {
      const { error } = await supabase.from('categories').delete().eq('id', id)
      return { data: null, error }
    }),
}
