import { useState, type SubmitEvent } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarClock, RotateCw, Undo2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { StatusBadge } from '@/components/emprestimos/StatusBadge'
import { useAlunos } from '@/hooks/useAlunos'
import { useLivros } from '@/hooks/useLivros'
import { useEmprestimos } from '@/hooks/useEmprestimos'
import { calcularDataPrevista, podeRenovar, statusExibicao } from '@/utils/emprestimo'
import type { Emprestimo } from '@/types'

const formatarData = (data: string) => format(new Date(data), 'dd/MM/yyyy', { locale: ptBR })

interface EmprestimoTableProps {
  emprestimos: Emprestimo[]
}

export const EmprestimoTable = ({ emprestimos }: EmprestimoTableProps) => {
  const { alunos, carregando: carregandoAlunos } = useAlunos()
  const { livros, carregando: carregandoLivros } = useLivros()
  const { devolver, renovar, editarData } = useEmprestimos()
  const [erro, setErro] = useState('')
  const [emprestimoEmEdicao, setEmprestimoEmEdicao] = useState<Emprestimo | null>(null)
  const [novaData, setNovaData] = useState('')
  const [erroData, setErroData] = useState('')

  // evita mostrar "Aluno/Livro removido" por engano enquanto os dados relacionados ainda
  // estão chegando do Supabase (localStorage nunca tinha essa janela de carregamento)
  if (carregandoAlunos || carregandoLivros) {
    return <p className="py-10 text-center text-sm text-muted-foreground">Carregando...</p>
  }

  if (emprestimos.length === 0) {
    return <p className="py-10 text-center text-sm text-muted-foreground">Nenhum empréstimo encontrado.</p>
  }

  const handleDevolver = async (id: string) => {
    const resultado = await devolver(id)
    setErro(!resultado.sucesso ? (resultado.mensagem ?? '') : '')
  }

  const handleRenovar = async (id: string) => {
    const resultado = await renovar(id)
    setErro(!resultado.sucesso ? (resultado.mensagem ?? '') : '')
  }

  const abrirEdicaoData = (emprestimo: Emprestimo) => {
    setEmprestimoEmEdicao(emprestimo)
    setNovaData(emprestimo.dataEmprestimo.slice(0, 10))
    setErroData('')
  }

  const handleSalvarData = async (evento: SubmitEvent) => {
    evento.preventDefault()
    if (!emprestimoEmEdicao) return

    const resultado = await editarData(emprestimoEmEdicao.id, novaData)
    if (resultado.sucesso) {
      setEmprestimoEmEdicao(null)
    } else {
      setErroData(resultado.mensagem ?? 'Não foi possível editar a data do empréstimo.')
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {erro && <p className="px-2 pt-2 text-sm text-destructive">{erro}</p>}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Aluno</TableHead>
            <TableHead>Livro</TableHead>
            <TableHead>Devolução prevista</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Renovações</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {emprestimos.map((emprestimo) => {
            const aluno = alunos.find((item) => item.id === emprestimo.alunoId)
            const livro = livros.find((item) => item.id === emprestimo.livroId)
            const status = statusExibicao(emprestimo)
            const devolvido = status === 'devolvido'

            return (
              <TableRow key={emprestimo.id}>
                <TableCell className="font-medium text-foreground">{aluno?.nome ?? 'Aluno removido'}</TableCell>
                <TableCell>{livro?.titulo ?? 'Livro removido'}</TableCell>
                <TableCell>{formatarData(emprestimo.dataPrevistaDevolucao)}</TableCell>
                <TableCell>
                  <StatusBadge status={status} />
                </TableCell>
                <TableCell>{emprestimo.renovacoes}</TableCell>
                <TableCell className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Editar data do empréstimo"
                    onClick={() => abrirEdicaoData(emprestimo)}
                  >
                    <CalendarClock className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Renovar empréstimo"
                    disabled={devolvido || !podeRenovar(emprestimo)}
                    onClick={() => handleRenovar(emprestimo.id)}
                  >
                    <RotateCw className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Registrar devolução"
                    disabled={devolvido}
                    onClick={() => handleDevolver(emprestimo.id)}
                  >
                    <Undo2 className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            )
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
          <form onSubmit={handleSalvarData} noValidate className="flex flex-col gap-4">
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
                  Devolução prevista recalculada: {formatarData(calcularDataPrevista(novaData))} (7
                  dias a partir da data do empréstimo)
                </p>
              )}
            </div>
            {erroData && <p className="text-sm text-destructive">{erroData}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEmprestimoEmEdicao(null)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
