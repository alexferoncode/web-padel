import Navbar from "../componentes/Navbar/Navbar.tsx";
import CalendarioReservas from "../componentes/CalendarioReservas/CalendarioReservas.tsx";
import ReservarPista from "../componentes/ReservarPista/ReservarPista.tsx";
import GuiaPistas from "../componentes/GuiaPistas/GuiaPistas.tsx";
import Footer from "../componentes/Footer/Footer.tsx";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

export default function Pagina_Reservar() {
  const [searchParams] = useSearchParams();

  const [date, setDate] = useState<Date>(new Date());

  useEffect(() => {
    const dateParam = searchParams.get("date");

    if (dateParam) {
      const [year, month, day] = dateParam.split("-").map(Number);

      // Crear fecha en horario local (sin problema de UTC)
      const parsedDate = new Date(year, month - 1, day);

      setDate(parsedDate);
    }
  }, [searchParams]);

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
