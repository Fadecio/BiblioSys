import { useState, type SubmitEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DialogFooter } from '@/components/ui/dialog'
import type { Livro, ResultadoAcao } from '@/types'
import type { DadosLivro } from '@/hooks/useLivros'

interface LivroFormProps {
  valorInicial?: Livro
  onSalvar: (dados: DadosLivro) => Promise<ResultadoAcao>
  onCancelar: () => void
}

export const LivroForm = ({ valorInicial, onSalvar, onCancelar }: LivroFormProps) => {
  const [titulo, setTitulo] = useState(valorInicial?.titulo ?? '')
  const [autor, setAutor] = useState(valorInicial?.autor ?? '')
  const [categoria, setCategoria] = useState(valorInicial?.categoria ?? '')
  const [codigo, setCodigo] = useState(valorInicial?.codigo ?? '')
  const [quantidadeTotal, setQuantidadeTotal] = useState(String(valorInicial?.quantidadeTotal ?? 1))
  const [erro, setErro] = useState('')

  const handleSubmit = async (evento: SubmitEvent) => {
    evento.preventDefault()

    const total = Number(quantidadeTotal)
    if (!titulo.trim() || !autor.trim() || !categoria.trim() || !codigo.trim()) {
      setErro('Todos os campos, exceto quantidade, são obrigatórios.')
      return
    }
    if (!Number.isInteger(total) || total < 1) {
      setErro('Quantidade total deve ser um número inteiro maior que zero.')
      return
    }
    if (valorInicial) {
      const quantidadeEmprestada = valorInicial.quantidadeTotal - valorInicial.quantidadeDisponivel
      if (total < quantidadeEmprestada) {
        setErro(
          `Quantidade total não pode ser menor que ${quantidadeEmprestada} — número de exemplares atualmente emprestados.`,
        )
        return
      }
    }

    const resultado = await onSalvar({
      titulo: titulo.trim(),
      autor: autor.trim(),
      categoria: categoria.trim(),
      codigo: codigo.trim(),
      quantidadeTotal: total,
    })
    if (!resultado.sucesso) setErro(resultado.mensagem ?? 'Não foi possível salvar o livro.')
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="titulo">Título</Label>
        <Input id="titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} autoFocus />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="autor">Autor</Label>
        <Input id="autor" value={autor} onChange={(e) => setAutor(e.target.value)} />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="categoria">Categoria</Label>
          <Input id="categoria" value={categoria} onChange={(e) => setCategoria(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="codigo">Código</Label>
          <Input id="codigo" value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="LIT-001" />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="quantidadeTotal">Quantidade total de exemplares</Label>
        <Input
          id="quantidadeTotal"
          type="number"
          min={1}
          value={quantidadeTotal}
          onChange={(e) => setQuantidadeTotal(e.target.value)}
        />
      </div>
      {erro && <p className="text-sm text-destructive">{erro}</p>}
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancelar}>
          Cancelar
        </Button>
        <Button type="submit">Salvar</Button>
      </DialogFooter>
    </form>
  )
}
