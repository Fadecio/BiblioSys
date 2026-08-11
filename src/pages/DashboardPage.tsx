import {
  CardsResumo,
  construirCardsResumo,
} from "@/components/dashboard/CardsResumo";
import { GraficoMaisProcurados } from "@/components/dashboard/GraficoMaisProcurados";
import { useAlunos } from "@/hooks/useAlunos";
import { useEmprestimos } from "@/hooks/useEmprestimos";
import { useLivros } from "@/hooks/useLivros";
import {
  derivarStatus,
  livrosMaisProcurados,
  statusExibicao,
} from "@/utils/emprestimo";
import { useMemo } from "react";

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
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-semibold text-foreground">Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Visão geral da biblioteca.
          </p>
        </div>

        <div className="w-full max-w-2xl">
          <h1 className="text-2xl font-bold leading-tight text-foreground md:text-3xl">
            <span className="hidden md:inline">
              ESCOLA RAIMUNDO MARQUES DE ALMEIDA
            </span>
            <span className="block md:hidden">ESCOLA RAIMUNDO</span>
            <span className="block md:hidden">MARQUES DE ALMEIDA</span>
          </h1>
        </div>
      </div>

      <CardsResumo cards={cards} />
      <GraficoMaisProcurados dados={maisProcurados} />
    </div>
  );
};
