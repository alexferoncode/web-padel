import "./infoReservas.css";
import "../../index.css";

function InfoReservas() {
  return (
    <>
      <section className="section_reservas">
        <div className="cancelacion_reservas">
          <h2 className="h2_cancelacion_reservas">Reserva de pistas</h2>
          <p className="p_cancelacion_reservas">
            Para reservar una pista, debes reservarla completa (4 personas).
          </p>
          <p className="p_cancelacion_reservas">
            Puedes cancelar pista hasta 24 horas antes de la reserva.
          </p>
          <p className="p_cancelacion_reservas">
            Si necesitas cancelarla en las últimas 24 horas, contacta con
            nosotros vía telefónica.
          </p>
        </div>
      </section>
    </>
  );
}

export default InfoReservas;
