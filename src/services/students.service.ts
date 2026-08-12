import { supabase } from '@/lib/supabase'
import { run } from '@/services/errors'
import type { Database } from '@/types/database.types'

export type Student = Database['public']['Tables']['students']['Row']
export type StudentInput = Database['public']['Tables']['students']['Insert']
export type StudentUpdate = Database['public']['Tables']['students']['Update']

export interface BuscarAlunosFiltro {
  termo?: string
  somenteAtivos?: boolean
}

export const studentsService = {
  list: (filtro: BuscarAlunosFiltro = {}) =>
    run('studentsService.list', () => {
      let query = supabase.from('students').select('*').order('name')

      if (filtro.termo) query = query.or(`name.ilike.%${filtro.termo}%,registration_number.ilike.%${filtro.termo}%`)
      if (filtro.somenteAtivos) query = query.eq('active', true)

      return query
    }),

  create: (input: StudentInput) =>
    run('studentsService.create', () => supabase.from('students').insert(input).select().single()),

  update: (id: string, input: StudentUpdate) =>
    run('studentsService.update', () => supabase.from('students').update(input).eq('id', id).select().single()),

  remove: (id: string) =>
    run('studentsService.remove', async () => {
      const { error } = await supabase.from('students').delete().eq('id', id)
      return { data: null, error }
    }),
}
