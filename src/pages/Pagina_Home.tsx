import Navbar from "../components/Navbar/Navbar.tsx";
import HeroSection from "../components/HeroSection/HeroSection.tsx";
import Secciones from "../components/Secciones/Secciones.tsx";
import DondeEstamos from "../components/DondeEstamos/DondeEstamos.tsx";
import Footer from "../components/Footer/Footer.tsx";

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
