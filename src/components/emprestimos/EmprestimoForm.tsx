import { useState, type SubmitEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAlunos } from '@/hooks/useAlunos'
import { useLivros } from '@/hooks/useLivros'

interface EmprestimoFormProps {
  onRegistrar: (alunoId: string, livroId: string) => { sucesso: boolean; mensagem?: string }
  onCancelar: () => void
}

export const EmprestimoForm = ({ onRegistrar, onCancelar }: EmprestimoFormProps) => {
  const { alunos } = useAlunos()
  const { livros } = useLivros()
  const [alunoId, setAlunoId] = useState('')
  const [livroId, setLivroId] = useState('')
  const [erro, setErro] = useState('')

  const handleSubmit = (evento: SubmitEvent) => {
    evento.preventDefault()

    if (!alunoId || !livroId) {
      setErro('Selecione o aluno e o livro.')
      return
    }

    const resultado = onRegistrar(alunoId, livroId)
    if (!resultado.sucesso) {
      setErro(resultado.mensagem ?? 'Não foi possível registrar o empréstimo.')
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label>Aluno</Label>
        <Select value={alunoId} onValueChange={setAlunoId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione um aluno" />
          </SelectTrigger>
          <SelectContent>
            {alunos.map((aluno) => (
              <SelectItem key={aluno.id} value={aluno.id}>
                {aluno.nome} — {aluno.turma}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Livro</Label>
        <Select value={livroId} onValueChange={setLivroId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione um livro" />
          </SelectTrigger>
          <SelectContent>
            {livros.map((livro) => (
              <SelectItem key={livro.id} value={livro.id} disabled={livro.quantidadeDisponivel === 0}>
                {livro.titulo} {livro.quantidadeDisponivel === 0 ? '(indisponível)' : `(${livro.quantidadeDisponivel} disp.)`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {erro && <p className="text-sm text-destructive">{erro}</p>}
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancelar}>
          Cancelar
        </Button>
        <Button type="submit">Registrar empréstimo</Button>
      </DialogFooter>
    </form>
  )
}
