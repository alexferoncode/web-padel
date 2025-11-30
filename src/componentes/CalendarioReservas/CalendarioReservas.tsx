import React, { useState } from "react";
import { Calendar } from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./CalendarioReservas.css"; // CSS personalizado

function CalendarioReservas() {
  const [date, setDate] = useState<Date>(new Date());

  const today = new Date();
  const maxDate = new Date();
  maxDate.setDate(today.getDate() + 14);

  // Wrapper seguro para TypeScript
  const handleChange = (value: Date | Date[] | null) => {
    if (value instanceof Date) {
      setDate(value);
    }
  };

  return (
    <div className="calendar-container">
      <Calendar
        className="custom-calendar"
        locale="es-ES" // idioma español
        onChange={(value) => setDate(value as Date)}
        value={date}
        minDate={today}
        maxDate={maxDate}
        calendarType="iso8601"
        prevLabel="‹" // solo una flecha izquierda
        nextLabel="›" // solo una flecha derecha
      />
    </div>
  );
}

export default CalendarioReservas;
