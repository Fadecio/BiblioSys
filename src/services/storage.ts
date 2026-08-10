import { addDays, subDays } from 'date-fns'
import type { Aluno, Emprestimo, Livro } from '@/types'

const CHAVES = {
  alunos: 'bibliosys:alunos',
  livros: 'bibliosys:livros',
  emprestimos: 'bibliosys:emprestimos',
  seed: 'bibliosys:seed',
} as const

const obter = <T>(chave: string): T[] => {
  const bruto = localStorage.getItem(chave)
  if (!bruto) return []

  try {
    return JSON.parse(bruto) as T[]
  } catch {
    // dado corrompido não pode derrubar a aplicação inteira — degrada pra lista vazia
    return []
  }
}

const salvar = <T>(chave: string, dados: T[]): void => {
  localStorage.setItem(chave, JSON.stringify(dados))
}

export const storage = {
  getAlunos: () => obter<Aluno>(CHAVES.alunos),
  setAlunos: (alunos: Aluno[]) => salvar(CHAVES.alunos, alunos),
  getLivros: () => obter<Livro>(CHAVES.livros),
  setLivros: (livros: Livro[]) => salvar(CHAVES.livros, livros),
  getEmprestimos: () => obter<Emprestimo>(CHAVES.emprestimos),
  setEmprestimos: (emprestimos: Emprestimo[]) => salvar(CHAVES.emprestimos, emprestimos),
}

const iso = (data: Date) => data.toISOString()

// dados de exemplo pra demo funcionar sem input manual (checklist §12); cobre os 4 estados de
// exibição de empréstimo (em dia, a vencer, atrasado, devolvido) e o bloqueio por disponibilidade zero
const gerarSeed = () => {
  const hoje = new Date()

  const alunos: Aluno[] = [
    { id: 'aluno-1', nome: 'Ana Beatriz Souza', turma: '5A', serie: '5º ano', criadoEm: iso(subDays(hoje, 120)) },
    { id: 'aluno-2', nome: 'Bruno Carvalho Lima', turma: '5A', serie: '5º ano', criadoEm: iso(subDays(hoje, 120)) },
    { id: 'aluno-3', nome: 'Carla Mendes Rocha', turma: '6B', serie: '6º ano', criadoEm: iso(subDays(hoje, 118)) },
    { id: 'aluno-4', nome: 'Diego Fernandes Alves', turma: '6B', serie: '6º ano', criadoEm: iso(subDays(hoje, 118)) },
    { id: 'aluno-5', nome: 'Elisa Ramos Teixeira', turma: '7A', serie: '7º ano', criadoEm: iso(subDays(hoje, 100)) },
    { id: 'aluno-6', nome: 'Felipe Nogueira Dias', turma: '7A', serie: '7º ano', criadoEm: iso(subDays(hoje, 100)) },
    { id: 'aluno-7', nome: 'Gabriela Pinto Duarte', turma: '8C', serie: '8º ano', criadoEm: iso(subDays(hoje, 90)) },
    { id: 'aluno-8', nome: 'Henrique Barbosa Cunha', turma: '8C', serie: '8º ano', criadoEm: iso(subDays(hoje, 90)) },
    { id: 'aluno-9', nome: 'Isabela Cardoso Martins', turma: '9A', serie: '9º ano', criadoEm: iso(subDays(hoje, 60)) },
    { id: 'aluno-10', nome: 'João Pedro Azevedo', turma: '9A', serie: '9º ano', criadoEm: iso(subDays(hoje, 60)) },
  ]

  const livrosBase: Array<Omit<Livro, 'quantidadeDisponivel'>> = [
    { id: 'livro-1', titulo: 'Dom Casmurro', autor: 'Machado de Assis', categoria: 'Romance', codigo: 'LIT-001', quantidadeTotal: 3 },
    { id: 'livro-2', titulo: 'O Pequeno Príncipe', autor: 'Antoine de Saint-Exupéry', categoria: 'Infantojuvenil', codigo: 'LIT-002', quantidadeTotal: 4 },
    { id: 'livro-3', titulo: 'Vidas Secas', autor: 'Graciliano Ramos', categoria: 'Romance', codigo: 'LIT-003', quantidadeTotal: 2 },
    { id: 'livro-4', titulo: 'Capitães da Areia', autor: 'Jorge Amado', categoria: 'Romance', codigo: 'LIT-004', quantidadeTotal: 3 },
    { id: 'livro-5', titulo: 'Iracema', autor: 'José de Alencar', categoria: 'Romance', codigo: 'LIT-005', quantidadeTotal: 2 },
    { id: 'livro-6', titulo: 'O Cortiço', autor: 'Aluísio Azevedo', categoria: 'Romance', codigo: 'LIT-006', quantidadeTotal: 2 },
    { id: 'livro-7', titulo: 'Memórias Póstumas de Brás Cubas', autor: 'Machado de Assis', categoria: 'Romance', codigo: 'LIT-007', quantidadeTotal: 2 },
    { id: 'livro-8', titulo: 'A Moreninha', autor: 'Joaquim Manuel de Macedo', categoria: 'Romance', codigo: 'LIT-008', quantidadeTotal: 1 },
    { id: 'livro-9', titulo: 'Sítio do Picapau Amarelo', autor: 'Monteiro Lobato', categoria: 'Infantojuvenil', codigo: 'LIT-009', quantidadeTotal: 3 },
    { id: 'livro-10', titulo: 'Uma Aventura Vaga-Lume', autor: 'Vários Autores', categoria: 'Infantojuvenil', codigo: 'LIT-010', quantidadeTotal: 4 },
    { id: 'livro-11', titulo: 'Enciclopédia de Ciências', autor: 'Editora Ática', categoria: 'Didático', codigo: 'LIT-011', quantidadeTotal: 2 },
    { id: 'livro-12', titulo: 'Atlas Geográfico Escolar', autor: 'IBGE Educa', categoria: 'Didático', codigo: 'LIT-012', quantidadeTotal: 2 },
  ]

  const emprestimos: Emprestimo[] = [
    { id: 'emprestimo-1', alunoId: 'aluno-1', livroId: 'livro-1', dataEmprestimo: iso(subDays(hoje, 3)), dataPrevistaDevolucao: iso(addDays(hoje, 4)), status: 'ativo', renovacoes: 0 },
    { id: 'emprestimo-2', alunoId: 'aluno-2', livroId: 'livro-2', dataEmprestimo: iso(subDays(hoje, 6)), dataPrevistaDevolucao: iso(addDays(hoje, 1)), status: 'ativo', renovacoes: 0 },
    { id: 'emprestimo-3', alunoId: 'aluno-3', livroId: 'livro-3', dataEmprestimo: iso(subDays(hoje, 5)), dataPrevistaDevolucao: iso(addDays(hoje, 2)), status: 'ativo', renovacoes: 0 },
    { id: 'emprestimo-4', alunoId: 'aluno-4', livroId: 'livro-8', dataEmprestimo: iso(subDays(hoje, 10)), dataPrevistaDevolucao: iso(subDays(hoje, 3)), status: 'atrasado', renovacoes: 0 },
    { id: 'emprestimo-5', alunoId: 'aluno-5', livroId: 'livro-4', dataEmprestimo: iso(subDays(hoje, 17)), dataPrevistaDevolucao: iso(subDays(hoje, 10)), status: 'atrasado', renovacoes: 1 },
    { id: 'emprestimo-6', alunoId: 'aluno-6', livroId: 'livro-1', dataEmprestimo: iso(subDays(hoje, 20)), dataPrevistaDevolucao: iso(subDays(hoje, 13)), dataDevolucao: iso(subDays(hoje, 12)), status: 'devolvido', renovacoes: 0 },
    { id: 'emprestimo-7', alunoId: 'aluno-7', livroId: 'livro-1', dataEmprestimo: iso(subDays(hoje, 15)), dataPrevistaDevolucao: iso(subDays(hoje, 8)), dataDevolucao: iso(subDays(hoje, 7)), status: 'devolvido', renovacoes: 0 },
    { id: 'emprestimo-8', alunoId: 'aluno-8', livroId: 'livro-9', dataEmprestimo: iso(subDays(hoje, 2)), dataPrevistaDevolucao: iso(addDays(hoje, 5)), status: 'ativo', renovacoes: 0 },
    { id: 'emprestimo-9', alunoId: 'aluno-9', livroId: 'livro-2', dataEmprestimo: iso(subDays(hoje, 12)), dataPrevistaDevolucao: iso(subDays(hoje, 5)), dataDevolucao: iso(subDays(hoje, 4)), status: 'devolvido', renovacoes: 0 },
    { id: 'emprestimo-10', alunoId: 'aluno-10', livroId: 'livro-10', dataEmprestimo: iso(subDays(hoje, 9)), dataPrevistaDevolucao: iso(subDays(hoje, 2)), dataDevolucao: iso(subDays(hoje, 1)), status: 'devolvido', renovacoes: 0 },
  ]

  const emprestados = new Map<string, number>()
  for (const emprestimo of emprestimos) {
    if (emprestimo.dataDevolucao) continue
    emprestados.set(emprestimo.livroId, (emprestados.get(emprestimo.livroId) ?? 0) + 1)
  }

  const livros: Livro[] = livrosBase.map((livro) => ({
    ...livro,
    quantidadeDisponivel: livro.quantidadeTotal - (emprestados.get(livro.id) ?? 0),
  }))

  return { alunos, livros, emprestimos }
}

export const inicializarSeed = (): void => {
  if (localStorage.getItem(CHAVES.seed)) return

  const { alunos, livros, emprestimos } = gerarSeed()
  storage.setAlunos(alunos)
  storage.setLivros(livros)
  storage.setEmprestimos(emprestimos)
  localStorage.setItem(CHAVES.seed, '1')
}
