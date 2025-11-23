import "./footer.css";

function Footer() {
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
            <h2>Conoce el club</h2>
            <ul className="ul_footer">
              <li>Tarifas</li>
              <li>Clases</li>
              <li>Contacto</li>
            </ul>
          </div>
          <div className="div_div_footer">
            <h2>Contacta</h2>
            <ul className="ul_footer">
              <li>Calle B, 22, Polígono Industrial Campollano, Albacete</li>
              <li>WhatsApp: 649 28 07 34</li>
              <li>
                <img
                  className="instagram_footer"
                  src="images/instagram.png"
                  alt=""
                />
              </li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}

export default Footer;
