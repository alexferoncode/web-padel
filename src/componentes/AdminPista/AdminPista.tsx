import "../ReservarPista/reservarPista.css";
import "./adminPista.css";
import "../../index.css";
import { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";

type EstadoReserva =
  | "libre"
  | "ocupada"
  | "clase"
  | "cerrado"
  | "propia"
  | "torneo"
  | "fija"
  | "evento";

interface ReservaDB {
  id: number;
  pista_id: number;
  estado: EstadoReserva;
  inicio: string;
  fin: string;
  user_id?: string | null;
}

interface PistaDB {
  id: number;
  nombre: string;
}

interface BloqueReserva {
  id?: number;
  pista: number;
  estado: EstadoReserva;
  inicio: string;
  fin: string;
  user_id?: string | null;
}

function ReservarPista({ date }: { date: Date }) {
  const startHour = 8;
  const endHour = 23;

  const [reservasSupabase, setReservasSupabase] = useState<ReservaDB[]>([]);
  const [pistasDB, setPistasDB] = useState<PistaDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Overlay
  const [showOverlay, setShowOverlay] = useState(false);
  const [bloqueSeleccionado, setBloqueSeleccionado] =
    useState<BloqueReserva | null>(null);
  const [reservaSeleccionadaId, setReservaSeleccionadaId] = useState<
    number | null
  >(null);
  const [cancelOverlay, setCancelOverlay] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [perfiles, setPerfiles] = useState<
    {
      id: string;
      first_name: string;
      last_name: string;
      email: string;
      tlf: string;
    }[]
  >([]);

  /* ----------------------------------------------------
      0) CARGAR PISTAS
  -----------------------------------------------------*/
  useEffect(() => {
    const cargarPistas = async () => {
      const { data, error } = await supabase
        .from("pistas")
        .select("id, nombre")
        .order("id");
      if (error) {
        console.error("Error cargando pistas:", error);
        return;
      }
      setPistasDB(data || []);
    };
    cargarPistas();
  }, []);

  /* ----------------------------------------------------
      0.5) OBTENER USUARIO LOGUEADO
  -----------------------------------------------------*/
  //   useEffect(() => {
  //     const obtenerUsuario = async () => {
  //       const {
  //         data: { user },
  //       } = await supabase.auth.getUser();
  //       setUserId(user?.id || null);
  //     };
  //     obtenerUsuario();
  //   }, []);

  /* ----------------------------------------------------
      1) GENERAR HORAS
  -----------------------------------------------------*/
  const horas: string[] = [];
  for (let h = startHour; h <= endHour; h++) {
    horas.push(`${h.toString().padStart(2, "0")}:00`);
    if (h < endHour) horas.push(`${h.toString().padStart(2, "0")}:30`);
  }

  /* ----------------------------------------------------
      2) CARGAR RESERVAS
  -----------------------------------------------------*/
  useEffect(() => {
    if (pistasDB.length === 0) return;

    const cargarReservas = async () => {
      setLoading(true);
      const año = date.getFullYear();
      const mes = (date.getMonth() + 1).toString().padStart(2, "0");
      const dia = date.getDate().toString().padStart(2, "0");
      const fechaStr = `${año}-${mes}-${dia}`;

      const { data, error } = await supabase
        .from("reservas")
        .select("*")
        .gte("inicio", `${fechaStr}T00:00:00`)
        .lt("inicio", `${fechaStr}T23:59:59`)
        .order("inicio", { ascending: true });

      if (error) {
        console.error("Error cargando reservas:", error);
        setLoading(false);
        return;
      }

      setReservasSupabase(data || []);
      setLoading(false);
    };

    cargarReservas();
  }, [date, pistasDB]);

  const pistas = pistasDB.map((p) => p.id);

  /* ----------------------------------------------------
      3) CARGAR PERFILES
  -----------------------------------------------------*/
  useEffect(() => {
    const cargarPerfiles = async () => {
      const { data, error } = await supabase
        .from("profile")
        .select("id, first_name, last_name, email, tlf");
      if (error) {
        console.error("Error cargando perfiles:", error);
        return;
      }
      setPerfiles(data || []);
    };
    cargarPerfiles();
  }, []);

  /* ----------------------------------------------------
      3) FUNCIONES DE POSICIÓN
  -----------------------------------------------------*/
  const calcularFila = (hora: string) => {
    const [h, m] = hora.split(":").map(Number);
    return (h - startHour) * 2 + (m === 30 ? 2 : 1);
  };

  const calcularFilasBloque = (inicio: string, fin: string) => {
    return calcularFila(fin) - calcularFila(inicio);
  };

  /* ----------------------------------------------------
      4) TRANSFORMAR RESERVAS
  -----------------------------------------------------*/
  const reservasDelDia: BloqueReserva[] = reservasSupabase.map((r) => {
    const inicioDate = new Date(r.inicio);
    const finDate = new Date(r.fin);
    return {
      id: r.id,
      pista: r.pista_id,
      estado: r.estado,
      inicio: inicioDate.toTimeString().slice(0, 5),
      fin: finDate.toTimeString().slice(0, 5),
      user_id: r.user_id || null,
    };
  });

  /* ----------------------------------------------------
      4.5) BLOQUES CERRADOS
  -----------------------------------------------------*/
  const horariosCerrados = [
    { inicio: "08:00", fin: "09:00" },
    { inicio: "14:00", fin: "16:00" },
    { inicio: "23:00", fin: "23:30" },
  ];

  const bloquesCerrados: BloqueReserva[] = [];

  pistas.forEach((pista) => {
    horariosCerrados.forEach((horario) => {
      const yaExiste = reservasDelDia.some(
        (r) =>
          r.pista === pista &&
          r.inicio <= horario.inicio &&
          r.fin >= horario.fin
      );
      if (!yaExiste) {
        bloquesCerrados.push({
          pista,
          inicio: horario.inicio,
          fin: horario.fin,
          estado: "cerrado",
        });
      }
    });
  });

  const todasLasReservas = [...reservasDelDia, ...bloquesCerrados];

  /* ----------------------------------------------------
      5) CELDAS OCUPADAS
  -----------------------------------------------------*/
  const estaCeldaOcupada = (pista: number, hora: string): boolean => {
    const [h, m] = hora.split(":").map(Number);
    const minuto = h * 60 + m;
    return todasLasReservas.some((r) => {
      if (r.pista !== pista) return false;
      const [ih, im] = r.inicio.split(":").map(Number);
      const [fh, fm] = r.fin.split(":").map(Number);
      const inicioMin = ih * 60 + im;
      const finMin = fh * 60 + fm;
      return minuto >= inicioMin && minuto < finMin;
    });
  };

  /* ----------------------------------------------------
      6) LOGICA CLICK
  -----------------------------------------------------*/
  const handleClickLibre = async (bloque: BloqueReserva) => {
    setBloqueSeleccionado(bloque);
    setReservaSeleccionadaId(bloque.id || null);
    setShowOverlay(true);
    setCancelOverlay(false);
    setErrorMsg("");
    setSuccessMsg("");

    console.log("Bloque seleccionado (libre):", bloque);
    console.log("Usuario del bloque:", bloque.user_id);
    if (bloque.user_id) {
      // Buscar primero en perfiles ya cargados
      let perfil = perfiles.find((p) => p.id === bloque.user_id);

      if (!perfil) {
        // Si no existe, pedirlo a Supabase
        try {
          const { data, error } = await supabase
            .from("profile")
            .select("id, first_name, last_name, email, tlf")
            .eq("id", bloque.user_id)
            .single();

          if (error) {
            console.error("No se pudo cargar el perfil del usuario:", error);
          } else {
            perfil = data;
            console.log("Perfil cargado al vuelo:", perfil);
          }
        } catch (err) {
          console.error("Error inesperado al cargar perfil:", err);
        }
      } else {
        console.log("Perfil encontrado en memoria:", perfil);
      }
    }
  };

  const handleClickOcupada = async (bloque: BloqueReserva) => {
    setBloqueSeleccionado(bloque);
    setReservaSeleccionadaId(bloque.id || null);
    setShowOverlay(true);
    setCancelOverlay(true);
    setErrorMsg("");
    setSuccessMsg("");

    console.log("Bloque seleccionado (ocupada):", bloque);
    console.log("Usuario del bloque:", bloque.user_id);

    if (bloque.user_id) {
      // Buscar primero en perfiles ya cargados
      let perfil = perfiles.find((p) => p.id === bloque.user_id);

      if (!perfil) {
        // Si no existe, pedirlo a Supabase
        try {
          const { data, error } = await supabase
            .from("profile")
            .select("id, first_name, last_name, email, tlf")
            .eq("id", bloque.user_id)
            .single();

          if (error) {
            console.error("No se pudo cargar el perfil del usuario:", error);
          } else {
            perfil = data;
            console.log("Perfil cargado al vuelo:", perfil);
          }
        } catch (err) {
          console.error("Error inesperado al cargar perfil:", err);
        }
      } else {
        console.log("Perfil encontrado en memoria:", perfil);
      }
    }
  };

  /* ----------------------------------------------------
      6.5) CONFIRMAR RESERVA (CONCURRENCIA-SAFE)
  -----------------------------------------------------*/
  const handleConfirmarReserva = async () => {
    if (!reservaSeleccionadaId) {
      setErrorMsg("No se pudo identificar la reserva.");
      return;
    }

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        // si no hay usuario, llevar a la página de login
        return;
      }

      const { data, error } = await supabase
        .from("reservas")
        .update({ estado: "ocupada", user_id: user.id })
        .eq("id", reservaSeleccionadaId)
        .eq("estado", "libre")
        .select("*");

      if (error) {
        console.error("Error al reservar:", error);

        // Detectar tipo de trigger
        if (
          error.message.includes(
            "No se puede modificar una reserva con inicio en el pasado"
          )
        ) {
          setErrorMsg("No se puede reservar una pista ya iniciada.");
        } else if (
          error.message.includes(
            "El usuario ya tiene una reserva que solapa con este horario"
          )
        ) {
          setErrorMsg(
            "El usuario ya tiene una reserva que solapa con este horario."
          );
        } else if (
          error.message.includes(
            "Ya existe otra reserva en esta pista que se solapa en el horario"
          )
        ) {
          setErrorMsg("Ya existe otra reserva en esta pista en ese horario.");
        } else {
          setErrorMsg("Error al confirmar la reserva. Inténtalo de nuevo.");
        }
        return;
      }

      if (!data || data.length === 0) {
        setErrorMsg(
          "Otro usuario ha reservado esta pista. Recarga la página para ver la información actualizada."
        );
        return;
      }

      setSuccessMsg("¡Pista reservada!");
      setTimeout(() => {
        setShowOverlay(false);
        setSuccessMsg("");
        const cargarReservas = async () => {
          const año = date.getFullYear();
          const mes = (date.getMonth() + 1).toString().padStart(2, "0");
          const dia = date.getDate().toString().padStart(2, "0");
          const fechaStr = `${año}-${mes}-${dia}`;

          const { data, error } = await supabase
            .from("reservas")
            .select("*")
            .gte("inicio", `${fechaStr}T00:00:00`)
            .lt("inicio", `${fechaStr}T23:59:59`)
            .order("inicio", { ascending: true });

          if (!error) setReservasSupabase(data || []);
        };
        cargarReservas();
      }, 1500);
    } catch (error) {
      console.error("Error inesperado:", error);
      setErrorMsg("Error inesperado al reservar.");
    }
  };

  /* ----------------------------------------------------
      6.6) CANCELAR RESERVA
  -----------------------------------------------------*/
  const handleCancelarReserva = async () => {
    if (!reservaSeleccionadaId) {
      setErrorMsg("No se pudo identificar la reserva.");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("reservas")
        .update({ estado: "libre", user_id: null })
        .eq("id", reservaSeleccionadaId)
        .select("*");

      if (error) {
        console.error("Error al cancelar:", error);

        // if
        // (
        //   error.message.includes(
        //     "No se puede cancelar la reserva con menos de 24 horas de antelación"
        //   )
        // ) {
        //   setErrorMsg(
        //     "No se puede cancelar una reserva con menos de 24 horas de antelación."
        //   );
        // } else
        {
          setErrorMsg("Error al cancelar la reserva. Inténtalo de nuevo.");
        }

        return;
      }

      setSuccessMsg("¡Reserva cancelada!");
      setTimeout(() => {
        setShowOverlay(false);
        setSuccessMsg("");
        const cargarReservas = async () => {
          const año = date.getFullYear();
          const mes = (date.getMonth() + 1).toString().padStart(2, "0");
          const dia = date.getDate().toString().padStart(2, "0");
          const fechaStr = `${año}-${mes}-${dia}`;

          const { data, error } = await supabase
            .from("reservas")
            .select("*")
            .gte("inicio", `${fechaStr}T00:00:00`)
            .lt("inicio", `${fechaStr}T23:59:59`)
            .order("inicio", { ascending: true });

          if (!error) setReservasSupabase(data || []);
        };
        cargarReservas();
      }, 1500);
    } catch (error) {
      console.error("Error inesperado:", error);
      setErrorMsg("Error inesperado al cancelar la reserva.");
    }
  };

  /* ----------------------------------------------------
      7) RENDER
  -----------------------------------------------------*/
  if (pistasDB.length === 0) {
    return <div className="cargando">Cargando pistas...</div>;
  }

  return (
    <>
      {/* OVERLAY */}
      <div
        onClick={() => setShowOverlay(false)}
        className={`reserva_overlay ${showOverlay ? "show" : ""}`}
      >
        <div
          className="reservas_contenido"
          onClick={(e) => e.stopPropagation()} // 🔹 evitar cierre si se hace clic dentro
        >
          {bloqueSeleccionado ? (
            <div className="div_confirmar_reserva">
              {cancelOverlay && <h2>¿Quieres cancelar esta pista?</h2>}
              {bloqueSeleccionado.user_id && (
                <div>
                  <h2>
                    {
                      perfiles.find((p) => p.id === bloqueSeleccionado.user_id)
                        ?.first_name
                    }{" "}
                    {
                      perfiles.find((p) => p.id === bloqueSeleccionado.user_id)
                        ?.last_name
                    }
                  </h2>
                  <h2>
                    {
                      perfiles.find((p) => p.id === bloqueSeleccionado.user_id)
                        ?.email
                    }
                  </h2>
                  <h2>
                    tlf:{" "}
                    {
                      perfiles.find((p) => p.id === bloqueSeleccionado.user_id)
                        ?.tlf
                    }
                  </h2>
                </div>
              )}
              <h2>
                {date
                  .toLocaleDateString("es-ES", {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                  .replace(/^./, (c) => c.toUpperCase())}
              </h2>
              <h2>
                {bloqueSeleccionado.inicio} - {bloqueSeleccionado.fin}
              </h2>
              <h2>Pista {bloqueSeleccionado.pista}</h2>
            </div>
          ) : (
            <p>Error al cargar el bloque</p>
          )}
          {errorMsg && <p className="reserva_error grande">{errorMsg}</p>}
          {successMsg && <p className="reserva_success grande">{successMsg}</p>}

          <div className="div_confirmar_reserva_botones">
            <button
              className="reserva_boton"
              id="reserva_boton_cerrar"
              onClick={() => setShowOverlay(false)}
            >
              Atrás
            </button>
            {cancelOverlay ? (
              <button className="reserva_boton" onClick={handleCancelarReserva}>
                Cancelar pista
              </button>
            ) : (
              <button
                className="reserva_boton"
                onClick={handleConfirmarReserva}
              >
                Confirmar reserva
              </button>
            )}
          </div>
        </div>
      </div>

      {/* CALENDARIO */}
      <section className="admin_section_reservar_pista">
        <div className="admin_div_calendario_pistas">
          {/* HEADER */}
          <div className="div_calendario_header">
            <div className="div_hora_columna_header">HORA</div>
            {pistasDB.map((p) => (
              <div key={p.id} className="div_pista_columna_header">
                <span className="nombre_pc">{p.nombre.replace(/_/g, " ")}</span>
                <span className="nombre_movil">{`P${p.id}`}</span>
              </div>
            ))}
          </div>

          {/* BODY */}
          <div className="admin_div_calendario_body">
            {/* HORAS */}
            {horas.map((h) => (
              <div key={h} className="div_hora_celda" data-hora={h}>
                {h}
              </div>
            ))}

            {/* BLOQUES RESERVADOS */}
            {pistas.map((p, idx) =>
              todasLasReservas
                .filter((r) => r.pista === p)
                .map((bloque, i) => {
                  const filas = calcularFilasBloque(bloque.inicio, bloque.fin);
                  const esLibre = bloque.estado === "libre";
                  const esOcupada = bloque.estado === "ocupada";
                  const esClase = bloque.estado === "clase";
                  const esTorneo = bloque.estado === "torneo";
                  const esFija = bloque.estado === "fija";
                  const esEvento = bloque.estado === "evento";

                  let claseBloque = bloque.estado;

                  return (
                    <div
                      key={`${p}-${bloque.inicio}-${i}`}
                      className={`admin_div_reserva_bloque ${claseBloque}`}
                      data-libres={esLibre ? "true" : "false"}
                      onClick={() => {
                        if (esLibre) handleClickLibre(bloque);
                        else if (esOcupada) handleClickOcupada(bloque);
                      }}
                      style={{
                        gridColumn: idx + 2,
                        gridRow: `${calcularFila(
                          bloque.inicio
                        )} / span ${filas}`,
                      }}
                    >
                      {(esLibre || esOcupada || esClase) && (
                        <>
                          {/* versión escritorio */}
                          <span className="texto_reserva texto_reserva_pc">{`${bloque.inicio} - ${bloque.fin}`}</span>

                          {/* versión móvil */}
                          <span className="texto_reserva texto_reserva_movil">
                            {bloque.inicio}
                          </span>
                        </>
                      )}
                    </div>
                  );
                })
            )}

            {/* CELDAS VACÍAS */}
            {pistas.map((p, idx) =>
              horas.map((h) => {
                if (estaCeldaOcupada(p, h)) return null;
                return (
                  <div
                    key={`${p}-${h}-vacia`}
                    className="div_celda_vacia"
                    style={{ gridColumn: idx + 2, gridRow: calcularFila(h) }}
                  />
                );
              })
            )}
          </div>
        </div>
      </section>
    </>
  );
}

export default ReservarPista;
