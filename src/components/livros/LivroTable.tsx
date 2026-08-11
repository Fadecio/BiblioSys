import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import type { Livro } from '@/types'

interface LivroTableProps {
  livros: Livro[]
  onEditar: (livro: Livro) => void
  onExcluir: (id: string) => void
}

export const LivroTable = ({ livros, onEditar, onExcluir }: LivroTableProps) => {
  if (livros.length === 0) {
    return <p className="py-10 text-center text-sm text-muted-foreground">Nenhum livro encontrado.</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">Nº</TableHead>
          <TableHead className="max-w-60">Título</TableHead>
          <TableHead className="max-w-45">Autor</TableHead>
          <TableHead>Categoria</TableHead>
          <TableHead>Código</TableHead>
          <TableHead>Disponibilidade</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {livros.map((livro, index) => {
          return (
            <TableRow key={livro.id}>
              <TableCell className="text-muted-foreground">{index + 1}</TableCell>
              <TableCell className="max-w-60 truncate font-medium text-foreground" title={livro.titulo}>
                {livro.titulo}
              </TableCell>
              <TableCell className="max-w-45 truncate" title={livro.autor}>
                {livro.autor}
              </TableCell>
              <TableCell>{livro.categoria}</TableCell>
              <TableCell>{livro.codigo}</TableCell>
              <TableCell>
                <Badge variant={livro.quantidadeDisponivel === 0 ? 'destructive' : 'secondary'}>
                  {livro.quantidadeDisponivel} / {livro.quantidadeTotal}
                </Badge>
              </TableCell>
              <TableCell className="flex justify-end gap-1">
                <Button variant="ghost" size="icon-sm" onClick={() => onEditar(livro)} aria-label="Editar livro">
                  <Pencil className="size-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon-sm" aria-label="Excluir livro">
                      <Trash2 className="size-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir livro</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir "{livro.titulo}"? Essa ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onExcluir(livro.id)}>Excluir</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
