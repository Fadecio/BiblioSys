import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
} from "@/components/ui/alert-dialog";
import type { Aluno } from "@/types";

interface AlunoTableProps {
  alunos: Aluno[];
  onEditar: (aluno: Aluno) => void;
  onExcluir: (id: string) => void;
}

export const AlunoTable = ({
  alunos,
  onEditar,
  onExcluir,
}: AlunoTableProps) => {
  if (alunos.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        Nenhum aluno encontrado.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="max-w-60">Nome</TableHead>
          <TableHead className="text-center">Série</TableHead>
          <TableHead className="text-center">Turma</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {alunos.map((aluno) => {
          return (
            <TableRow key={aluno.id}>
              <TableCell
                className="max-w-60 truncate font-medium text-foreground"
                title={aluno.nome}
              >
                {aluno.nome}
              </TableCell>
              <TableCell className="text-center">{aluno.serie}</TableCell>
              <TableCell className="text-center">{aluno.turma}</TableCell>
              <TableCell className="flex justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onEditar(aluno)}
                  aria-label="Editar aluno"
                >
                  <Pencil className="size-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Excluir aluno"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir aluno</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir {aluno.nome}? Essa ação
                        não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onExcluir(aluno.id)}>
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
