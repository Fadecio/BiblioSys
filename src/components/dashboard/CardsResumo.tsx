import type { ComponentType } from 'react'
import { Users, BookOpen, ArrowLeftRight, Clock, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface CardResumoConfig {
  titulo: string
  valor: number
  icone: ComponentType<{ className?: string }>
  destaque?: 'amber' | 'red'
}

const DESTAQUES: Record<'amber' | 'red', string> = {
  amber: 'text-amber-600',
  red: 'text-red-600',
}

export const CardsResumo = ({ cards }: { cards: CardResumoConfig[] }) => {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
      {cards.map(({ titulo, valor, icone: Icone, destaque }) => (
        <Card key={titulo}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-sm font-normal text-muted-foreground">
              {titulo}
              <Icone className={cn('size-4', destaque ? DESTAQUES[destaque] : 'text-muted-foreground')} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className={cn('text-2xl font-semibold', destaque ? DESTAQUES[destaque] : 'text-foreground')}>
              {valor}
            </span>
          </CardContent>
        </Card>
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
  { titulo: 'Alunos', valor: dados.totalAlunos, icone: Users },
  { titulo: 'Livros', valor: dados.totalLivros, icone: BookOpen },
  { titulo: 'Empréstimos ativos', valor: dados.totalAtivos, icone: ArrowLeftRight },
  { titulo: 'A vencer', valor: dados.totalAVencer, icone: Clock, destaque: 'amber' },
  { titulo: 'Atrasados', valor: dados.totalAtrasados, icone: AlertTriangle, destaque: 'red' },
]
