import { useState, type SubmitEvent } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarClock, RotateCw, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { StatusBadge } from "@/components/emprestimos/StatusBadge";
import { useAlunos } from "@/hooks/useAlunos";
import { useLivros } from "@/hooks/useLivros";
import { useEmprestimos } from "@/hooks/useEmprestimos";
import {
  calcularDataPrevista,
  podeRenovar,
  statusExibicao,
} from "@/utils/emprestimo";
import type { Emprestimo } from "@/types";

const formatarData = (data: string) =>
  format(new Date(data), "dd/MM/yyyy", { locale: ptBR });

interface EmprestimoTableProps {
  emprestimos: Emprestimo[];
}

export const EmprestimoTable = ({ emprestimos }: EmprestimoTableProps) => {
  const { alunos, carregando: carregandoAlunos } = useAlunos();
  const { livros, carregando: carregandoLivros } = useLivros();
  const { devolver, renovar, editarData } = useEmprestimos();
  const [erro, setErro] = useState("");
  const [emprestimoEmEdicao, setEmprestimoEmEdicao] =
    useState<Emprestimo | null>(null);
  const [novaData, setNovaData] = useState("");
  const [erroData, setErroData] = useState("");

  // evita mostrar "Aluno/Livro removido" por engano enquanto os dados relacionados ainda
  // estão chegando do Supabase (localStorage nunca tinha essa janela de carregamento)
  if (carregandoAlunos || carregandoLivros) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        Carregando...
      </p>
    );
  }

  if (emprestimos.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        Nenhum empréstimo encontrado.
      </p>
    );
  }

  const handleDevolver = async (id: string) => {
    const resultado = await devolver(id);
    setErro(!resultado.sucesso ? (resultado.mensagem ?? "") : "");
  };

  const handleRenovar = async (id: string) => {
    const resultado = await renovar(id);
    setErro(!resultado.sucesso ? (resultado.mensagem ?? "") : "");
  };

  const abrirEdicaoData = (emprestimo: Emprestimo) => {
    setEmprestimoEmEdicao(emprestimo);
    setNovaData(emprestimo.dataEmprestimo.slice(0, 10));
    setErroData("");
  };

  const handleSalvarData = async (evento: SubmitEvent) => {
    evento.preventDefault();
    if (!emprestimoEmEdicao) return;

    const resultado = await editarData(emprestimoEmEdicao.id, novaData);
    if (resultado.sucesso) {
      setEmprestimoEmEdicao(null);
    } else {
      setErroData(
        resultado.mensagem ?? "Não foi possível editar a data do empréstimo.",
      );
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {erro && <p className="px-2 pt-2 text-sm text-destructive">{erro}</p>}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-left">Aluno</TableHead>
            <TableHead className="text-left">Livro</TableHead>
            <TableHead className="text-center">Data do empréstimo</TableHead>
            <TableHead className="text-center">Devolução prevista</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-center">Renovações</TableHead>
            <TableHead className="text-center">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {emprestimos.map((emprestimo) => {
            const aluno = alunos.find((item) => item.id === emprestimo.alunoId);
            const livro = livros.find((item) => item.id === emprestimo.livroId);
            const status = statusExibicao(emprestimo);
            const devolvido = status === "devolvido";

            return (
              <TableRow key={emprestimo.id}>
                <TableCell className="text-left font-medium text-foreground">
                  {aluno?.nome ?? "Aluno removido"}
                </TableCell>
                <TableCell className="text-left">
                  {livro?.titulo ?? "Livro removido"}
                </TableCell>
                <TableCell className="text-center">
                  {formatarData(emprestimo.dataEmprestimo)}
                </TableCell>
                <TableCell className="text-center">
                  {formatarData(emprestimo.dataPrevistaDevolucao)}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex flex-col items-center gap-1">
                    <StatusBadge status={status} />
                    {devolvido && emprestimo.dataDevolucao && (
                      <span className="text-xs text-muted-foreground">
                        {formatarData(emprestimo.dataDevolucao)}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {emprestimo.renovacoes}
                </TableCell>
                <TableCell className="flex justify-center gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Editar data do empréstimo"
                        disabled={devolvido}
                        onClick={() => abrirEdicaoData(emprestimo)}
                      >
                        <CalendarClock className="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Editar data do empréstimo</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Renovar empréstimo"
                        disabled={devolvido || !podeRenovar(emprestimo)}
                        onClick={() => handleRenovar(emprestimo.id)}
                      >
                        <RotateCw className="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Renovar empréstimo</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Registrar devolução"
                        disabled={devolvido}
                        onClick={() => handleDevolver(emprestimo.id)}
                      >
                        <Undo2 className="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Registrar devolução</TooltipContent>
                  </Tooltip>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <Dialog
        open={emprestimoEmEdicao !== null}
        onOpenChange={(aberto) => !aberto && setEmprestimoEmEdicao(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar data do empréstimo</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleSalvarData}
            noValidate
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dataEmprestimo">Data do empréstimo</Label>
              <Input
                id="dataEmprestimo"
                type="date"
                value={novaData}
                onChange={(e) => setNovaData(e.target.value)}
                required
              />
              {novaData && (
                <p className="text-xs text-muted-foreground">
                  Devolução prevista recalculada:{" "}
                  {formatarData(calcularDataPrevista(novaData))} (7 dias a
                  partir da data do empréstimo)
                </p>
              )}
            </div>
            {erroData && <p className="text-sm text-destructive">{erroData}</p>}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEmprestimoEmEdicao(null)}
              >
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
