export interface Aluno {
  id: string;
  nome: string;
  turma: string;
  serie: string;
  criadoEm: string;
}

export interface Livro {
  id: string;
  titulo: string;
  autor: string;
  categoria: string;
  codigo: string;
  quantidadeTotal: number;
  quantidadeDisponivel: number;
}

export type StatusEmprestimo = "ativo" | "devolvido" | "atrasado";

export interface Emprestimo {
  id: string;
  alunoId: string;
  livroId: string;
  dataEmprestimo: string;
  dataPrevistaDevolucao: string;
  dataDevolucao?: string;
  status: StatusEmprestimo;
  renovacoes: number;
}
