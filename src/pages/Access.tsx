import { useState, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Brand } from "../components/Brand";
import type { AuthGateway } from "../domain/workspace";
export function Access({
  auth = null,
  mode = "login",
}: {
  auth?: AuthGateway | null;
  mode?: "login" | "register" | "reset" | "password";
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      if (!auth) {
        await new Promise((resolve) => setTimeout(resolve, 700));
        setMessage(
          "Vista previa completada. No se creó ninguna cuenta, no se enviaron correos y no guardamos tus credenciales.",
        );
        setPassword("");
        return;
      }
      if (mode === "login") await auth.signIn(email, password);
      if (mode === "register") await auth.signUp(email, password);
      if (mode === "reset") await auth.requestPasswordReset(email);
      if (mode === "password") await auth.updatePassword(password);
      setMessage(
        "Solicitud completada. Revisa tu cuenta o tu correo para continuar.",
      );
    } catch {
      setError(
        "No pudimos completar la solicitud. Revisa tus datos e intenta de nuevo.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function google() {
    setError("");
    if (!auth) {
      setMessage(
        "Este botón está preparado para conectar Google. En esta demostración no se inicia sesión.",
      );
      return;
    }
    try {
      await auth.signInWithGoogle();
    } catch {
      setError("No pudimos conectar con Google. Intenta de nuevo.");
    }
  }
  const title = {
    login: "Iniciar sesión",
    register: "Crear cuenta",
    reset: "Recupera tu acceso.",
    password: "Elige una nueva contraseña.",
  }[mode];
  return (
    <div className="access-shell">
      <header>
        <Brand />
        <Link className="back-link" to="/">
          <ArrowLeft size={14} />
          Volver
        </Link>
      </header>
      <main className="access-card reveal">
        <h1>{title}</h1>
        {!auth && (
          <span className="interface-demo-note">
            Demo · no crea cuentas reales
          </span>
        )}
        {(mode === "login" || mode === "register") && (
          <>
            <button className="google-button" disabled={busy} onClick={google}>
              <span aria-hidden="true">G</span>Continuar con Google
            </button>
            <div className="auth-divider">
              <span />o con tu correo
              <span />
            </div>
          </>
        )}
        <form onSubmit={submit}>
          <fieldset disabled={busy} className="auth-fields">
            {mode !== "password" && (
              <div className="field">
                <label htmlFor="account-email">Correo electrónico</label>
                <input
                  id="account-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Tu correo electrónico"
                />
              </div>
            )}
            {mode !== "reset" && (
              <div className="field">
                <label htmlFor="account-password">
                  {mode === "password" ? "Nueva contraseña" : "Contraseña"}
                </label>
                <div className="password-field">
                  <input
                    id="account-password"
                    type={visible ? "text" : "password"}
                    minLength={mode === "login" ? 1 : 12}
                    maxLength={128}
                    autoComplete={
                      mode === "login" ? "current-password" : "new-password"
                    }
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={
                      mode === "login"
                        ? "Tu contraseña"
                        : "Al menos 12 caracteres"
                    }
                  />
                  <button
                    type="button"
                    className="icon-button"
                    onClick={() => setVisible(!visible)}
                    aria-label={
                      visible ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                  >
                    {visible ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>
            )}
            <button className="primary-button" type="submit">
              {busy ? (
                <>
                  <LoaderCircle className="spin" size={17} />
                  Un momento…
                </>
              ) : (
                <>
                  {
                    {
                      login: "Iniciar sesión",
                      register: "Crear cuenta",
                      reset: "Enviar enlace",
                      password: "Guardar contraseña",
                    }[mode]
                  }
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </fieldset>
        </form>
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        {message && (
          <div role="status" className="success-message">
            <CheckCircle2 size={21} />
            <span>{message}</span>
          </div>
        )}
        {mode === "login" && (
          <div className="access-links">
            <Link to="/recuperar-acceso">Olvidé mi contraseña</Link>
            <span>
              ¿Primera vez? <Link to="/registro">Crear cuenta</Link>
            </span>
          </div>
        )}
        {mode === "register" && (
          <p className="access-bottom">
            ¿Ya tienes cuenta? <Link to="/acceso">Inicia sesión</Link>
          </p>
        )}
        {(mode === "reset" || mode === "password") && (
          <Link className="back-link" to="/acceso">
            Volver al acceso
          </Link>
        )}
        {!auth && (
          <Link className="explore-panel-link" to="/panel">
            Explorar el panel de ejemplo
            <ArrowRight size={15} />
          </Link>
        )}
      </main>
    </div>
  );
}
