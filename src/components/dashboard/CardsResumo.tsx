import type { ComponentType } from 'react'
import { Link } from 'react-router-dom'
import { Users, BookOpen, ArrowLeftRight, Clock, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CardResumoConfig {
  titulo: string
  valor: number
  icone: ComponentType<{ className?: string }>
  destaque?: 'amber' | 'red'
  to: string
}

const DESTAQUES: Record<'amber' | 'red', string> = {
  amber: 'text-amber-600',
  red: 'text-red-600',
}

export const CardsResumo = ({ cards }: { cards: CardResumoConfig[] }) => {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map(({ titulo, valor, icone: Icone, destaque, to }) => (
        <Link
          key={titulo}
          to={to}
          className="rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:border-primary/40 hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {titulo}
            </span>
            <Icone className={cn('size-3.5', destaque ? DESTAQUES[destaque] : 'text-muted-foreground/60')} />
          </div>
          <span className={cn('mt-1.5 block text-2xl font-semibold tabular-nums', destaque ? DESTAQUES[destaque] : 'text-foreground')}>
            {valor}
          </span>
        </Link>
      ))}
    </div>
  )
}

// eslint-disable-next-line react-refresh/only-export-components -- helper de montagem dos cards, acoplado de propósito ao componente acima
export const construirCardsResumo = (dados: {
  totalAlunos: number
  totalLivros: number
  totalAtivos: number
  totalAtrasados: number
  totalAVencer: number
}): CardResumoConfig[] => [
  { titulo: 'Alunos', valor: dados.totalAlunos, icone: Users, to: '/alunos' },
  { titulo: 'Livros', valor: dados.totalLivros, icone: BookOpen, to: '/livros' },
  { titulo: 'Empréstimos ativos', valor: dados.totalAtivos, icone: ArrowLeftRight, to: '/emprestimos?filtro=ativos' },
  { titulo: 'A vencer', valor: dados.totalAVencer, icone: Clock, destaque: 'amber', to: '/emprestimos?filtro=a-vencer' },
  { titulo: 'Atrasados', valor: dados.totalAtrasados, icone: AlertTriangle, destaque: 'red', to: '/emprestimos?filtro=atrasados' },
]
