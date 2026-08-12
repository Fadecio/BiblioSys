import { supabase } from '@/lib/supabase'
import { run } from '@/services/errors'
import type { Database } from '@/types/database.types'

export type DashboardStats = Database['public']['Views']['dashboard_stats']['Row']

export const dashboardService = {
  getStats: () =>
    run<DashboardStats>('dashboardService.getStats', () => supabase.from('dashboard_stats').select('*').single()),
}
