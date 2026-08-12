import { useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { RotateCw, Undo2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { StatusBadge } from '@/components/emprestimos/StatusBadge'
import { useAlunos } from '@/hooks/useAlunos'
import { useLivros } from '@/hooks/useLivros'
import { useEmprestimos } from '@/hooks/useEmprestimos'
import { podeRenovar, statusExibicao } from '@/utils/emprestimo'
import type { Emprestimo } from '@/types'

const formatarData = (data: string) => format(new Date(data), 'dd/MM/yyyy', { locale: ptBR })

interface EmprestimoTableProps {
  emprestimos: Emprestimo[]
}

export const EmprestimoTable = ({ emprestimos }: EmprestimoTableProps) => {
  const { alunos, carregando: carregandoAlunos } = useAlunos()
  const { livros, carregando: carregandoLivros } = useLivros()
  const { devolver, renovar } = useEmprestimos()
  const [erro, setErro] = useState('')

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
    </div>
  )
}
