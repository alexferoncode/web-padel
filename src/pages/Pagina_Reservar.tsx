import Navbar from "../componentes/Navbar/Navbar.tsx";
import InfoReservas from "../componentes/InfoReservas/InfoReservas.tsx";
import CalendarioReservas from "../componentes/CalendarioReservas/CalendarioReservas.tsx";
import ReservarPista from "../componentes/ReservarPista/ReservarPista.tsx";
import Footer from "../componentes/Footer/Footer.tsx";

export default function Pagina_Tarifas() {
  return (
    <>
      <Navbar />
      <InfoReservas />
      <CalendarioReservas />
      <ReservarPista />
      <Footer />
    </>
  );
}
