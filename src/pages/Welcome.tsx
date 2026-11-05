import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { AppHeader } from "../components/AppHeader";
export function Welcome() {
  return (
    <div className="page-shell minimal-welcome">
      <AppHeader className="site-header">
        <Link className="header-account" to="/acceso">
          Iniciar sesión
        </Link>
      </AppHeader>
      <main>
        <h1>
          Tu tarjeta.
          <br />
          <span>Tu identidad.</span>
        </h1>
        <p>Comparte tu perfil profesional en un toque.</p>
        <Link className="primary-button" to="/panel">
          Abrir panel
          <ArrowRight size={17} />
        </Link>
        <div className="welcome-secondary">
          <Link to="/p/valentina-mora">Ver ejemplo</Link>
          <Link to="/editar">Crear tarjeta</Link>
        </div>
        <small>Demo · sin cuentas reales</small>
      </main>
    </div>
  );
}
