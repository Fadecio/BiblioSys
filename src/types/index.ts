export interface Aluno {
  id: string;
  nome: string;
  turma: string;
  serie: string;
  telefone?: string;
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

// retorno padrão das operações de escrita dos hooks (Supabase pode falhar por rede,
// permissão ou regra de negócio — diferente do localStorage, que nunca falhava)
export interface ResultadoAcao {
  sucesso: boolean;
  mensagem?: string;
}
