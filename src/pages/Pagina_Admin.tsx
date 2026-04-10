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
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const addLog = (msg: string) => setDebugLogs((prev) => [...prev, msg]);

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
    console.log(
      "🔵 Admin effect - loading:",
      loading,
      "user:",
      user?.id ?? "null",
      "rol:",
      rol,
    );

    if (loading) return;
    if (!user) {
      console.log("🔴 No user, redirigiendo...");
      navigate("/");
      return;
    }
    if (rol === null) {
      console.log("🟡 User existe pero rol es null, esperando...");
      return;
    }
    if (rol !== "admin") {
      console.log("🔴 Rol no es admin:", rol);
      navigate("/");
      return;
    }
    console.log("✅ Es admin, mostrando panel");
    setIsAdmin(true);
  }, [user, loading, rol, navigate]);

  // --------------------- Render condicional ---------------------
  if (loading || isAdmin === null) {
    return <div>Cargando...</div>;
  }

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 9999,
          background: "rgba(0,0,0,0.8)",
          color: "lime",
          fontSize: "11px",
          padding: "8px",
          maxWidth: "100vw",
        }}
      >
        {debugLogs.map((log, i) => (
          <div key={i}>{log}</div>
        ))}
      </div>

      <Navbar />
      <AdminCalendario date={date} setDate={setDate} />
      <AdminPistas date={date} />
      <Footer />
    </>
  );
}
