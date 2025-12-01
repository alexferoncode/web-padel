import Navbar from "../componentes/Navbar/Navbar.tsx";
import CalendarioReservas from "../componentes/CalendarioReservas/CalendarioReservas.tsx";
import ReservarPista from "../componentes/ReservarPista/ReservarPista.tsx";
import Footer from "../componentes/Footer/Footer.tsx";
import { useState } from "react";

export default function Pagina_Reservar() {
  const [date, setDate] = useState<Date>(new Date());

  return (
    <>
      <Navbar />
      <CalendarioReservas date={date} setDate={setDate} />
      <ReservarPista date={date} />
      <Footer />
    </>
  );
}
