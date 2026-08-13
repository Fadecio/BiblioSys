import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";

export const LoginPage = () => {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();

  const [modo, setModo] = useState<"login" | "cadastro">("login");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErro("");
    setSucesso("");
    setCarregando(true);

    const resultado =
      modo === "login"
        ? await signIn(email, senha)
        : await signUp(email, senha, nome);

    setCarregando(false);

    if (!resultado.success) {
      setErro(resultado.message ?? "Não foi possível continuar.");
      return;
    }

    if (resultado.message) {
      setSucesso(resultado.message);
    }

    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <LogIn className="size-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              {modo === "login" ? "Entrar no BiblioSys" : "Criar conta"}
            </h1>
            <p className="text-sm text-muted-foreground">
              Acesso com e-mail e senha do Supabase
            </p>
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {modo === "cadastro" && (
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                type="text"
                value={nome}
                onChange={(event) => setNome(event.target.value)}
                placeholder="Seu nome"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="bibliotecario@escola.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="senha">Senha</Label>
            <Input
              id="senha"
              type="password"
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {erro && <p className="text-sm text-destructive">{erro}</p>}
          {sucesso && <p className="text-sm text-emerald-600">{sucesso}</p>}

          <Button type="submit" className="w-full" disabled={carregando}>
            {carregando
              ? "Carregando..."
              : modo === "login"
                ? "Entrar"
                : "Criar conta"}
          </Button>
        </form>

        <button
          type="button"
          onClick={() => {
            setModo((atual) => (atual === "login" ? "cadastro" : "login"));
            setErro("");
            setSucesso("");
            setNome("");
            setEmail("");
            setSenha("");
          }}
          className="mt-4 text-sm text-primary underline-offset-4 hover:underline"
        >
          {modo === "login" ? "Quero criar uma conta" : "Já tenho conta"}
        </button>
      </div>
    </div>
  );
};
