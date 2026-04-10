import "./navbar.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLocation } from "react-router-dom";

interface ReservaUsuario {
  id: number;
  pista_id: number;
  inicio: string;
  fin: string;
  estado: string;
}

function Navbar() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname.startsWith(path);
  const navigate = useNavigate();
  const {
    user: authUser,
    reservas,
    rol,
    signOut,
  } = useAuth() as {
    user: any;
    reservas: ReservaUsuario[];
    rol: string | null;
    signOut: () => Promise<void>;
  };

  const handleMenuClickAbrir = () => {
    const navbarVertical = document.querySelector(
      ".vertical_navbar",
    ) as HTMLElement;
    navbarVertical.style.display = "flex";
  };

  const handleMenuClickCerrar = () => {
    const navbarVertical = document.querySelector(
      ".vertical_navbar",
    ) as HTMLElement;
    navbarVertical.style.display = "none";
  };

  const handleReservasAbrir = () => {
    const el = document.querySelector(".lista_reservas_overlay") as HTMLElement;
    el.style.display = "flex";
  };

  const handleReservasCerrar = () => {
    const el = document.querySelector(".lista_reservas_overlay") as HTMLElement;
    el.style.display = "none";
  };

  const handleCerrarSesionAbrir = () => {
    const el = document.querySelector(".cerrar_sesion_aviso") as HTMLElement;
    el.style.display = "flex";
  };

  const handleCerrarSesionCerrar = () => {
    const el = document.querySelector(".cerrar_sesion_aviso") as HTMLElement;
    el.style.display = "none";
  };

  const handleLogout = async () => {
    await signOut(); // 👈 usa signOut del contexto en lugar de supabase directamente
    handleMenuClickCerrar();
    window.location.href = "/";
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
          {authUser && reservas.length > 0 && (
            <li className="horizontal_li">
              <span
                className="horizontal_href horizontal_href_mis_reservas"
                onClick={() => {
                  handleReservasAbrir();
                  handleMenuClickCerrar();
                }}
              >
                <span className="horizontal_href_mis_reservas_texto">
                  MIS RESERVAS ({reservas.length})
                </span>

                <img
                  src="/images/reloj2.png"
                  alt="Mis Reservas"
                  className="horizontal_href_mis_reservas_icono"
                />
              </span>
            </li>
          )}

          <li className="horizontal_li">
            {rol === "admin" ? (
              <span
                className="horizontal_href horizontal_href_reservar"
                onClick={() => navigate("/admin")}
              >
                ADMIN
              </span>
            ) : (
              <span
                className={`horizontal_href horizontal_href_reservar ${
                  isActive("/reservar") ? "active_nav_reservar" : ""
                }`}
                onClick={() => navigate("/reservar")}
              >
                RESERVAR
              </span>
            )}
          </li>

          <li className="horizontal_li hideOnMobile">
            <span
              className={`horizontal_href ${
                isActive("/tarifas") ? "active_nav" : ""
              }`}
              onClick={() => navigate("/tarifas")}
            >
              TARIFAS
            </span>
          </li>

          <li className="horizontal_li hideOnMobile">
            <span
              className={`horizontal_href ${
                isActive("/clases") ? "active_nav" : ""
              }`}
              onClick={() => navigate("/clases")}
            >
              CLASES
            </span>
          </li>

          {/* <li className="horizontal_li hideOnMobile">
            <span
              className={`horizontal_href ${
                isActive("/contacto") ? "active_nav" : ""
              }`}
              onClick={() => navigate("/contacto")}
            >
              CONTACTO
            </span>
          </li> */}

          <li className="horizontal_li hideOnMobile">
            {!authUser ? (
              <span
                className={`horizontal_href ${
                  isActive("/login") ? "active_nav" : ""
                }`}
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

          {/* {authUser && reservasUsuario.length > 0 && (
            <li className="vertical_li">
              <span
                className="vertical_href"
                onClick={() => {
                  handleReservasAbrir();
                  handleMenuClickCerrar();
                }}
              >
                MIS RESERVAS ({reservasUsuario.length})
              </span>
            </li>
          )} */}

          <li className="vertical_li">
            <span
              className={`vertical_href ${
                isActive("/tarifas") ? "active_nav" : ""
              }`}
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
              className={`vertical_href ${
                isActive("/clases") ? "active_nav" : ""
              }`}
              onClick={() => {
                navigate("/clases");
                handleMenuClickCerrar();
              }}
            >
              CLASES
            </span>
          </li>

          {/* <li className="vertical_li">
            <span
              className={`vertical_href ${
                isActive("/contacto") ? "active_nav" : ""
              }`}
              onClick={() => {
                navigate("/contacto");
                handleMenuClickCerrar();
              }}
            >
              CONTACTO
            </span>
          </li> */}

          <li className="vertical_li">
            {!authUser ? (
              <span
                className={`vertical_href ${
                  isActive("/login") ? "active_nav" : ""
                }`}
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

      <div className="cerrar_sesion_aviso" onClick={handleCerrarSesionCerrar}>
        <div
          className="cerrar_sesion_contenido"
          onClick={(e) => e.stopPropagation()}
        >
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
              Atrás
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
      </div>

      <div
        className="lista_reservas_overlay"
        onClick={handleReservasCerrar} // 🔹 cerrar si se hace clic en el fondo
      >
        <div
          className="lista_reservas_contenido"
          onClick={(e) => e.stopPropagation()} // 🔹 evitar cierre si se hace clic dentro
        >
          <h2 className="lista_reservas_h2">Mis reservas</h2>
          <ul className="lista_reservas_lista">
            {reservas.map((r) => {
              const fechaInicio = new Date(r.inicio);
              const fechaFin = new Date(r.fin);

              const diaSemana = fechaInicio.toLocaleDateString("es-ES", {
                weekday: "long",
              });

              return (
                <li key={r.id}>
                  <span className="lista_reservas_hide_mobile">
                    {diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1)}
                    {", "}
                  </span>
                  {fechaInicio.toLocaleDateString("es-ES")},{" "}
                  {fechaInicio.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  -{" "}
                  {fechaFin.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  <span className="lista_reservas_hide_mobile">
                    , Pista {r.pista_id}
                  </span>
                  <button
                    className="lista_reservas_boton"
                    id="lista_reservas_boton_cancelar"
                    onClick={() => {
                      const fechaISO = r.inicio;
                      const fecha = fechaISO.split("T")[0];
                      navigate(`/reservar?date=${fecha}`);
                      handleReservasCerrar();
                    }}
                  >
                    Ir a reservas
                  </button>
                </li>
              );
            })}
          </ul>

          <button
            className="lista_reservas_boton"
            onClick={handleReservasCerrar}
          >
            Atrás
          </button>
        </div>
      </div>
    </>
  );
}

export default Navbar;
