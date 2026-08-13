import { useState } from "react";
import { Menu, Library } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SidebarConteudo } from "@/components/layout/Sidebar";

export const MobileNav = () => {
  const [aberto, setAberto] = useState(false);

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-white px-4 md:hidden">
      <Sheet open={aberto} onOpenChange={setAberto}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Abrir menu de navegação"
          >
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 gap-0 p-0 flex flex-col">
          <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <Library className="size-5 text-primary" />
            <span className="text-sm font-semibold text-foreground">
              BiblioSys
            </span>
          </div>
          <SidebarConteudo aoNavegar={() => setAberto(false)} />
        </SheetContent>
      </Sheet>
      <div className="flex items-center gap-2">
        <Library className="size-5 text-primary" />
        <span className="text-sm font-semibold text-foreground">BiblioSys</span>
      </div>
    </header>
  );
};
