import "./secciones.css";
import { useNavigate } from "react-router-dom";

function Secciones() {
  const navigate = useNavigate();

  return (
    <>
      <div className="div_secciones">
        <div
          className="div_seccion grid1"
          onClick={() => navigate("/reservar")}
        >
          <div
            className="div_div_seccion"
            onClick={() => navigate("/reservar")}
          >
            <h2 className="h2_seccion">¿Buscas pista?</h2>
            <h2 className="h2_seccion">Reserva en 2 clicks</h2>
          </div>
        </div>
        <div className="div_seccion grid2" onClick={() => navigate("/tarifas")}>
          <div className="div_div_seccion">
            <h2 className="h2_seccion">Consulta nuestras tarifas</h2>
          </div>
        </div>
        <div className="div_seccion grid3" onClick={() => navigate("/clases")}>
          <div className="div_div_seccion">
            <h2 className="h2_seccion">¿Quieres dar clase?</h2>
            <h2 className="h2_seccion">Conoce a nuestros monitores</h2>
          </div>
        </div>
        <div
          className="div_seccion grid4"
          onClick={() => navigate("/contacto")}
        >
          <div className="div_div_seccion">
            <h2 className="h2_seccion">¿Alguna duda?</h2>
            <h2 className="h2_seccion">¡Contáctanos!</h2>
          </div>
        </div>
        <div className="div_seccion grid5" onClick={() => navigate("/login")}>
          <div className="div_div_seccion">
            <h2 className="h2_seccion">¿Aún no tienes cuenta?</h2>
            <h2 className="h2_seccion">¡Regístrate!</h2>
          </div>
        </div>
      </div>
    </>
  );
}

export default Secciones;
