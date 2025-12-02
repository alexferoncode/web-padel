import "./reservarPista.css";
import "../../index.css";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

type EstadoReserva = "libre" | "ocupada" | "clase" | "cerrado";

interface ReservaDB {
  id: number;
  pista_id: number;
  estado: EstadoReserva;
  inicio: string;
  fin: string;
}

interface PistaDB {
  id: number;
  nombre: string;
}

interface BloqueReserva {
  pista: number;
  estado: EstadoReserva;
  inicio: string;
  fin: string;
}

function ReservarPista({ date }: { date: Date }) {
  const startHour = 8;
  const endHour = 23;

  const [reservasSupabase, setReservasSupabase] = useState<ReservaDB[]>([]);
  const [pistasDB, setPistasDB] = useState<PistaDB[]>([]);
  const [loading, setLoading] = useState(true);

  // Overlay
  const [showOverlay, setShowOverlay] = useState(false);
  const [bloqueSeleccionado, setBloqueSeleccionado] =
    useState<BloqueReserva | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

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
      pista: r.pista_id,
      estado: r.estado,
      inicio: inicioDate.toTimeString().slice(0, 5),
      fin: finDate.toTimeString().slice(0, 5),
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
      6) LOGICA CLICK EN BLOQUES LIBRES
  -----------------------------------------------------*/
  const handleClickLibre = (bloque: BloqueReserva) => {
    try {
      setBloqueSeleccionado(bloque);
      setShowOverlay(true);
    } catch (e) {
      console.error(e);
      setErrorMsg("No se pudo abrir el menú de reserva.");
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
      <div className={`reserva_overlay ${showOverlay ? "show" : ""}`}>
        {/* <h2>Reserva seleccionada</h2> */}
        {bloqueSeleccionado ? (
          <div className="div_confirmar_reserva">
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
        {errorMsg && <p className="reserva_error">{errorMsg}</p>}
        <div className="div_confirmar_reserva_botones">
          <button
            className="reserva_boton"
            id="reserva_boton_cerrar"
            onClick={() => setShowOverlay(false)}
          >
            Cancelar
          </button>
          <button
            className="reserva_boton"
            onClick={() => setShowOverlay(false)}
          >
            Confirmar reserva
          </button>
        </div>
      </div>

      {/* CALENDARIO */}
      <section className="section_reservar_pista">
        <div className="div_calendario_pistas">
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
          <div className="div_calendario_body">
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

                  return (
                    <div
                      key={`${p}-${bloque.inicio}-${i}`}
                      className={`div_reserva_bloque ${bloque.estado}`}
                      data-libres={esLibre ? "true" : "false"}
                      onClick={() => esLibre && handleClickLibre(bloque)}
                      style={{
                        gridColumn: idx + 2,
                        gridRow: `${calcularFila(
                          bloque.inicio
                        )} / span ${filas}`,
                      }}
                    >
                      {esLibre && (
                        <span>{`${bloque.inicio} - ${bloque.fin}`}</span>
                      )}
                    </div>
                  );
                })
            )}

            {/* CELDAS VACÍAS (NO CLICABLES) */}
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
