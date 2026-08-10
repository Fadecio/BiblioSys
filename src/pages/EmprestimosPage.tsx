import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EmprestimoForm } from '@/components/emprestimos/EmprestimoForm'
import { EmprestimoTable } from '@/components/emprestimos/EmprestimoTable'
import { useEmprestimos } from '@/hooks/useEmprestimos'
import { statusExibicao } from '@/utils/emprestimo'

type Filtro = 'todos' | 'ativos' | 'atrasados' | 'a-vencer'

const ABAS: { valor: Filtro; rotulo: string }[] = [
  { valor: 'todos', rotulo: 'Todos' },
  { valor: 'ativos', rotulo: 'Ativos' },
  { valor: 'a-vencer', rotulo: 'A vencer' },
  { valor: 'atrasados', rotulo: 'Atrasados' },
]

export const EmprestimosPage = () => {
  const { emprestimos, registrar } = useEmprestimos()
  const [filtro, setFiltro] = useState<Filtro>('todos')
  const [dialogAberto, setDialogAberto] = useState(false)

  const emprestimosFiltrados = useMemo(() => {
    if (filtro === 'todos') return emprestimos
    if (filtro === 'atrasados') return emprestimos.filter((e) => statusExibicao(e) === 'atrasado')
    if (filtro === 'a-vencer') return emprestimos.filter((e) => statusExibicao(e) === 'a-vencer')
    return emprestimos.filter((e) => e.status === 'ativo')
  }, [emprestimos, filtro])

  const handleRegistrar = (alunoId: string, livroId: string) => {
    const resultado = registrar(alunoId, livroId)
    if (resultado.sucesso) setDialogAberto(false)
    return resultado
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Empréstimos</h1>
          <p className="text-sm text-muted-foreground">Registro, devolução e renovação de empréstimos.</p>
        </div>
        <Button onClick={() => setDialogAberto(true)} className="sm:self-start">
          <Plus className="size-4" />
          Novo empréstimo
        </Button>
      </div>

      <Tabs value={filtro} onValueChange={(valor) => setFiltro(valor as Filtro)}>
        <TabsList className="w-full overflow-x-auto sm:w-fit">
          {ABAS.map((aba) => (
            <TabsTrigger key={aba.valor} value={aba.valor}>
              {aba.rotulo}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="rounded-lg border border-border bg-white">
        <EmprestimoTable emprestimos={emprestimosFiltrados} />
      </div>

      <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo empréstimo</DialogTitle>
          </DialogHeader>
          <EmprestimoForm onRegistrar={handleRegistrar} onCancelar={() => setDialogAberto(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
