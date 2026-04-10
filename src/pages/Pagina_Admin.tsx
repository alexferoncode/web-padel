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

  const addLog = (msg: string) => {
    console.log(msg);
    setDebugLogs((prev) => [
      ...prev,
      new Date().toLocaleTimeString() + " " + msg,
    ]);
  };

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
    addLog(`loading:${loading} user:${user?.id ?? "null"} rol:${rol}`);

    if (loading) return;
    if (!user) {
      addLog("NO USER → redirigiendo");
      navigate("/");
      return;
    }
    if (rol === null) {
      addLog("user OK pero rol null, esperando...");
      return;
    }
    if (rol !== "admin") {
      addLog("rol no es admin: " + rol);
      navigate("/");
      return;
    }
    addLog("ES ADMIN ✅");
    setIsAdmin(true);
  }, [user, loading, rol, navigate]);

  // --------------------- Render siempre muestra debug ---------------------
  return (
    <>
      {/* DEBUG - quitar después */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 9999,
          background: "rgba(0,0,0,0.85)",
          color: "lime",
          fontSize: "11px",
          padding: "8px",
          maxWidth: "100vw",
          maxHeight: "40vh",
          overflowY: "auto",
        }}
      >
        {debugLogs.map((log, i) => (
          <div key={i}>{log}</div>
        ))}
      </div>

      {loading || isAdmin === null ? (
        <div style={{ paddingTop: 60 }}>Cargando...</div>
      ) : (
        <>
          <Navbar />
          <AdminCalendario date={date} setDate={setDate} />
          <AdminPistas date={date} />
          <Footer />
        </>
      )}
    </>
  );
}
