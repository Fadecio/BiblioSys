import * as React from "react"
import { Ellipsis, Plus } from "lucide-react"

import { cn } from "@/lib/utils"

function Card({
  className,
  size = "default",
  ...props
}: React.ComponentProps<"div"> & { size?: "default" | "sm" }) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(
        "group/card flex flex-col gap-(--card-spacing) overflow-hidden rounded-xl bg-card py-(--card-spacing) text-sm text-card-foreground ring-1 ring-foreground/10 [--card-spacing:--spacing(4)] has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:[--card-spacing:--spacing(3)] data-[size=sm]:has-data-[slot=card-footer]:pb-0 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-xl px-(--card-spacing) has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-(--card-spacing)",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "font-heading text-base leading-snug font-medium group-data-[size=sm]/card:text-sm",
        className
      )}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-(--card-spacing)", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center rounded-b-xl border-t bg-muted/50 p-(--card-spacing)",
        className
      )}
      {...props}
    />
  )
}

export interface ProgressCardAvatar {
  src: string
  alt?: string
}

export interface ProgressCardData {
  cor: "green" | "orange" | "red" | "blue"
  data: string
  titulo: string
  descricao: string
  progresso: number
  avatares?: ProgressCardAvatar[]
  textoContagem: string
  aoAdicionar?: () => void
}

// paleta reaproveita os mesmos tons semânticos já usados em StatusBadge/CardsResumo
// (emerald/amber/red) em vez de introduzir cores novas hardcoded
const PROGRESS_CARD_CORES: Record<ProgressCardData["cor"], string> = {
  green: "bg-emerald-500",
  orange: "bg-amber-500",
  red: "bg-red-500",
  blue: "bg-primary",
}

function ProgressCard({
  cor,
  data,
  titulo,
  descricao,
  progresso,
  avatares = [],
  textoContagem,
  aoAdicionar,
}: ProgressCardData) {
  const corBarra = PROGRESS_CARD_CORES[cor]

  return (
    <Card className="gap-0 py-0">
      <div className={cn("h-1.5 w-full", corBarra)} />
      <CardHeader className="flex-row items-center justify-between pt-(--card-spacing)">
        <span className="text-xs text-muted-foreground">{data}</span>
        <button
          type="button"
          aria-label="Mais opções"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          <Ellipsis className="size-4" />
        </button>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div>
          <CardTitle className="capitalize">{titulo}</CardTitle>
          <CardDescription>{descricao}</CardDescription>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Progresso</span>
            <span className="font-medium text-foreground">{progresso}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn("h-full rounded-full", corBarra)}
              style={{ width: `${progresso}%` }}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="items-center justify-between border-t-0 bg-transparent pt-0">
        <ul className="flex -space-x-2">
          {avatares.map((avatar) => (
            <li key={avatar.src}>
              <img
                src={avatar.src}
                alt={avatar.alt ?? "Avatar"}
                className="size-7 rounded-full object-cover ring-2 ring-card"
              />
            </li>
          ))}
          <li>
            <button
              type="button"
              aria-label="Adicionar participante"
              onClick={aoAdicionar}
              className="flex size-7 items-center justify-center rounded-full border border-dashed border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
            >
              <Plus className="size-3.5" />
            </button>
          </li>
        </ul>
        <span className="text-xs text-muted-foreground">{textoContagem}</span>
      </CardFooter>
    </Card>
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  ProgressCard,
}
