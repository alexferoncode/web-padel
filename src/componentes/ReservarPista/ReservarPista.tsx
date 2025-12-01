import "./reservarPista.css";
import "../../index.css";

type EstadoReserva = "libre" | "ocupada" | "clase" | "cerrado";

interface Reserva {
  pista: number;
  inicio: string; // HH:MM
  fin: string; // HH:MM
  estado: EstadoReserva;
}

function ReservarPista() {
  const pistas = [1, 2, 3, 4, 5, 6];
  const startHour = 8;
  const endHour = 23; // último bloque visible 23:00-23:30

  const horas: string[] = [];
  for (let h = startHour; h <= endHour; h++) {
    horas.push(`${h.toString().padStart(2, "0")}:00`);
    if (h < endHour) {
      horas.push(`${h.toString().padStart(2, "0")}:30`);
    }
  }

  // Bloques cerrados
  const bloquesCerrado = [
    { inicio: "08:00", fin: "09:00" },
    { inicio: "14:00", fin: "16:00" },
    { inicio: "23:00", fin: "23:30" },
  ];

  const generarCerrado = (
    pistas: number[],
    bloques: { inicio: string; fin: string }[]
  ): Reserva[] => {
    const reservas: Reserva[] = [];
    pistas.forEach((pista) => {
      bloques.forEach((b) => {
        reservas.push({
          pista,
          inicio: b.inicio,
          fin: b.fin,
          estado: "cerrado",
        });
      });
    });
    return reservas;
  };

  const reservasCerradas = generarCerrado(pistas, bloquesCerrado);

  // Ejemplos para rellenar huecos
  const reservasEjemplo: Reserva[] = [
    // Pista 1
    { pista: 1, inicio: "09:00", fin: "10:30", estado: "libre" },
    { pista: 1, inicio: "10:30", fin: "12:00", estado: "ocupada" },
    { pista: 1, inicio: "12:00", fin: "13:30", estado: "clase" },
    { pista: 1, inicio: "16:00", fin: "17:30", estado: "libre" },
    { pista: 1, inicio: "17:30", fin: "19:00", estado: "ocupada" },
    { pista: 1, inicio: "19:00", fin: "20:00", estado: "clase" },
    { pista: 1, inicio: "20:30", fin: "22:00", estado: "libre" },

    // Pista 2
    { pista: 2, inicio: "09:00", fin: "10:30", estado: "ocupada" },
    { pista: 2, inicio: "10:30", fin: "12:00", estado: "libre" },
    { pista: 2, inicio: "12:00", fin: "13:00", estado: "clase" },
    { pista: 2, inicio: "16:00", fin: "17:30", estado: "libre" },
    { pista: 2, inicio: "17:30", fin: "19:00", estado: "ocupada" },
    { pista: 2, inicio: "19:00", fin: "20:30", estado: "ocupada" },
    { pista: 2, inicio: "20:30", fin: "22:00", estado: "ocupada" },

    // Pista 3
    { pista: 3, inicio: "09:00", fin: "10:30", estado: "libre" },
    { pista: 3, inicio: "10:30", fin: "12:00", estado: "libre" },
    { pista: 3, inicio: "12:00", fin: "13:30", estado: "ocupada" },
    { pista: 3, inicio: "16:00", fin: "17:30", estado: "libre" },
    { pista: 3, inicio: "17:30", fin: "19:00", estado: "ocupada" },
    { pista: 3, inicio: "19:00", fin: "20:30", estado: "ocupada" },
    { pista: 3, inicio: "20:30", fin: "22:00", estado: "ocupada" },

    // Pista 4
    { pista: 4, inicio: "09:00", fin: "10:30", estado: "libre" },
    { pista: 4, inicio: "10:30", fin: "12:00", estado: "libre" },
    { pista: 4, inicio: "12:00", fin: "13:30", estado: "libre" },
    { pista: 4, inicio: "16:00", fin: "17:30", estado: "libre" },
    { pista: 4, inicio: "17:30", fin: "19:00", estado: "ocupada" },
    { pista: 4, inicio: "19:00", fin: "20:30", estado: "ocupada" },
    { pista: 4, inicio: "20:30", fin: "22:00", estado: "ocupada" },

    // Pista 5
    { pista: 5, inicio: "09:00", fin: "10:30", estado: "libre" },
    { pista: 5, inicio: "10:30", fin: "12:00", estado: "libre" },
    { pista: 5, inicio: "12:00", fin: "13:30", estado: "ocupada" },
    { pista: 5, inicio: "16:00", fin: "17:30", estado: "libre" },
    { pista: 5, inicio: "17:30", fin: "19:00", estado: "ocupada" },
    { pista: 5, inicio: "19:00", fin: "20:30", estado: "ocupada" },
    { pista: 5, inicio: "20:30", fin: "22:00", estado: "ocupada" },

    // Pista 6
    { pista: 6, inicio: "09:00", fin: "10:30", estado: "libre" },
    { pista: 6, inicio: "10:30", fin: "12:00", estado: "clase" },
    { pista: 6, inicio: "12:00", fin: "13:30", estado: "ocupada" },
    { pista: 6, inicio: "16:00", fin: "17:30", estado: "libre" },
    { pista: 6, inicio: "17:30", fin: "19:00", estado: "ocupada" },
    { pista: 6, inicio: "19:00", fin: "20:30", estado: "libre" },
    { pista: 6, inicio: "20:30", fin: "22:00", estado: "libre" },
  ];

  const reservasDelDia = [...reservasCerradas, ...reservasEjemplo];

  const calcularFila = (hora: string) => {
    const [h, m] = hora.split(":").map(Number);
    return (h - startHour) * 2 + (m === 30 ? 2 : 1);
  };

  const calcularFilasBloque = (inicio: string, fin: string) => {
    return calcularFila(fin) - calcularFila(inicio);
  };

  return (
    <section className="section_reservar_pista">
      <div className="div_calendario_pistas">
        <div className="div_calendario_header">
          <div className="div_hora_columna_header">Hora</div>
          {pistas.map((p) => (
            <div key={p} className="div_pista_columna_header">
              Pista {p}
            </div>
          ))}
        </div>

        <div className="div_calendario_body">
          {horas.map((h) => (
            <div
              key={h}
              className="div_hora_celda"
              style={{ gridColumn: 1, gridRow: calcularFila(h) }}
            >
              {h}
            </div>
          ))}

          {pistas.map((p, idx) =>
            horas.map((h) => {
              const bloque = reservasDelDia.find(
                (r) => r.pista === idx + 1 && r.inicio === h
              );

              if (bloque) {
                const filas = calcularFilasBloque(bloque.inicio, bloque.fin);
                return (
                  <div
                    key={`${p}-${h}`}
                    className={`div_reserva_bloque ${bloque.estado}`}
                    style={{
                      gridColumn: idx + 2,
                      gridRow: `${calcularFila(bloque.inicio)} / span ${filas}`,
                      fontSize: "0.9rem",
                    }}
                  >
                    {bloque.estado === "libre"
                      ? "Libre"
                      : bloque.estado === "ocupada"
                      ? "Ocupada"
                      : bloque.estado === "clase"
                      ? "Clase"
                      : "Cerrado"}
                  </div>
                );
              }

              return (
                <div
                  key={`${p}-${h}`}
                  className="div_celda_vacia"
                  style={{ gridColumn: idx + 2, gridRow: calcularFila(h) }}
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
