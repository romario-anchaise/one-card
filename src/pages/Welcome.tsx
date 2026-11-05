import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CreditCard,
  Fingerprint,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Brand } from "../components/Brand";
export function Welcome() {
  return (
    <div className="page-shell welcome-page">
      <header className="site-header">
        <Brand />
        <Link className="header-account" to="/acceso">
          Iniciar sesión
          <ArrowUpRight size={15} />
        </Link>
      </header>
      <main className="welcome-layout">
        <section className="welcome-copy">
          <span className="eyebrow intro-eyebrow">
            <span className="gold-line" />
            TU PRÓXIMA CONEXIÓN EMPIEZA CONTIGO
          </span>
          <h1>
            Tu identidad.
            <br />
            Tu historia.
            <br />
            <span>Tu ONE CARD.</span>
          </h1>
          <p>
            Una presentación que habla de ti.
            <br />
            Crea tu tarjeta profesional, a tu manera.
          </p>
          <Link className="primary-button welcome-primary" to="/panel">
            Explorar mi espacio
            <ArrowRight size={18} />
          </Link>
          <span className="welcome-note">
            Demo navegable con datos de ejemplo. Descubre cada detalle.
          </span>
          <div className="welcome-secondary">
            <Link to="/p/valentina-mora">
              Ver tarjeta de ejemplo
              <ArrowUpRight size={15} />
            </Link>
            <Link to="/editar">
              Crear desde cero
              <ArrowRight size={15} />
            </Link>
          </div>
          <div className="welcome-points">
            <span>
              <Check size={15} />
              Tus datos, desde cero
            </span>
            <span>
              <Check size={15} />
              Diseño adaptable
            </span>
            <span>
              <Check size={15} />
              Contacto en un toque
            </span>
          </div>
        </section>
        <section
          className="blank-card-scene"
          aria-label="Crea una tarjeta con tus propios datos"
        >
          <div className="blank-card">
            <div className="blank-card-top">
              <CreditCard size={27} />
              <Fingerprint size={29} />
            </div>
            <div className="blank-monogram">
              <span>+</span>
            </div>
            <h2>Este espacio es tuyo.</h2>
            <p>
              Tu nombre, tu marca
              <br />y tu próxima gran conexión.
            </p>
            <div className="blank-card-bottom">
              <span>ONE CARD</span>
              <ArrowUpRight size={24} />
            </div>
          </div>
          <div className="scene-label">
            <span />
            Una tarjeta que empieza contigo.
          </div>
        </section>
      </main>
      <footer className="welcome-footer">
        <span>© {new Date().getFullYear()} R&A Solutions</span>
        <span>
          <ShieldCheck size={14} />
          Experiencia de interfaz · Backend por conectar.
        </span>
      </footer>
    </div>
  );
}
