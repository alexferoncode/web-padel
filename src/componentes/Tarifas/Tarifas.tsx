import "./tarifas.css";
import "../../index.css";

function Tarifas() {
  return (
    <>
      <section className="section_tarifas">
        <div className="div_h1_tarifas">
          <h1 className="h1_tarifas h1_tarifas_horario">HORARIO</h1>
          <h1 className="h1_tarifas">De lunes a sábado de 09:00 a 23:00</h1>
          <h1 className="h1_tarifas">Domingos de 09:00 a 14:00</h1>
        </div>

        <div className="div_tarifas">
          <div className="div_div_tarifas">
            <h2 className="h2_tarifas">LUNES A VIERNES</h2>
            <div className="div_div_div_tarifas">
              <h3 className="h3_tarifas">Mañanas (9:00h a 16:00h)</h3>
              <h3 className="h3_tarifas">16€ (4€ por persona)</h3>
            </div>
            <div className="div_div_div_tarifas">
              <h3 className="h3_tarifas">Tardes (16:00h a 23:00h)</h3>
              <h3 className="h3_tarifas">22€ (5,5€ por persona)</h3>
            </div>
          </div>
          <div className="div_div_tarifas">
            <h2 className="h2_tarifas">SÁBADOS Y DOMINGOS</h2>
            <div className="div_div_div_tarifas">
              <h3 className="h3_tarifas">Mañanas (9:00h a 16:00h)</h3>
              <h3 className="h3_tarifas">20€ (5€ por persona)</h3>
            </div>
            <div className="div_div_div_tarifas">
              <h3 className="h3_tarifas">Tardes (16:00h a 23:00h)</h3>
              <h3 className="h3_tarifas">18€ (4,5€ por persona)</h3>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Tarifas;
