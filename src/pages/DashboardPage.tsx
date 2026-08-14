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
      <div>
        <h1 className="text-xl font-semibold text-foreground">Visão geral</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Escola Raimundo Marques de Almeida
        </p>
      </div>

      <CardsResumo cards={cards} />
      <GraficoMaisProcurados dados={maisProcurados} />
    </div>
  );
};
