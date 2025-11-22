import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// import App from './App.tsx'
import Navbar from "./components/Navbar/Navbar.tsx";
import HeroSection from "./components/HeroSection/HeroSection.tsx";
import Secciones from "./components/Secciones/Secciones.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Navbar />
    <HeroSection />
    <Secciones />
  </StrictMode>
);
