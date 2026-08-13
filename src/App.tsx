import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { DashboardPage } from "@/pages/DashboardPage";
import { AlunosPage } from "@/pages/AlunosPage";
import { LivrosPage } from "@/pages/LivrosPage";
import { EmprestimosPage } from "@/pages/EmprestimosPage";
import { LoginPage } from "@/pages/LoginPage";
import { useAuth } from "@/hooks/useAuth";

const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-100 text-sm text-muted-foreground">
        Carregando...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/alunos" element={<AlunosPage />} />
        <Route path="/livros" element={<LivrosPage />} />
        <Route path="/emprestimos" element={<EmprestimosPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
