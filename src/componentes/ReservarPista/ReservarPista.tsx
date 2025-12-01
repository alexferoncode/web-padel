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

interface BloqueReserva {
  pista: number;
  estado: EstadoReserva;
  inicio: string;
  fin: string;
}

function ReservarPista({ date }: { date: Date }) {
  const pistas = [1, 2, 3, 4, 5, 6];
  const startHour = 8;
  const endHour = 23;

  const [reservasSupabase, setReservasSupabase] = useState<ReservaDB[]>([]);
  const [loading, setLoading] = useState(true);

  /* -------------------------------------------
      1) CALCULAR HORAS DEL CALENDARIO
  --------------------------------------------*/
  const horas: string[] = [];
  for (let h = startHour; h <= endHour; h++) {
    horas.push(`${h.toString().padStart(2, "0")}:00`);
    if (h < endHour) horas.push(`${h.toString().padStart(2, "0")}:30`);
  }

  /* -------------------------------------------
      2) CARGAR RESERVAS DEL DÍA DESDE SUPABASE
  --------------------------------------------*/
  useEffect(() => {
    const cargarReservas = async () => {
      setLoading(true);

      // Formatear la fecha como YYYY-MM-DD
      const año = date.getFullYear();
      const mes = (date.getMonth() + 1).toString().padStart(2, "0");
      const dia = date.getDate().toString().padStart(2, "0");
      const fechaStr = `${año}-${mes}-${dia}`;

      console.log("Consultando reservas para fecha:", fechaStr);

      // Usar la función de PostgreSQL para filtrar por fecha
      const { data, error } = await supabase
        .from("reservas")
        .select("*")
        .filter("inicio", "gte", `${fechaStr}T00:00:00`)
        .filter(
          "inicio",
          "lt",
          `${año}-${mes}-${(parseInt(dia) + 1)
            .toString()
            .padStart(2, "0")}T00:00:00`
        )
        .order("inicio", { ascending: true });

      if (error) {
        console.error("Error cargando reservas:", error);
        setLoading(false);
        return;
      }

      console.log(`Reservas encontradas: ${data?.length || 0}`, data);
      setReservasSupabase(data || []);
      setLoading(false);
    };

    cargarReservas();
  }, [date]);

  /* -------------------------------------------
      3) FUNCIONES DE POSICIÓN EN LA GRID
  --------------------------------------------*/
  const calcularFila = (hora: string) => {
    const [h, m] = hora.split(":").map(Number);
    return (h - startHour) * 2 + (m === 30 ? 2 : 1);
  };

  const calcularFilasBloque = (inicio: string, fin: string) => {
    return calcularFila(fin) - calcularFila(inicio);
  };

  /* -------------------------------------------
      4) TRANSFORMAR RESERVAS SUPABASE A BLOQUES
  --------------------------------------------*/
  const reservasDelDia: BloqueReserva[] = reservasSupabase.map((r) => {
    const inicioDate = new Date(r.inicio);
    const finDate = new Date(r.fin);

    const inicioStr =
      inicioDate.getHours().toString().padStart(2, "0") +
      ":" +
      inicioDate.getMinutes().toString().padStart(2, "0");

    const finStr =
      finDate.getHours().toString().padStart(2, "0") +
      ":" +
      finDate.getMinutes().toString().padStart(2, "0");

    return {
      pista: r.pista_id,
      estado: r.estado,
      inicio: inicioStr,
      fin: finStr,
    };
  });

  /* -------------------------------------------
      4.5) GENERAR BLOQUES "CERRADO" DINÁMICAMENTE
      Horarios cerrados: 00:00-09:00, 14:00-16:00, 23:00-00:00
  --------------------------------------------*/
  const horariosCerrados: Array<{ inicio: string; fin: string }> = [
    { inicio: "08:00", fin: "09:00" }, // Antes de abrir
    { inicio: "14:00", fin: "16:00" }, // Pausa mediodía
    { inicio: "23:00", fin: "23:30" }, // Cierre (última media hora visible)
  ];

  const bloquesCerrados: BloqueReserva[] = [];

  pistas.forEach((pista) => {
    horariosCerrados.forEach((horario) => {
      // Verificar si ya existe una reserva en este horario para esta pista
      const yaExisteReserva = reservasDelDia.some(
        (r) =>
          r.pista === pista &&
          r.inicio <= horario.inicio &&
          r.fin >= horario.fin
      );

      // Si no existe reserva, añadir bloque cerrado
      if (!yaExisteReserva) {
        bloquesCerrados.push({
          pista: pista,
          estado: "cerrado",
          inicio: horario.inicio,
          fin: horario.fin,
        });
      }
    });
  });

  // Combinar reservas de DB con bloques cerrados
  const todasLasReservas = [...reservasDelDia, ...bloquesCerrados];

  /* -------------------------------------------
      5) VERIFICAR SI UNA CELDA ESTÁ OCUPADA
  --------------------------------------------*/
  const estaCeldaOcupada = (pista: number, hora: string): boolean => {
    const [h, m] = hora.split(":").map(Number);
    const horaMinutos = h * 60 + m;

    return todasLasReservas.some((r) => {
      if (r.pista !== pista) return false;

      const [ih, im] = r.inicio.split(":").map(Number);
      const [fh, fm] = r.fin.split(":").map(Number);

      const inicioMinutos = ih * 60 + im;
      const finMinutos = fh * 60 + fm;

      return horaMinutos >= inicioMinutos && horaMinutos < finMinutos;
    });
  };

  /* -------------------------------------------
      6) RENDERIZADO
  --------------------------------------------*/
  return (
    <section className="section_reservar_pista">
      <div className="div_calendario_pistas">
        {/* HEADER */}
        <div className="div_calendario_header">
          <div className="div_hora_columna_header">HORA</div>
          {pistas.map((p) => (
            <div key={p} className="div_pista_columna_header">
              <span className="nombre_pc">{`PISTA ${p}`}</span>
              <span className="nombre_movil">{`P${p}`}</span>
            </div>
          ))}
        </div>

        {/* BODY */}
        <div className="div_calendario_body">
          {loading && (
            <div
              style={{
                gridColumn: "1 / -1",
                gridRow: "1 / -1",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "rgba(255,255,255,0.8)",
              }}
            >
              Cargando reservas...
            </div>
          )}

          {/* HORAS */}
          {horas.map((h) => (
            <div
              key={h}
              className="div_hora_celda"
              style={{ gridColumn: 1, gridRow: calcularFila(h) }}
            >
              {h}
            </div>
          ))}

          {/* BLOQUES DE RESERVAS */}
          {pistas.map((p, idx) =>
            todasLasReservas
              .filter((r) => r.pista === p)
              .map((bloque, bloqueIdx) => {
                const filas = calcularFilasBloque(bloque.inicio, bloque.fin);
                return (
                  <div
                    key={`${p}-${bloque.inicio}-${bloqueIdx}`}
                    className={`div_reserva_bloque ${bloque.estado}`}
                    style={{
                      gridColumn: idx + 2,
                      gridRow: `${calcularFila(bloque.inicio)} / span ${filas}`,
                    }}
                  />
                );
              })
          )}

          {/* CELDAS VACÍAS (solo donde NO hay reservas) */}
          {pistas.map((p, idx) =>
            horas.map((h) => {
              if (estaCeldaOcupada(p, h)) return null;

              return (
                <div
                  key={`${p}-${h}-vacia`}
                  className="div_celda_vacia"
                  style={{
                    gridColumn: idx + 2,
                    gridRow: calcularFila(h),
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    console.log(`Celda vacía clickeada: Pista ${p}, Hora ${h}`);
                    // Aquí puedes añadir la lógica para crear una reserva
                  }}
                />
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}

export default ReservarPista;
