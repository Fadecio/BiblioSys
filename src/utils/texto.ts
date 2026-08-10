const MARCAS_DIACRITICAS = /\p{Mn}/gu

// remove acentuação e normaliza caixa pra permitir busca tolerante (ex.: "sitio" encontra "Sítio")
export const normalizarTexto = (valor: string) =>
  valor.normalize('NFD').replace(MARCAS_DIACRITICAS, '').toLowerCase()
