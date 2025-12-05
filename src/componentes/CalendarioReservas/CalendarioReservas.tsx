import { Calendar } from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./calendarioReservas.css";
import "../../index.css";

interface Props {
  date: Date;
  setDate: (date: Date) => void;
}

function CalendarioReservas({ date, setDate }: Props) {
  const today = new Date();
  const maxDate = new Date();
  maxDate.setDate(today.getDate() + 14);

  return (
    <section className="reservas_section">
      <section className="reservas_info_section">
        <div className="reservas_div">
          <h2 className="reservas_h2">Reserva de pistas</h2>
          <p className="reservas_p">
            Para reservar una pista, debes cogerla completa (4 personas).
          </p>
          <p className="reservas_p">
            Sólo puedes cancelar una pista hasta 24 horas antes de la hora de
            inicio.
          </p>
        </div>
      </section>

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
      <div className="colores_leyenda_section">
        <div className="colores_leyenda_div">
          <span className="colores_leyenda_span disponible" /> Disponible
        </div>
        <div className="colores_leyenda_div">
          <span className="colores_leyenda_span propia" /> Ya la has reservado
        </div>
        <div className="colores_leyenda_div">
          <span className="colores_leyenda_span ocupada" /> No disponible
        </div>
      </div>
    </section>
  );
}

export default CalendarioReservas;
