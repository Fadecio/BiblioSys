import { memo, useLayoutEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LivroProcurado } from "@/utils/emprestimo";

const ALTURA_GRAFICO = 320;
const LARGURA_MINIMA = 480;
const LARGURA_EIXO_Y = 180;
const MAX_CARACTERES = 26;

const COR_DESTAQUE = "#2563eb";
const COR_PADRAO = "#93c5fd";

// props injetadas pelo Recharts via cloneElement — não passe x/y/payload no JSX:
// o Recharts extrai props SVG do elemento (svgPropertiesNoEvents) e elas sobrescrevem
// as coordenadas calculadas, empilhando todos os títulos em x=0,y=0.
const TituloTick = ({
  x,
  y,
  payload,
}: {
  x?: number;
  y?: number;
  payload?: { value: string };
}) => {
  const texto = payload?.value ?? "";
  const label =
    texto.length > MAX_CARACTERES
      ? `${texto.slice(0, MAX_CARACTERES - 1)}…`
      : texto;
  return (
    <text x={x} y={y} dy={4} textAnchor="end" fontSize={12} fill="#334155">
      <title>{texto}</title>
      {label}
    </text>
  );
};

// memo não é otimização opcional: a cada render os <Cell> viram elementos novos, o Recharts v3
// recalcula os retângulos e remonta a camada das barras (<g> removido/recriado) — o que aparece
// como piscada. Com `dados` de identidade estável (useMemo no EmprestimosContext), o memo corta
// o re-render na raiz.
export const GraficoMaisProcurados = memo(function GraficoMaisProcurados({
  dados,
}: {
  dados: LivroProcurado[];
}) {
  const [wrapperEl, setWrapperEl] = useState<HTMLDivElement | null>(null);
  const [largura, setLargura] = useState(0);

  useLayoutEffect(() => {
    if (!wrapperEl) return;

    const medir = () => setLargura(wrapperEl.clientWidth);
    medir();

    const observer = new ResizeObserver(medir);
    observer.observe(wrapperEl);
    return () => observer.disconnect();
  }, [wrapperEl]);

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
          <div ref={setWrapperEl} className="h-80 w-full overflow-x-auto">
            {largura > 0 && (
              <BarChart
                width={Math.max(largura, LARGURA_MINIMA)}
                height={ALTURA_GRAFICO}
                data={dados}
                layout="vertical"
                margin={{ left: 24, right: 40, top: 8, bottom: 8 }}
                barCategoryGap="22%"
              >
                <CartesianGrid horizontal={false} stroke="#f1f5f9" />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                />
                <YAxis
                  type="category"
                  dataKey="titulo"
                  width={LARGURA_EIXO_Y}
                  axisLine={false}
                  tickLine={false}
                  tick={<TituloTick />}
                />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  formatter={(valor) => [valor ?? 0, "Empréstimos"]}
                />
                <Bar
                  dataKey="total"
                  name="Empréstimos"
                  radius={[0, 6, 6, 0]}
                  isAnimationActive={false}
                >
                  {dados.map((item, index) => (
                    <Cell
                      key={item.livroId}
                      fill={index === 0 ? COR_DESTAQUE : COR_PADRAO}
                    />
                  ))}
                  <LabelList
                    dataKey="total"
                    position="right"
                    fontSize={12}
                    fontWeight={600}
                    fill="#1e293b"
                  />
                </Bar>
              </BarChart>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
});
