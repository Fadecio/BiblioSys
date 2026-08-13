import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ArrowLeftRight,
  Library,
  LogOut,
  ChevronLeft,
  ChevronRight,
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
  isCollapsed?: boolean;
}

// conteúdo compartilhado entre a sidebar fixa (desktop) e a gaveta (mobile)
export const SidebarConteudo = ({
  aoNavegar,
  isCollapsed = false,
}: SidebarConteudoProps) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    aoNavegar?.();
    navigate("/login", { replace: true });
  };

  return (
    <>
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
            title={isCollapsed ? rotulo : undefined}
          >
            <Icone className="size-4 shrink-0" />
            {!isCollapsed && <span>{rotulo}</span>}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-border p-3">
        {!isCollapsed && (
          <div
            className="mb-3 rounded-lg bg-muted p-3 text-sm text-muted-foreground truncate"
            title={user?.email}
          >
            {user?.email}
          </div>
        )}
        <Button
          onClick={handleLogout}
          variant="outline"
          size="sm"
          className={cn(
            "justify-start gap-2",
            isCollapsed ? "w-full p-2" : "w-full",
          )}
          title={isCollapsed ? "Sair" : undefined}
        >
          <LogOut className="size-4 shrink-0" />
          {!isCollapsed && <span>Sair</span>}
        </Button>
      </div>
    </>
  );
};

interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export const Sidebar = ({ isCollapsed = false, onToggle }: SidebarProps) => {
  return (
    <aside
      className={`hidden h-screen shrink-0 flex-col border-r border-border bg-white transition-all duration-300 md:flex ${
        isCollapsed ? "w-20" : "w-60"
      }`}
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <Library className="size-5 text-primary" />
            <span className="text-sm font-semibold text-foreground">
              BiblioSys
            </span>
          </div>
        )}
        {isCollapsed && <Library className="size-5 text-primary" />}
        <button
          onClick={onToggle}
          className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label={isCollapsed ? "Expandir" : "Recolher"}
        >
          {isCollapsed ? (
            <ChevronRight className="size-4" />
          ) : (
            <ChevronLeft className="size-4" />
          )}
        </button>
      </div>
      <SidebarConteudo isCollapsed={isCollapsed} />
    </aside>
  );
};
