import { useMemo } from "react";
import {
  CardsResumo,
  construirCardsResumo,
} from "@/components/dashboard/CardsResumo";
import { GraficoMaisProcurados } from "@/components/dashboard/GraficoMaisProcurados";
import { useAlunos } from "@/hooks/useAlunos";
import { useLivros } from "@/hooks/useLivros";
import { useEmprestimos } from "@/hooks/useEmprestimos";
import {
  derivarStatus,
  livrosMaisProcurados,
  statusExibicao,
} from "@/utils/emprestimo";

export const DashboardPage = () => {
  const { alunos } = useAlunos();
  const { livros } = useLivros();
  const { emprestimos } = useEmprestimos();

  const cards = useMemo(() => {
    const totalAtivos = emprestimos.filter(
      (e) => derivarStatus(e) === "ativo",
    ).length;
    const totalAtrasados = emprestimos.filter(
      (e) => derivarStatus(e) === "atrasado",
    ).length;
    const totalAVencer = emprestimos.filter(
      (e) => statusExibicao(e) === "a-vencer",
    ).length;

    return construirCardsResumo({
      totalAlunos: alunos.length,
      totalLivros: livros.length,
      totalAtivos,
      totalAtrasados,
      totalAVencer,
    });
  }, [alunos, livros, emprestimos]);

  const maisProcurados = useMemo(
    () => livrosMaisProcurados(emprestimos, livros),
    [emprestimos, livros],
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-20">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Visão geral da biblioteca.
          </p>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            ESCOLA RAIMUNDO MARQUES DE ALMEIDA
          </h1>
        </div>
      </div>

      <CardsResumo cards={cards} />
      <GraficoMaisProcurados dados={maisProcurados} />
    </div>
  );
};
