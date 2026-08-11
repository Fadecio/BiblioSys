import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { LivroForm } from '@/components/livros/LivroForm'
import { LivroTable } from '@/components/livros/LivroTable'
import { useLivros, type DadosLivro } from '@/hooks/useLivros'
import { normalizarTexto } from '@/utils/texto'
import type { Livro } from '@/types'

export const LivrosPage = () => {
  const { livros, adicionar, atualizar, remover } = useLivros()
  const [busca, setBusca] = useState('')
  const [dialogAberto, setDialogAberto] = useState(false)
  const [livroEmEdicao, setLivroEmEdicao] = useState<Livro | undefined>(undefined)

  const livrosFiltrados = useMemo(() => {
    const termo = normalizarTexto(busca.trim())
    const filtrados = termo
      ? livros.filter(
          (livro) =>
            normalizarTexto(livro.titulo).includes(termo) ||
            normalizarTexto(livro.autor).includes(termo) ||
            normalizarTexto(livro.categoria).includes(termo) ||
            normalizarTexto(livro.codigo).includes(termo),
        )
      : livros
    return [...filtrados].sort((a, b) => a.titulo.localeCompare(b.titulo, 'pt-BR'))
  }, [livros, busca])

  const abrirNovo = () => {
    setLivroEmEdicao(undefined)
    setDialogAberto(true)
  }

  const abrirEdicao = (livro: Livro) => {
    setLivroEmEdicao(livro)
    setDialogAberto(true)
  }

  const handleSalvar = (dados: DadosLivro) => {
    if (livroEmEdicao) {
      atualizar(livroEmEdicao.id, dados)
    } else {
      adicionar(dados)
    }
    setDialogAberto(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Livros</h1>
          <p className="text-sm text-muted-foreground">Acervo da biblioteca e disponibilidade de exemplares.</p>
        </div>
        <Button onClick={abrirNovo} className="sm:self-start">
          <Plus className="size-4" />
          Novo livro
        </Button>
      </div>

      <Input
        placeholder="Buscar por título, autor, categoria ou código..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        className="max-w-sm"
      />

      <div className="overflow-x-auto rounded-lg border border-border bg-white">
        <LivroTable livros={livrosFiltrados} onEditar={abrirEdicao} onExcluir={remover} />
      </div>

      <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{livroEmEdicao ? 'Editar livro' : 'Novo livro'}</DialogTitle>
          </DialogHeader>
          <LivroForm
            key={livroEmEdicao?.id ?? 'novo'}
            valorInicial={livroEmEdicao}
            onSalvar={handleSalvar}
            onCancelar={() => setDialogAberto(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
