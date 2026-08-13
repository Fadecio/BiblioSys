import "./index.css";
import { StrictMode } from "react";
import { createRoot, type Root } from "react-dom/client";

function renderStartupError(root: Root, error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  const isConfigError = message.includes("Supabase não configurado");

  root.render(
    <div className="flex min-h-screen items-center justify-center bg-background p-8 text-foreground">
      <div className="max-w-lg">
        <h1 className="mb-3 text-lg font-semibold">
          Não foi possível iniciar o BiblioSys
        </h1>
        <p className="mb-3 font-mono text-sm text-destructive">{message}</p>
        {isConfigError ? (
          <p className="text-muted-foreground">
            Verifique se o arquivo <code>.env</code> existe na raiz do projeto
            com <code>VITE_SUPABASE_URL</code> e{" "}
            <code>VITE_SUPABASE_ANON_KEY</code> preenchidos (veja{" "}
            <code>.env.example</code> e <code>docs/database.md</code>), depois
            reinicie o servidor de desenvolvimento.
          </p>
        ) : (
          <p className="text-muted-foreground">
            Verifique sua conexão com a internet e recarregue a página. Se o
            problema persistir, veja o console do navegador para mais detalhes.
          </p>
        )}
      </div>
    </div>,
  );
}

async function bootstrap(root: Root) {
  const [
    { BrowserRouter },
    { AuthProvider },
    { AlunosProvider },
    { LivrosProvider },
    { EmprestimosProvider },
    { default: App },
  ] = await Promise.all([
    import("react-router-dom"),
    import("@/hooks/useAuth"),
    import("@/hooks/useAlunos"),
    import("@/hooks/useLivros"),
    import("@/hooks/useEmprestimos"),
    import("./App.tsx"),
  ]);

  root.render(
    <StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <AlunosProvider>
            <LivrosProvider>
              <EmprestimosProvider>
                <App />
              </EmprestimosProvider>
            </LivrosProvider>
          </AlunosProvider>
        </AuthProvider>
      </BrowserRouter>
    </StrictMode>,
  );
}

function main() {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    document.body.textContent =
      "Erro: elemento #root não encontrado em index.html.";
    return;
  }

  const root = createRoot(rootElement);
  bootstrap(root).catch((error) => renderStartupError(root, error));
}

main();
