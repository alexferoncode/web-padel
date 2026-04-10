import Navbar from "../componentes/Navbar/Navbar.tsx";
import AdminCalendario from "../componentes/AdminCalendario/AdminCalendario.tsx";
import AdminPistas from "../componentes/AdminPista/AdminPista.tsx";
import Footer from "../componentes/Footer/Footer.tsx";
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Pagina_Admin() {
  const [searchParams] = useSearchParams();
  const [date, setDate] = useState<Date>(new Date());
  const { user, loading, rol } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  // --------------------- Manejo del parámetro date ---------------------
  useEffect(() => {
    const dateParam = searchParams.get("date");
    if (dateParam) {
      const [year, month, day] = dateParam.split("-").map(Number);
      const parsedDate = new Date(year, month - 1, day);
      setDate(parsedDate);
    }
  }, [searchParams]);

  // --------------------- Controlar rol ---------------------
  useEffect(() => {
    if (loading) return;

    if (!user) {
      // Dar margen extra por si la sesión llega tarde
      const timer = setTimeout(() => {
        navigate("/");
      }, 2000);
      return () => clearTimeout(timer);
    }

    if (rol === null) return;

    if (rol !== "admin") {
      navigate("/");
      return;
    }

    setIsAdmin(true);
  }, [user, loading, rol, navigate]);

  // --------------------- Render condicional ---------------------
  if (loading || isAdmin === null) {
    return <div>Cargando...</div>;
  }

  return (
    <>
      <Navbar />
      <AdminCalendario date={date} setDate={setDate} />
      <AdminPistas date={date} />
      <Footer />
    </>
  );
}
