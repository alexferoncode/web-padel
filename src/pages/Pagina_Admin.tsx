import Navbar from "../componentes/Navbar/Navbar.tsx";
import CalendarioReservas from "../componentes/CalendarioReservas/CalendarioReservas.tsx";
import ReservarPista from "../componentes/ReservarPista/ReservarPista.tsx";
import GuiaPistas from "../componentes/GuiaPistas/GuiaPistas.tsx";
import Footer from "../componentes/Footer/Footer.tsx";
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { useAuth } from "../context/AuthContext";

export default function Pagina_Admin() {
  const [searchParams] = useSearchParams();
  const [date, setDate] = useState<Date>(new Date());
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null); // null = aún no sabemos

  // --------------------- Manejo del parámetro date ---------------------
  useEffect(() => {
    const dateParam = searchParams.get("date");
    if (dateParam) {
      const [year, month, day] = dateParam.split("-").map(Number);
      const parsedDate = new Date(year, month - 1, day);
      setDate(parsedDate);
    }
  }, [searchParams]);

  // --------------------- Obtener perfil del usuario y controlar rol ---------------------
  useEffect(() => {
    const fetchProfile = async () => {
      if (loading) return; // Espera a que el AuthContext termine de cargar

      if (!user) {
        console.log("No hay usuario logueado");
        navigate("/"); // Redirige si no hay usuario
        return;
      }

      const { data, error } = await supabase
        .from("profile")
        .select("id, rol")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error al obtener perfil:", error);
        navigate("/"); // Redirige en caso de error
        return;
      }

      console.log("Perfil del usuario:", data);

      if (data.rol !== "admin") {
        console.log("Usuario no autorizado, redirigiendo...");
        navigate("/"); // Redirige si el rol no es admin
        return;
      }

      setIsAdmin(true); // El usuario es admin
    };

    fetchProfile();
  }, [user, loading, navigate]);

  // --------------------- Render condicional ---------------------
  if (loading || isAdmin === null) {
    // Mientras cargamos usuario o perfil
    return <div>Cargando...</div>;
  }

  // Solo se renderiza si isAdmin === true
  return (
    <>
      <Navbar />
      <CalendarioReservas date={date} setDate={setDate} />
      <ReservarPista date={date} />
      <GuiaPistas />
      <Footer />
    </>
  );
}
