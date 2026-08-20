import { useMemo, useState } from "react"
import { Check, ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { normalizarTexto } from "@/utils/texto"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export interface ComboboxOption {
  value: string
  label: string
  searchValue?: string
  disabled?: boolean
  group?: string
}

interface ComboboxProps {
  options: ComboboxOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  className?: string
}

export const Combobox = ({
  options,
  value,
  onChange,
  placeholder = "Selecione...",
  searchPlaceholder = "Buscar...",
  emptyMessage = "Nenhum resultado encontrado.",
  className,
}: ComboboxProps) => {
  const [aberto, setAberto] = useState(false)
  const [busca, setBusca] = useState("")

  const selecionado = options.find((option) => option.value === value)

  const opcoesFiltradas = useMemo(() => {
    const termo = normalizarTexto(busca.trim())
    if (!termo) return options
    return options.filter((option) => normalizarTexto(option.searchValue ?? option.label).includes(termo))
  }, [options, busca])

  return (
    <Popover
      open={aberto}
      onOpenChange={(open) => {
        setAberto(open)
        if (!open) setBusca("")
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex h-8 w-full items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm whitespace-nowrap transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            !selecionado && "text-muted-foreground",
            className
          )}
        >
          <span className="truncate">{selecionado?.label ?? placeholder}</span>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-(--radix-popover-trigger-width) min-w-56">
        <div className="border-b border-border p-1.5">
          <Input
            autoFocus
            placeholder={searchPlaceholder}
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <div className="max-h-60 overflow-y-auto p-1">
          {opcoesFiltradas.length === 0 && (
            <p className="px-2 py-4 text-center text-sm text-muted-foreground">{emptyMessage}</p>
          )}
          {opcoesFiltradas.map((option, indice) => {
            const grupoAnterior = opcoesFiltradas[indice - 1]?.group
            const mostrarCabecalho = option.group && option.group !== grupoAnterior

            return (
              <div key={option.value}>
                {mostrarCabecalho && (
                  <p className="px-1.5 pt-2 pb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase first:pt-1">
                    {option.group}
                  </p>
                )}
                <button
                  type="button"
                  disabled={option.disabled}
                  onClick={() => {
                    onChange(option.value)
                    setAberto(false)
                    setBusca("")
                  }}
                  className={cn(
                    "flex w-full items-center gap-1.5 rounded-md px-1.5 py-1.5 text-left text-sm outline-hidden hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50",
                    option.value === value && "bg-accent/50"
                  )}
                >
                  <Check className={cn("size-4 shrink-0", option.value === value ? "opacity-100" : "opacity-0")} />
                  <span className="truncate">{option.label}</span>
                </button>
              </div>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
