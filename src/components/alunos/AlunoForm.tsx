import { useState, type SubmitEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogFooter } from "@/components/ui/dialog";
import type { Aluno, ResultadoAcao } from "@/types";
import type { DadosAluno } from "@/hooks/useAlunos";

interface AlunoFormProps {
  valorInicial?: Aluno;
  onSalvar: (dados: DadosAluno) => Promise<ResultadoAcao>;
  onCancelar: () => void;
}

export const AlunoForm = ({
  valorInicial,
  onSalvar,
  onCancelar,
}: AlunoFormProps) => {
  const [nome, setNome] = useState(valorInicial?.nome ?? "");
  const [turma, setTurma] = useState(valorInicial?.turma ?? "");
  const [serie, setSerie] = useState(valorInicial?.serie ?? "");
  const [telefone, setTelefone] = useState(valorInicial?.telefone ?? "");
  const [erro, setErro] = useState("");

  const handleSubmit = async (evento: SubmitEvent) => {
    evento.preventDefault();

    if (!nome.trim() || !turma.trim() || !serie.trim()) {
      setErro("Nome, turma e série são obrigatórios.");
      return;
    }

    const resultado = await onSalvar({
      nome: nome.trim(),
      turma: turma.trim(),
      serie: serie.trim(),
      telefone: telefone.trim() || undefined,
    });
    if (!resultado.sucesso) setErro(resultado.mensagem ?? "Não foi possível salvar o aluno.");
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="nome">Nome</Label>
        <Input
          id="nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          autoFocus
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="telefone">Telefone</Label>
        <Input
          id="telefone"
          type="tel"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          placeholder="(00) 00000-0000"
        />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="turma">Turma</Label>
          <Input
            id="turma"
            value={turma}
            onChange={(e) => setTurma(e.target.value)}
            placeholder="5A"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="serie">Série</Label>
          <Input
            id="serie"
            value={serie}
            onChange={(e) => setSerie(e.target.value)}
            placeholder="5º ano"
          />
        </div>
      </div>
      {erro && <p className="text-sm text-destructive">{erro}</p>}
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancelar}>
          Cancelar
        </Button>
        <Button type="submit">Salvar</Button>
      </DialogFooter>
    </form>
  );
};
