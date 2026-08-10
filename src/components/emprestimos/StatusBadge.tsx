import { Badge } from '@/components/ui/badge'
import type { StatusExibicao } from '@/utils/emprestimo'
import { cn } from '@/lib/utils'

const CONFIGURACAO: Record<StatusExibicao, { rotulo: string; className: string }> = {
  'em-dia': { rotulo: 'Em dia', className: 'bg-emerald-100 text-emerald-700' },
  'a-vencer': { rotulo: 'A vencer', className: 'bg-amber-100 text-amber-700' },
  atrasado: { rotulo: 'Atrasado', className: 'bg-red-100 text-red-700' },
  devolvido: { rotulo: 'Devolvido', className: 'bg-zinc-100 text-zinc-700' },
}

export const StatusBadge = ({ status }: { status: StatusExibicao }) => {
  const { rotulo, className } = CONFIGURACAO[status]
  return <Badge className={cn(className, 'hover:bg-current/10')}>{rotulo}</Badge>
}
