import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; message?: string }>;
  signUp: (
    email: string,
    password: string,
    fullName?: string,
  ) => Promise<{ success: boolean; message?: string }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const syncSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (mounted) {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    };

    syncSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true };
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName ?? email.split("@")[0],
        },
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      return { success: false, message: error.message };
    }

    return {
      success: true,
      message:
        "Conta criada com sucesso. Se a confirmação por e-mail estiver ativada, valide o acesso antes de entrar.",
    };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      signIn,
      signUp,
      signOut,
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }

  return context;
};
