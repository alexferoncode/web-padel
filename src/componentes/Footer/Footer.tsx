import "./footer.css";
import { useNavigate } from "react-router-dom";

function Footer() {
  const navigate = useNavigate();
  return (
    <>
      <section className="section_footer">
        <div className="div_footer">
          <div className="div_div_footer div_div_footer_1">
            <img
              className="logo_footer"
              src="images/logo.png"
              alt="Logo del club"
            />
            <p>
              Pro Pádel 360 llegó a Albacete en 2024 para elevar la calidad del
              juego. Disfruta de las mejores pistas de la ciudad y vive una
              experiencia pádel como nunca antes.
            </p>
          </div>
          <div className="div_div_footer">
            <h2 className="h2_footer">Conoce el club</h2>
            <ul className="ul_footer">
              <li className="li_footer" onClick={() => navigate("/tarifas")}>
                Tarifas
              </li>
              <li className="li_footer" onClick={() => navigate("/clases")}>
                Clases
              </li>
            </ul>
          </div>
          <div className="div_div_footer">
            <h2 className="h2_footer">Contacto</h2>
            <ul className="ul_footer">
              <li>Calle B, 22, Polígono Industrial Campollano, Albacete</li>
              <li>WhatsApp: 649 28 07 34</li>
              <li>
                <a
                  href="https://www.instagram.com/propadel360/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    className="instagram_footer"
                    src="images/instagram.png"
                    alt="Instagram Pro Pádel 360"
                  />
                </a>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}

export default Footer;
