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

  /* -------------------- Cargar pistas -------------------- */
  useEffect(() => {
    const cargarPistas = async () => {
      try {
        const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/pistas?select=id,nombre&order=id`;
        const res = await fetch(url, {
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
        });
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) setPistas(data);
      } catch (e: any) {
        console.error("Error cargando pistas:", e);
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
      try {
        const storageKey = Object.keys(localStorage).find(
          (k) => k.startsWith("sb-") && k.endsWith("-auth-token"),
        );

        if (!storageKey) {
          setUser(null);
          setRol(null);
          setLoading(false);
          return;
        }

        const raw = localStorage.getItem(storageKey);
        if (!raw) {
          setUser(null);
          setRol(null);
          setLoading(false);
          return;
        }

        const parsed = JSON.parse(raw);
        const currentUser = parsed?.user ?? null;
        const accessToken = parsed?.access_token ?? null;

        if (currentUser && accessToken) {
          const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profile?select=rol&id=eq.${currentUser.id}&limit=1`;
          const res = await fetch(url, {
            headers: {
              apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
              Authorization: `Bearer ${accessToken}`,
            },
          });
          const perfiles = await res.json();
          setRol(perfiles?.[0]?.rol ?? null);
          setUser(currentUser);
        } else {
          setUser(null);
          setRol(null);
        }
      } catch (e) {
        console.error("Error leyendo sesión:", e);
        setUser(null);
        setRol(null);
      } finally {
        setLoading(false);
      }
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
      value={{ user, loading, reservas, cargarReservas, rol, pistas }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext) as AuthContextType;
