const MARCAS_DIACRITICAS = /\p{Mn}/gu
// °/º/ª não são marcas diacríticas (não somem no NFD) mas são digitados de forma
// inconsistente em série/turma (ex.: "4° ano" vs "4º ANO") — sem isso, dois alunos da
// mesma turma digitados com símbolos diferentes viram grupos separados na listagem.
const SIMBOLOS_ORDINAIS = /[°ºª]/g

// remove acentuação, símbolos ordinais e normaliza caixa/espaços pra permitir busca e
// agrupamento tolerantes (ex.: "sitio" encontra "Sítio"; "4 ano" casa com "4º ANO")
export const normalizarTexto = (valor: string) =>
  valor
    .normalize('NFD')
    .replace(MARCAS_DIACRITICAS, '')
    .replace(SIMBOLOS_ORDINAIS, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
