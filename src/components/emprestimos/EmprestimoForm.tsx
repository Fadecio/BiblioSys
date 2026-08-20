import { useMemo, useState, type SubmitEvent } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DialogFooter } from "@/components/ui/dialog";
import { Combobox } from "@/components/ui/combobox";
import { useAlunos } from "@/hooks/useAlunos";
import { useLivros } from "@/hooks/useLivros";
import { normalizarTexto } from "@/utils/texto";
import type { ResultadoAcao } from "@/types";

interface EmprestimoFormProps {
  onRegistrar: (alunoId: string, livroId: string) => Promise<ResultadoAcao>;
  onCancelar: () => void;
}

export const EmprestimoForm = ({
  onRegistrar,
  onCancelar,
}: EmprestimoFormProps) => {
  const { alunos } = useAlunos();
  const { livros } = useLivros();
  const [alunoId, setAlunoId] = useState("");
  const [livroId, setLivroId] = useState("");
  const [erro, setErro] = useState("");

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

  const handleSubmit = async (evento: SubmitEvent) => {
    evento.preventDefault();

    if (!alunoId || !livroId) {
      setErro("Selecione o aluno e o livro.");
      return;
    }

    const resultado = await onRegistrar(alunoId, livroId);
    if (!resultado.sucesso) {
      setErro(resultado.mensagem ?? "Não foi possível registrar o empréstimo.");
    }
  };

  return (
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
  );
};
