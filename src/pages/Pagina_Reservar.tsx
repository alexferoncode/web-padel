import Navbar from "../componentes/Navbar/Navbar.tsx";
import InfoReservas from "../componentes/InfoReservas/InfoReservas.tsx";
import CalendarioReservas from "../componentes/CalendarioReservas/CalendarioReservas.tsx";
import Footer from "../componentes/Footer/Footer.tsx";

export default function Pagina_Tarifas() {
  return (
    <>
      <Navbar />
      <InfoReservas />
      <CalendarioReservas />
      <Footer />
    </>
  );
}
