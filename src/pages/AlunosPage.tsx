import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { AlunoForm } from '@/components/alunos/AlunoForm'
import { AlunoTable } from '@/components/alunos/AlunoTable'
import { StatusBadge } from '@/components/emprestimos/StatusBadge'
import { useAlunos } from '@/hooks/useAlunos'
import { useLivros } from '@/hooks/useLivros'
import { useEmprestimos } from '@/hooks/useEmprestimos'
import type { DadosAluno } from '@/contexts/AlunosContext'
import { normalizarTexto } from '@/utils/texto'
import { statusExibicao } from '@/utils/emprestimo'
import type { Aluno } from '@/types'

// data vem como "yyyy-MM-dd" (coluna `date` do Postgres, sem hora/fuso) — parseISO trata
// como meia-noite local; new Date() trataria como UTC e "voltava" um dia em fusos como o do
// Brasil (UTC-3) ao formatar na hora local.
const formatarData = (data: string) => format(parseISO(data), 'dd/MM/yyyy', { locale: ptBR })

export const AlunosPage = () => {
  const { alunos, erro, adicionar, atualizar, remover } = useAlunos()
  const { livros } = useLivros()
  const { emprestimos } = useEmprestimos()
  const [busca, setBusca] = useState('')
  const [dialogAberto, setDialogAberto] = useState(false)
  const [alunoEmEdicao, setAlunoEmEdicao] = useState<Aluno | undefined>(undefined)
  const [erroExclusao, setErroExclusao] = useState('')
  const [alunoHistorico, setAlunoHistorico] = useState<Aluno | null>(null)

  const historicoDoAluno = useMemo(() => {
    if (!alunoHistorico) return []
    return emprestimos
      .filter((emprestimo) => emprestimo.alunoId === alunoHistorico.id)
      .sort((a, b) => b.dataEmprestimo.localeCompare(a.dataEmprestimo))
  }, [emprestimos, alunoHistorico])

  const alunosFiltrados = useMemo(() => {
    const termo = normalizarTexto(busca.trim())
    const filtrados = termo
      ? alunos.filter(
          (aluno) =>
            normalizarTexto(aluno.nome).includes(termo) ||
            normalizarTexto(aluno.turma).includes(termo) ||
            normalizarTexto(aluno.serie).includes(termo),
        )
      : alunos
    return [...filtrados].sort((a, b) => {
      // comparado pela forma normalizada (ver AlunoTable) — evita que "4° ano" e "4º ANO"
      // (mesma turma, símbolo/caixa diferentes) ordenem de um jeito que quebre o agrupamento
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
  }, [alunos, busca])

  const abrirNovo = () => {
    setAlunoEmEdicao(undefined)
    setDialogAberto(true)
  }

  const abrirEdicao = (aluno: Aluno) => {
    setAlunoEmEdicao(aluno)
    setDialogAberto(true)
  }

  const handleSalvar = async (dados: DadosAluno) => {
    const resultado = alunoEmEdicao ? await atualizar(alunoEmEdicao.id, dados) : await adicionar(dados)
    if (resultado.sucesso) setDialogAberto(false)
    return resultado
  }

  const handleExcluir = async (id: string) => {
    const resultado = await remover(id)
    setErroExclusao(resultado.sucesso ? '' : (resultado.mensagem ?? ''))
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

      {(erro || erroExclusao) && <p className="text-sm text-destructive">{erro ?? erroExclusao}</p>}

      <div className="overflow-x-auto rounded-lg border border-border bg-white">
        <AlunoTable
          alunos={alunosFiltrados}
          onEditar={abrirEdicao}
          onExcluir={handleExcluir}
          onVerHistorico={setAlunoHistorico}
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

      <Dialog open={alunoHistorico !== null} onOpenChange={(aberto) => !aberto && setAlunoHistorico(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Histórico de empréstimos — {alunoHistorico?.nome}</DialogTitle>
          </DialogHeader>
          {historicoDoAluno.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Este aluno ainda não pegou nenhum livro emprestado.
            </p>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-left">Livro</TableHead>
                    <TableHead className="text-center">Empréstimo</TableHead>
                    <TableHead className="text-center">Devolução prevista</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historicoDoAluno.map((emprestimo) => {
                    const livro = livros.find((item) => item.id === emprestimo.livroId)
                    return (
                      <TableRow key={emprestimo.id}>
                        <TableCell className="text-left">{livro?.titulo ?? 'Livro removido'}</TableCell>
                        <TableCell className="text-center">{formatarData(emprestimo.dataEmprestimo)}</TableCell>
                        <TableCell className="text-center">
                          {formatarData(emprestimo.dataPrevistaDevolucao)}
                        </TableCell>
                        <TableCell className="text-center">
                          <StatusBadge status={statusExibicao(emprestimo)} />
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
