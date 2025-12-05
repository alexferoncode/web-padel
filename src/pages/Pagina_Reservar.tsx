import Navbar from "../componentes/Navbar/Navbar.tsx";
import CalendarioReservas from "../componentes/CalendarioReservas/CalendarioReservas.tsx";
import ReservarPista from "../componentes/ReservarPista/ReservarPista.tsx";
import Footer from "../componentes/Footer/Footer.tsx";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

export default function Pagina_Reservar() {
  const [searchParams] = useSearchParams();

  const [date, setDate] = useState<Date>(new Date());

  useEffect(() => {
    const dateParam = searchParams.get("date"); // ⬅️ leer ?date=YYYY-MM-DD

    if (dateParam) {
      // Convertir YYYY-MM-DD → Date
      const parsed = new Date(dateParam + "T00:00:00");
      setDate(parsed);
    }
  }, [searchParams]);

  return (
    <>
      <Navbar />
      <CalendarioReservas date={date} setDate={setDate} />
      <ReservarPista date={date} />
      <Footer />
    </>
  );
}
