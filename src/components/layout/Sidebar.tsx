import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ArrowLeftRight,
  Library,
  LogOut,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const ITENS_NAVEGACAO = [
  { rota: "/dashboard", rotulo: "Dashboard", icone: LayoutDashboard },
  { rota: "/alunos", rotulo: "Alunos", icone: Users },
  { rota: "/livros", rotulo: "Livros", icone: BookOpen },
  { rota: "/emprestimos", rotulo: "Empréstimos", icone: ArrowLeftRight },
];

interface SidebarConteudoProps {
  aoNavegar?: () => void;
}

// conteúdo compartilhado entre a sidebar fixa (desktop) e a gaveta (mobile)
export const SidebarConteudo = ({ aoNavegar }: SidebarConteudoProps) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    aoNavegar?.();
    navigate("/login", { replace: true });
  };

  return (
    <>
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <Library className="size-5 text-primary" />
        <span className="text-sm font-semibold text-foreground">BiblioSys</span>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {ITENS_NAVEGACAO.map(({ rota, rotulo, icone: Icone }) => (
          <NavLink
            key={rota}
            to={rota}
            onClick={aoNavegar}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                isActive &&
                  "bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary",
              )
            }
          >
            <Icone className="size-4" />
            {rotulo}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-border p-3">
        <div className="mb-3 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
          {user?.email}
        </div>
        <Button
          onClick={handleLogout}
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2"
        >
          <LogOut className="size-4" />
          Sair
        </Button>
      </div>
    </>
  );
};

export const Sidebar = () => {
  return (
    <aside className="hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-white md:flex">
      <SidebarConteudo />
    </aside>
  );
};
