import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { supabase } from "../../supabaseClient";
import { useLocation } from "react-router-dom";

interface ReservaUsuario {
  id: number;
  pista_id: number;
  inicio: string;
  fin: string;
  estado: string;
}

const AuthContext = createContext<any>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reservas, setReservas] = useState<ReservaUsuario[]>([]);
  const [rol, setRol] = useState<string | null>(null);
  const location = useLocation();

  /* -------------------- Cargar reservas -------------------- */
  const cargarReservas = async (userId: string | null) => {
    if (!userId) {
      setReservas([]);
      return;
    }
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("reservas")
      .select("*")
      .eq("user_id", userId)
      .gt("inicio", now)
      .in("estado", ["ocupada", "fija"])
      .order("inicio", { ascending: true });
    if (error) {
      console.error("Error cargando reservas:", error);
      return;
    }
    setReservas(data || []);
  };

  /* -------------------- Autenticación -------------------- */
  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      const currentUser = data.session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        const { data: perfil } = await supabase
          .from("profile")
          .select("rol")
          .eq("id", currentUser.id)
          .single();
        setRol(perfil?.rol ?? null);
      } else {
        setRol(null);
      }

      setLoading(false);
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          const { data: perfil } = await supabase
            .from("profile")
            .select("rol")
            .eq("id", currentUser.id)
            .single();
          setRol(perfil?.rol ?? null);
        } else {
          setRol(null);
        }
      },
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // Cargar reservas cuando cambia la página o el usuario
  useEffect(() => {
    if (!user) {
      setReservas([]);
      return;
    }

    cargarReservas(user.id);
  }, [user, location.pathname]);

  return (
    <AuthContext.Provider
      value={{ user, loading, reservas, cargarReservas, rol }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
