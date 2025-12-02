import "./navbar.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../../supabaseClient";

function Navbar() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();

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

  const handleCerrarSesionAbrir = () => {
    const navbarVertical = document.querySelector(
      ".cerrar_sesion_aviso"
    ) as HTMLElement;
    navbarVertical.style.display = "flex";
  };

  const handleCerrarSesionCerrar = () => {
    const navbarVertical = document.querySelector(
      ".cerrar_sesion_aviso"
    ) as HTMLElement;
    navbarVertical.style.display = "none";
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    handleMenuClickCerrar();
    navigate("/"); // opcional: redirige a home
  };

  return (
    <>
      {/* Navbar horizontal */}
      <nav className="horizontal_navbar">
        {/* Logo */}
        <img
          className="horizontal_imagen_logo_club"
          src="images/logo.png"
          alt="Logo del club"
          onClick={() => navigate("/")}
        />

        {/* Enlaces horizontales */}
        <ul className="horizontal_ul">
          <li className="horizontal_li">
            <span
              className="horizontal_href horizontal_href_reservar"
              onClick={() => navigate("/reservar")}
            >
              RESERVAR
            </span>
          </li>

          <li className="horizontal_li hideOnMobile">
            <span
              className="horizontal_href"
              onClick={() => navigate("/tarifas")}
            >
              TARIFAS
            </span>
          </li>

          <li className="horizontal_li hideOnMobile">
            <span
              className="horizontal_href"
              onClick={() => navigate("/clases")}
            >
              CLASES
            </span>
          </li>

          <li className="horizontal_li hideOnMobile">
            <span
              className="horizontal_href"
              onClick={() => navigate("/contacto")}
            >
              CONTACTO
            </span>
          </li>

          <li className="horizontal_li hideOnMobile">
            {!authUser ? (
              <span
                className="horizontal_href"
                onClick={() => navigate("/login")}
              >
                LOGIN / REGISTRO
              </span>
            ) : (
              <span
                className="horizontal_href"
                onClick={() => {
                  handleCerrarSesionAbrir();
                  handleMenuClickCerrar();
                }}
              >
                CERRAR SESIÓN
              </span>
            )}
          </li>

          {/* Menú hamburguesa */}
          <li
            onClick={handleMenuClickAbrir}
            className="horizontal_li horizontal_icono_abrir_menu"
          >
            <span className="horizontal_href">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="#e3e3e3"
              >
                <path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z" />
              </svg>
            </span>
          </li>
        </ul>
      </nav>

      {/* Navbar vertical */}
      <nav className="vertical_navbar">
        <ul className="vertical_ul">
          {/* Cerrar menú */}
          <li onClick={handleMenuClickCerrar} className="vertical_li">
            <span className="vertical_href">
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
            </span>
          </li>

          <li className="vertical_li">
            <span
              className="vertical_href"
              onClick={() => {
                navigate("/tarifas");
                handleMenuClickCerrar();
              }}
            >
              TARIFAS
            </span>
          </li>

          <li className="vertical_li">
            <span
              className="vertical_href"
              onClick={() => {
                navigate("/clases");
                handleMenuClickCerrar();
              }}
            >
              CLASES
            </span>
          </li>

          <li className="vertical_li">
            <span
              className="vertical_href"
              onClick={() => {
                navigate("/contacto");
                handleMenuClickCerrar();
              }}
            >
              CONTACTO
            </span>
          </li>

          <li className="vertical_li">
            {!authUser ? (
              <span
                className="vertical_href"
                onClick={() => {
                  navigate("/login");
                  handleMenuClickCerrar();
                }}
              >
                LOGIN / REGISTRO
              </span>
            ) : (
              <span
                className="vertical_href"
                onClick={() => {
                  handleCerrarSesionAbrir();
                  handleMenuClickCerrar();
                }}
              >
                CERRAR SESIÓN
              </span>
            )}
          </li>
        </ul>
      </nav>

      <div className="cerrar_sesion_aviso">
        {/* Mostrar el email del usuario logueado */}
        {authUser && authUser.email && (
          <h3 className="cerrar_sesion_h3">
            Has iniciado sesión con la cuenta {authUser.email}
          </h3>
        )}

        <h2 className="cerrar_sesion_h2">¿Quieres cerrar sesión?</h2>
        <div className="cerrar_sesion_div_botones">
          <button
            className="cerrar_sesion_boton"
            id="cerrar_sesion_boton_cancelar"
            onClick={handleCerrarSesionCerrar}
          >
            Cancelar
          </button>
          <button
            className="cerrar_sesion_boton cerrar_sesion_boton_cerrar"
            onClick={() => {
              handleLogout();
              handleCerrarSesionCerrar();
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </>
  );
}

export default Navbar;
