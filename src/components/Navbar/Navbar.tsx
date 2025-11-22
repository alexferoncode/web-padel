import "./navbar.css";

function Navbar() {
  const handleMenuClickAbrir = () => {
    const navbarVertical = document.querySelector(
      ".vertical_navbar"
    ) as HTMLElement;
    navbarVertical.style.display = "flex";
  };

  const handleMenuClickCerrar = () => {
    const navbarVertical = document.querySelector(
      ".vertical_navbar"
    ) as HTMLElement;
    navbarVertical.style.display = "none";
  };

  return (
    <>
      {/* Navbar horizonal */}
      <nav className="horizontal_navbar">
        {/* Logo del club */}

        <img
          className="horizontal_imagen_logo_club"
          src="images/logo.png"
          alt="Logo del club"
        />

        {/* Enlaces de navegación */}
        <ul className="horizontal_ul">
          <li className="horizontal_li">
            <a className="horizontal_href horizontal_href_reservar" href="#">
              RESERVAR
            </a>
          </li>
          <li className="horizontal_li hideOnMobile">
            <a className="horizontal_href" href="#">
              TARIFAS
            </a>
          </li>
          <li className="horizontal_li hideOnMobile">
            <a className="horizontal_href" href="#">
              CLASES
            </a>
          </li>
          <li className="horizontal_li hideOnMobile">
            <a className="horizontal_href" href="#">
              CONTACTO
            </a>
          </li>
          <li className="horizontal_li hideOnMobile">
            <a className="horizontal_href" href="#">
              LOGIN / REGISTRO
            </a>
          </li>

          {/* Icono de menú hamburguesa */}
          <li
            onClick={handleMenuClickAbrir}
            className="horizontal_li horizontal_icono_abrir_menu"
          >
            <a className="horizontal_href" href="#">
              <svg
                // className="horizontal_icono_abrir_menu"
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="#e3e3e3"
              >
                <path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z" />
              </svg>
            </a>
          </li>
        </ul>
      </nav>

      {/* Navbar vertical */}
      <nav className="vertical_navbar">
        {/* Enlaces de navegación */}
        <ul className="vertical_ul">
          {/* Icono de menú cerrar */}
          <li onClick={handleMenuClickCerrar} className="vretical_li">
            <a className="vertical_href" href="#">
              <svg
                className="vertical_icono_cerrar_menu"
                xmlns="http://www.w3.org/2000/svg"
                height="28px"
                viewBox="0 -960 960 960"
                width="28px"
                fill="#e3e3e3"
              >
                <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
              </svg>
            </a>
          </li>
          {/* <li className="vertical_li">
            <a className="vertical_href vertical_href_reservar" href="#">
              RESERVAR
            </a>
          </li> */}
          <li className="vertical_li">
            <a className="vertical_href" href="#">
              TARIFAS
            </a>
          </li>
          <li className="vertical_li">
            <a className="vertical_href" href="#">
              CLASES
            </a>
          </li>
          <li className="vertical_li">
            <a className="vertical_href" href="#">
              CONTACTO
            </a>
          </li>
          <li className="vertical_li">
            <a className="vertical_href" href="#">
              LOGIN / REGISTRO
            </a>
          </li>
        </ul>
      </nav>
    </>
  );
}

export default Navbar;
