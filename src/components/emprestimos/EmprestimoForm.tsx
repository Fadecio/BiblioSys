import { useMemo, useState, type SubmitEvent } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DialogFooter } from "@/components/ui/dialog";
import { Combobox } from "@/components/ui/combobox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAlunos } from "@/hooks/useAlunos";
import { useLivros } from "@/hooks/useLivros";
import { useEmprestimos } from "@/hooks/useEmprestimos";
import { normalizarTexto } from "@/utils/texto";
import type { Emprestimo, ResultadoAcao } from "@/types";

interface EmprestimoFormProps {
  onRegistrar: (alunoId: string, livroId: string) => Promise<ResultadoAcao>;
  onCancelar: () => void;
}

// datas vêm como "yyyy-MM-dd" (coluna `date` do Postgres) — parseISO trata como meia-noite
// local; new Date() trataria como UTC e "voltava" um dia no fuso do Brasil (mesma regra do
// EmprestimoTable/utils/emprestimo)
const formatarData = (data: string) =>
  format(parseISO(data), "dd/MM/yyyy", { locale: ptBR });

export const EmprestimoForm = ({
  onRegistrar,
  onCancelar,
}: EmprestimoFormProps) => {
  const { alunos } = useAlunos();
  const { livros } = useLivros();
  const { emprestimos } = useEmprestimos();
  const [alunoId, setAlunoId] = useState("");
  const [livroId, setLivroId] = useState("");
  const [erro, setErro] = useState("");
  // empréstimo em aberto que torna este cadastro uma duplicata; != null mantém o alerta aberto
  const [duplicado, setDuplicado] = useState<Emprestimo | null>(null);

  const opcoesAlunos = useMemo(
    () =>
      [...alunos]
        // agrupado por série > turma e, dentro do grupo, por nome — mesmo critério do
        // AlunosPage/AlunoTable, pra manter a listagem de alunos consistente no sistema
        .sort((a, b) => {
          const porSerie = normalizarTexto(a.serie).localeCompare(normalizarTexto(b.serie), 'pt-BR', {
            numeric: true,
          })
          if (porSerie !== 0) return porSerie
          const porTurma = normalizarTexto(a.turma).localeCompare(normalizarTexto(b.turma), 'pt-BR', {
            numeric: true,
          })
          if (porTurma !== 0) return porTurma
          return a.nome.localeCompare(b.nome, 'pt-BR')
        })
        .map((aluno) => ({
          value: aluno.id,
          label: aluno.nome,
          searchValue: `${aluno.nome} ${aluno.turma} ${aluno.serie}`,
          group: `${aluno.serie} · Turma ${aluno.turma}`,
        })),
    [alunos],
  );

  const opcoesLivros = useMemo(
    () =>
      livros.map((livro) => ({
        value: livro.id,
        label: `${livro.titulo} ${livro.quantidadeDisponivel === 0 ? "(indisponível)" : `(${livro.quantidadeDisponivel} disp.)`}`,
        searchValue: `${livro.titulo} ${livro.autor} ${livro.codigo}`,
        disabled: livro.quantidadeDisponivel === 0,
      })),
    [livros],
  );

  // duplicata = o mesmo aluno já está com o mesmo livro em mãos (empréstimo não devolvido).
  // Não é bloqueado porque é legítimo em alguns casos (dois exemplares do mesmo título),
  // mas quase sempre é registro repetido — por isso avisa e exige confirmação (spec §6).
  const encontrarDuplicado = (aluno: string, livro: string) =>
    emprestimos.find(
      (emprestimo) =>
        emprestimo.alunoId === aluno &&
        emprestimo.livroId === livro &&
        emprestimo.status !== "devolvido",
    ) ?? null;

  const registrar = async () => {
    const resultado = await onRegistrar(alunoId, livroId);
    if (!resultado.sucesso) {
      setErro(resultado.mensagem ?? "Não foi possível registrar o empréstimo.");
    }
  };

  const handleSubmit = async (evento: SubmitEvent) => {
    evento.preventDefault();
    setErro("");

    if (!alunoId || !livroId) {
      setErro("Selecione o aluno e o livro.");
      return;
    }

    const existente = encontrarDuplicado(alunoId, livroId);
    if (existente) {
      setDuplicado(existente);
      return;
    }

    await registrar();
  };

  const handleConfirmarDuplicado = async () => {
    setDuplicado(null);
    await registrar();
  };

  const nomeAluno = alunos.find((aluno) => aluno.id === alunoId)?.nome ?? "Este aluno";
  const tituloLivro = livros.find((livro) => livro.id === livroId)?.titulo ?? "este livro";

  return (
    <>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label>Aluno</Label>
          <Combobox
            options={opcoesAlunos}
            value={alunoId}
            onChange={setAlunoId}
            placeholder="Selecione um aluno"
            searchPlaceholder="Buscar por nome ou turma..."
            emptyMessage="Nenhum aluno encontrado."
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Livro</Label>
          <Combobox
            options={opcoesLivros}
            value={livroId}
            onChange={setLivroId}
            placeholder="Selecione um livro"
            searchPlaceholder="Buscar por título, autor ou código..."
            emptyMessage="Nenhum livro encontrado."
          />
        </div>
        {erro && <p className="text-sm text-destructive">{erro}</p>}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancelar}>
            Cancelar
          </Button>
          <Button type="submit">Registrar empréstimo</Button>
        </DialogFooter>
      </form>

      <AlertDialog
        open={duplicado !== null}
        onOpenChange={(aberto) => {
          if (!aberto) setDuplicado(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Empréstimo duplicado</AlertDialogTitle>
            <AlertDialogDescription>
              {nomeAluno} já está com "{tituloLivro}" em mãos
              {duplicado
                ? `, emprestado em ${formatarData(duplicado.dataEmprestimo)} e com devolução prevista para ${formatarData(duplicado.dataPrevistaDevolucao)}${duplicado.status === "atrasado" ? " (em atraso)" : ""}`
                : ""}
              . Registrar de novo vai criar um segundo empréstimo do mesmo livro e baixar mais
              um exemplar do estoque. Deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmarDuplicado}>
              Registrar mesmo assim
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
