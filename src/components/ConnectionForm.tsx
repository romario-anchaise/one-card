import { useState, type FormEvent } from "react";
import { ArrowUpRight, CheckCircle2, LockKeyhole } from "lucide-react";
import type { ConnectionGateway, ConnectionRequest } from "../domain/profile";
import { connect, validateConnection } from "../application/profile-services";
export function ConnectionForm({
  gateway,
  profileId,
  recipientName,
  demo = false,
}: {
  gateway: ConnectionGateway;
  profileId: string;
  recipientName: string;
  demo?: boolean;
}) {
  const [values, setValues] = useState<ConnectionRequest>({
    name: "",
    email: "",
    message: "",
    consent: false,
  });
  const [errors, setErrors] = useState<ReturnType<typeof validateConnection>>(
    {},
  );
  const [pending, setPending] = useState(false);
  const [receipt, setReceipt] = useState("");
  const [failure, setFailure] = useState("");
  async function submit(e: FormEvent) {
    e.preventDefault();
    const next = validateConnection(values);
    setErrors(next);
    setFailure("");
    if (Object.keys(next).length) return;
    setPending(true);
    try {
      setReceipt((await connect(gateway, profileId, values)).message);
    } catch {
      setFailure("No pudimos procesar la solicitud. Intenta de nuevo.");
    } finally {
      setPending(false);
    }
  }
  if (receipt)
    return (
      <div className="form-receipt" role="status">
        <CheckCircle2 size={30} />
        <h3>Todo listo para conectar</h3>
        <p>{receipt}</p>
        <button className="text-button" onClick={() => setReceipt("")}>
          Volver al formulario
        </button>
      </div>
    );
  return (
    <form onSubmit={submit} noValidate>
      <div className="form-heading">
        <span className="eyebrow">HAGAMOS CONEXIÓN</span>
        <h3>
          Las buenas ideas empiezan
          <br />
          con una conversación.
        </h3>
        <p>Déjame tus datos y encontremos un punto en común.</p>
      </div>
      <div className="field-row">
        <div className="field">
          <label htmlFor="name">
            Tu nombre <span>*</span>
          </label>
          <input
            id="name"
            name="name"
            autoComplete="name"
            placeholder="¿Cómo te llamas?"
            maxLength={100}
            required
            value={values.name}
            onChange={(e) => setValues({ ...values, name: e.target.value })}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "name-error" : undefined}
          />
          {errors.name && (
            <small id="name-error" className="error">
              {errors.name}
            </small>
          )}
        </div>
        <div className="field">
          <label htmlFor="email">
            Correo electrónico <span>*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="hola@tuempresa.com"
            maxLength={254}
            required
            value={values.email}
            onChange={(e) => setValues({ ...values, email: e.target.value })}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {errors.email && (
            <small id="email-error" className="error">
              {errors.email}
            </small>
          )}
        </div>
      </div>
      <div className="field">
        <label htmlFor="message">
          ¿Qué tienes en mente? <span className="optional">Opcional</span>
        </label>
        <textarea
          id="message"
          name="message"
          placeholder="Una idea, un proyecto o simplemente un hola…"
          maxLength={500}
          rows={3}
          value={values.message}
          onChange={(e) => setValues({ ...values, message: e.target.value })}
        />
      </div>
      <label className="consent">
        <input
          type="checkbox"
          required
          checked={values.consent}
          onChange={(e) => setValues({ ...values, consent: e.target.checked })}
          aria-invalid={!!errors.consent}
          aria-describedby={errors.consent ? "consent-error" : undefined}
        />
        <span>
          Autorizo el uso de estos datos para recibir una respuesta a mi
          solicitud.
        </span>
      </label>
      {errors.consent && (
        <small className="error" id="consent-error">
          {errors.consent}
        </small>
      )}
      {failure && (
        <p role="alert" className="error">
          {failure}
        </p>
      )}
      <button
        className="primary-button send-button"
        disabled={pending}
        type="submit"
      >
        {pending ? "Enviando…" : `Conectar con ${recipientName}`}
        <ArrowUpRight size={18} />
      </button>
      <p className="privacy-note">
        <LockKeyhole size={12} />{" "}
        {demo
          ? "Demostración: usa datos de prueba. No se enviarán ni guardarán."
          : "Tus datos se comparten con el dueño de esta tarjeta para responder a tu solicitud."}
      </p>
    </form>
  );
}
