import { useLayoutEffect, useRef, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { LivroProcurado } from '@/utils/emprestimo'

const ALTURA_GRAFICO = 320
const LARGURA_MINIMA = 480

export const GraficoMaisProcurados = ({ dados }: { dados: LivroProcurado[] }) => {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [largura, setLargura] = useState(0)

  // mede o container antes do paint (useLayoutEffect) em vez de depender do
  // ResponsiveContainer do Recharts, que só mede via ResizeObserver após o mount
  // e causa um "salto" visível: gráfico nasce pequeno e redimensiona um instante depois
  useLayoutEffect(() => {
    const elemento = wrapperRef.current
    if (!elemento) return

    const medir = () => setLargura(elemento.clientWidth)
    medir()

    const observer = new ResizeObserver(medir)
    observer.observe(elemento)
    return () => observer.disconnect()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Livros mais procurados</CardTitle>
      </CardHeader>
      <CardContent>
        {dados.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Nenhum empréstimo registrado ainda.
          </p>
        ) : (
          <div ref={wrapperRef} className="h-80 w-full overflow-x-auto">
            {largura > 0 && (
              <BarChart
                width={Math.max(largura, LARGURA_MINIMA)}
                height={ALTURA_GRAFICO}
                data={dados}
                layout="vertical"
                margin={{ left: 24, right: 16 }}
              >
                <CartesianGrid horizontal={false} stroke="#e4e4e7" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: '#71717a' }} />
                <YAxis
                  type="category"
                  dataKey="titulo"
                  width={150}
                  tick={{ fontSize: 12, fill: '#3f3f46' }}
                />
                <Tooltip cursor={{ fill: '#f4f4f5' }} />
                <Bar
                  dataKey="total"
                  name="Empréstimos"
                  fill="#2563eb"
                  radius={[0, 4, 4, 0]}
                  barSize={18}
                  isAnimationActive={false}
                />
              </BarChart>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
