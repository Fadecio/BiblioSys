import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlunoForm } from '@/components/alunos/AlunoForm'
import { AlunoTable } from '@/components/alunos/AlunoTable'
import { useAlunos, type DadosAluno } from '@/hooks/useAlunos'
import { useEmprestimos } from '@/hooks/useEmprestimos'
import { normalizarTexto } from '@/utils/texto'
import type { Aluno } from '@/types'

export const AlunosPage = () => {
  const { alunos, adicionar, atualizar, remover } = useAlunos()
  const { alunoTemEmprestimoAtivo } = useEmprestimos()
  const [busca, setBusca] = useState('')
  const [dialogAberto, setDialogAberto] = useState(false)
  const [alunoEmEdicao, setAlunoEmEdicao] = useState<Aluno | undefined>(undefined)

  const alunosFiltrados = useMemo(() => {
    const termo = normalizarTexto(busca.trim())
    if (!termo) return alunos
    return alunos.filter(
      (aluno) =>
        normalizarTexto(aluno.nome).includes(termo) ||
        normalizarTexto(aluno.turma).includes(termo) ||
        normalizarTexto(aluno.serie).includes(termo),
    )
  }, [alunos, busca])

  const abrirNovo = () => {
    setAlunoEmEdicao(undefined)
    setDialogAberto(true)
  }

  const abrirEdicao = (aluno: Aluno) => {
    setAlunoEmEdicao(aluno)
    setDialogAberto(true)
  }

  const handleSalvar = (dados: DadosAluno) => {
    if (alunoEmEdicao) {
      atualizar(alunoEmEdicao.id, dados)
    } else {
      adicionar(dados)
    }
    setDialogAberto(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Alunos</h1>
          <p className="text-sm text-muted-foreground">Cadastro de alunos por turma e série.</p>
        </div>
        <Button onClick={abrirNovo} className="sm:self-start">
          <Plus className="size-4" />
          Novo aluno
        </Button>
      </div>

      <Input
        placeholder="Buscar por nome, turma ou série..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        className="max-w-sm"
      />

      <div className="rounded-lg border border-border bg-white">
        <AlunoTable
          alunos={alunosFiltrados}
          onEditar={abrirEdicao}
          onExcluir={remover}
          temEmprestimoAtivo={alunoTemEmprestimoAtivo}
        />
      </div>

      <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{alunoEmEdicao ? 'Editar aluno' : 'Novo aluno'}</DialogTitle>
          </DialogHeader>
          <AlunoForm
            key={alunoEmEdicao?.id ?? 'novo'}
            valorInicial={alunoEmEdicao}
            onSalvar={handleSalvar}
            onCancelar={() => setDialogAberto(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
