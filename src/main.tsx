import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Pagina_Home from "./pages/Pagina_Home";
import Pagina_Reservar from "./pages/Pagina_Reservar";
import Pagina_Tarifas from "./pages/Pagina_Tarifas";
// import Pagina_Clases from "./pages/Pagina_Clases";
// import Pagina_Contacto from "./pages/Pagina_Contacto";
import Pagina_Login from "./pages/Pagina_Login";
import ScrollToTop from "./componentes/Utilidades/ScrollToTop";

import { AuthProvider } from "./context/AuthContext"; // <--- IMPORTAR EL CONTEXT

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      {" "}
      {/* <--- Envolvemos toda la app */}
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Pagina_Home />} />
          <Route path="/reservar" element={<Pagina_Reservar />} />
          <Route path="/tarifas" element={<Pagina_Tarifas />} />
          {/* <Route path="/clases" element={<Pagina_Clases />} />
          <Route path="/contacto" element={<Pagina_Contacto />} /> */}
          <Route path="/login" element={<Pagina_Login />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);
