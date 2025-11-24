import "./dondeEstamos.css";

function DondeEstamos() {
  return (
    <>
      <div className="div_donde_estamos">
        <h2 className="h2_donde_estamos">¿Dónde estamos?</h2>
        <h3 className="h3_donde_estamos">
          Calle B, 22, Polígono Industrial Campollano, Albacete
        </h3>
        <iframe
          className="iframe_donde_estamos"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3099.848030029035!2d-1.8826646229811075!3d39.018780039531215!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd665ff55fc47b05%3A0x421312634fd703a0!2sPropadel360!5e0!3m2!1ses!2ses!4v1763896387110!5m2!1ses!2ses"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </>
  );
}

export default DondeEstamos;
