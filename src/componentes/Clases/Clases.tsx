import "./clases.css";
import "../../index.css";

function Clases() {
  return (
    <>
      <section className="clases_section">
        <div className="clases_titulo">
          <h3 className="clases_h3">DESCUBRE NUESTRA ESCUELA DE PÁDEL</h3>
          <h2 className="clases_h2">DONDE EL JUEGO SE CONVIERTE EN MAGIA</h2>
        </div>
        <div className="clases_video_div">
          <video className="clases_video" controls>
            <source src="/public/videos/videomonitores.mp4" type="video/mp4" />
            Fallo de reproducción.
          </video>
        </div>
        <div className="clases_monitores">
          <div className="clases_monitor">
            <img
              className="clases_monitor_img"
              src="public/images/guille.png"
              alt=""
            />
            <p className="clases_monitor_p">Guille Acosta</p>
          </div>
          <div className="clases_monitor">
            <img
              className="clases_monitor_img"
              src="public/images/bodalo.png"
              alt=""
            />
            <p className="clases_monitor_p">David Bódalo</p>
          </div>
        </div>

        <section className="clases_precios">
          <h2 className="clases_precios_h2">TARIFAS</h2>
          <div className="clases_precios_div">
            <div className="clases_precios_div_div">
              <h3 className="clases_precios_h3">Mañanas</h3>
              <ul className="clases_precios_ul">
                <li className="clases_precios_li">
                  <img
                    className="clases_precios_img"
                    src="public/images/pala1_b.png"
                    alt=""
                  />
                  <p className="clases_precios_p">
                    Individuales: 80€ mes (20€/clase)
                  </p>
                </li>
                <li className="clases_precios_li">
                  <img
                    className="clases_precios_img"
                    src="public/images/pala2_b.png"
                    alt=""
                  />
                  <p className="clases_precios_p">
                    Grupo de 2: 64€ alumno/mes (16€/clase)
                  </p>
                </li>
                <li className="clases_precios_li">
                  <img
                    className="clases_precios_img"
                    src="public/images/pala3_b.png"
                    alt=""
                  />
                  <p className="clases_precios_p">
                    Grupo de 3: 48€ alumno/mes (12€/clase)
                  </p>
                </li>
                <li className="clases_precios_li">
                  <img
                    className="clases_precios_img"
                    src="public/images/pala4_b.png"
                    alt=""
                  />
                  <p className="clases_precios_p">
                    Grupo de 4: 40€ alumno/mes (10€/clase)
                  </p>
                </li>
              </ul>
            </div>
            <div className="clases_precios_div_div">
              <h3 className="clases_precios_h3">Tardes</h3>
              <ul className="clases_precios_ul">
                <li className="clases_precios_li">
                  <img
                    className="clases_precios_img"
                    src="public/images/pala1_b.png"
                    alt=""
                  />
                  <p className="clases_precios_p">
                    Individuales: 100€ mes (25€/clase)
                  </p>
                </li>
                <li className="clases_precios_li">
                  <img
                    className="clases_precios_img"
                    src="public/images/pala2_b.png"
                    alt=""
                  />
                  <p className="clases_precios_p">
                    Grupo de 2: 80 alumno/mes (20€/clase)
                  </p>
                </li>
                <li className="clases_precios_li">
                  <img
                    className="clases_precios_img"
                    src="public/images/pala3_b.png"
                    alt=""
                  />
                  <p className="clases_precios_p">
                    Grupo de 3: 64€ alumno/mes (16€/clase)
                  </p>
                </li>
                <li className="clases_precios_li">
                  <img
                    className="clases_precios_img"
                    src="public/images/pala4_b.png"
                    alt=""
                  />
                  <p className="clases_precios_p">
                    Grupo de 4: 48€ alumno/mes (12€/clase)
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </section>
    </>
  );
}

export default Clases;
