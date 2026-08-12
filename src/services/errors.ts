import type { PostgrestError } from '@supabase/supabase-js'

// Erro de aplicação com mensagem já traduzida pra o usuário final. O detalhe técnico
// (código Postgres, mensagem original) fica só no console — nunca exposto na UI (BD.md §16).
export class ServiceError extends Error {
  cause?: unknown

  constructor(message: string, cause?: unknown) {
    super(message)
    this.name = 'ServiceError'
    this.cause = cause
  }
}

const MENSAGENS_POR_CODIGO: Record<string, string> = {
  '23505': 'Já existe um registro com esse valor único (ex.: ISBN ou matrícula duplicados).',
  '23503': 'Operação inválida: o registro relacionado não existe ou não pode ser removido porque está em uso.',
  '42501': 'Você não tem permissão para realizar esta ação.',
  PGRST116: 'Registro não encontrado.',
  P0001: '', // mensagem já vem pronta de RAISE EXCEPTION no banco — ver abaixo
  P0002: '',
}

// Erros lançados por RAISE EXCEPTION nas funções/triggers do banco (P0001/P0002, ver
// supabase/migrations/008 e 009) já trazem uma mensagem pronta pra exibir ao usuário.
export const traduzirErroSupabase = (error: PostgrestError, contexto: string): ServiceError => {
  console.error(`[supabase] ${contexto}:`, error)

  if (error.code === 'P0001' || error.code === 'P0002') {
    return new ServiceError(error.message.replace(/^.*?:\s*/, ''), error)
  }

  const mensagem = MENSAGENS_POR_CODIGO[error.code ?? '']
  if (mensagem) return new ServiceError(mensagem, error)

  return new ServiceError('Não foi possível completar a operação. Tente novamente em instantes.', error)
}

export const erroDeConexao = (contexto: string, error: unknown): ServiceError => {
  console.error(`[supabase] falha de conexão em ${contexto}:`, error)
  return new ServiceError('Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.', error)
}

// executa uma chamada supabase (que retorna { data, error } em vez de lançar) e normaliza
// os dois jeitos de falhar — erro de negócio/banco (PostgrestError) e falha de rede/conexão —
// num único ServiceError com mensagem pronta pra UI. Usado por todos os *.service.ts.
export const run = async <T>(
  contexto: string,
  chamada: () => PromiseLike<{ data: T | null; error: PostgrestError | null }>,
): Promise<T> => {
  try {
    const { data, error } = await chamada()
    if (error) throw traduzirErroSupabase(error, contexto)
    return data as T
  } catch (e) {
    if (e instanceof ServiceError) throw e
    throw erroDeConexao(contexto, e)
  }
}
