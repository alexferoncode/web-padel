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
            Para reservar una pista, debes reservarla completa (4 personas).
          </p>
          <p className="reservas_p">
            Puedes reservar cualquier pista que veas en color verde pulsando en
            ella.
          </p>
          <p className="reservas_p">
            Puedes cancelar la pista hasta 24 horas antes de la reserva.
          </p>
        </div>
      </section>

      <section className="pistas_section">
        <img
          className="pistas_img"
          src="/images/pistas_dibujo_nombres.png"
          alt="Pistas"
        />
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
    </section>
  );
}

export default CalendarioReservas;
