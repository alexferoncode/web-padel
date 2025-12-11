import { Calendar } from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../CalendarioReservas/calendarioReservas.css";
import "./adminCalendario.css";
import "../../index.css";

interface Props {
  date: Date;
  setDate: (date: Date) => void;
}

function AdminCalendario({ date, setDate }: Props) {
  const today = new Date();
  const maxDate = new Date();
  maxDate.setDate(today.getDate() + 90);

  return (
    <section className="admin_reservas_section">
      <section className="calendar_section">
        <div className="calendar_div">
          <Calendar
            className="calendar"
            locale="es-ES"
            onChange={(value) => setDate(value as Date)}
            value={date}
            minDate={today}
            maxDate={maxDate}
            calendarType="iso8601"
            prevLabel="‹"
            nextLabel="›"
            prev2Label={null}
            next2Label={null}
          />
        </div>
      </section>
      <section className="admin_colores_leyenda_section">
        <div className="admin_colores_leyenda_div">
          <span className="admin_colores_leyenda_span admin_cerrado" /> Cerrado
        </div>
        <div className="admin_colores_leyenda_div">
          <span className="admin_colores_leyenda_span admin_disponible" />{" "}
          Disponible
        </div>

        <div className="admin_colores_leyenda_div">
          <span className="admin_colores_leyenda_span admin_ocupada" /> Ocupada
        </div>
        <div className="admin_colores_leyenda_div">
          <span className="admin_colores_leyenda_span admin_clase" /> Clase
        </div>
        <div className="admin_colores_leyenda_div">
          <span className="admin_colores_leyenda_span admin_torneo" /> Torneo
        </div>
        <div className="admin_colores_leyenda_div">
          <span className="admin_colores_leyenda_span admin_evento" /> Evento
        </div>
      </section>
    </section>
  );
}

export default AdminCalendario;
