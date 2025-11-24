import Navbar from "../componentes/Navbar/Navbar.tsx";
import HeroSection from "../componentes/HeroSection/HeroSection.tsx";
import Secciones from "../componentes/Secciones/Secciones.tsx";
import DondeEstamos from "../componentes/DondeEstamos/DondeEstamos.tsx";
import Footer from "../componentes/Footer/Footer.tsx";

export default function Pagina_Home() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <Secciones />
      <DondeEstamos />
      <Footer />
    </>
  );
}
