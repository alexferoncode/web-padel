import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { supabase, supabasePublic } from "../../supabaseClient";
import { useLocation } from "react-router-dom";

interface ReservaUsuario {
  id: number;
  pista_id: number;
  inicio: string;
  fin: string;
  estado: string;
}

interface PistaDB {
  id: number;
  nombre: string;
}

interface AuthContextType {
  user: any;
  loading: boolean;
  reservas: ReservaUsuario[];
  cargarReservas: (userId: string | null) => Promise<void>;
  rol: string | null;
  pistas: PistaDB[];
  pistasStatus: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reservas, setReservas] = useState<ReservaUsuario[]>([]);
  const [rol, setRol] = useState<string | null>(null);
  const [pistas, setPistas] = useState<PistaDB[]>([]);
  const location = useLocation();

  const [pistasStatus, setPistasStatus] = useState<string>("iniciando");

  // AuthContext.tsx - cargarPistas con fetch directo
  useEffect(() => {
    const cargarPistas = async () => {
      setPistasStatus("cargando con fetch...");

      try {
        const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/pistas?select=id,nombre&order=id`;

        const res = await fetch(url, {
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
        });

        const data = await res.json();
        setPistasStatus(
          `fetch resultado: ${JSON.stringify(data).slice(0, 100)}`,
        );

        if (Array.isArray(data) && data.length > 0) {
          setPistas(data);
        }
      } catch (e: any) {
        setPistasStatus(`fetch error: ${e.message}`);
      }
    };

    cargarPistas();
  }, []);

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

      setUser(currentUser);
      setLoading(false);
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user ?? null;

        const mismoUsuario = await new Promise<boolean>((resolve) => {
          setUser((prev: any) => {
            if (prev?.id === currentUser?.id) {
              resolve(true);
              return prev;
            }
            resolve(false);
            return currentUser;
          });
        });

        if (mismoUsuario) return;

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

  /* -------------------- Cargar reservas al cambiar usuario/página -------------------- */
  useEffect(() => {
    if (!user) {
      setReservas([]);
      return;
    }
    cargarReservas(user.id);
  }, [user, location.pathname]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        reservas,
        cargarReservas,
        rol,
        pistas,
        pistasStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext) as AuthContextType;
