import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowUpRight,
  CheckCircle2,
  CloudOff,
  Download,
  Eye,
  FileText,
  Globe2,
  LoaderCircle,
  LogOut,
  Save,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import type {
  Account,
  AuthGateway,
  ProfileDraft,
  ProfileStore,
  StoredProfile,
} from "../domain/workspace";
import {
  createSlug,
  emptyDraft,
  validateDraft,
} from "../application/workspace-services";
import { downloadFile } from "../infrastructure/browser";
import { Brand } from "../components/Brand";

const sections: {
  title: string;
  description: string;
  fields: {
    key: keyof ProfileDraft;
    label: string;
    placeholder: string;
    type?: string;
    required?: boolean;
    hint?: string;
  }[];
}[] = [
  {
    title: "Tu presentación",
    description: "Los detalles que hacen que te reconozcan.",
    fields: [
      {
        key: "firstName",
        label: "Nombre",
        placeholder: "Tu nombre",
        required: true,
      },
      {
        key: "lastName",
        label: "Apellidos",
        placeholder: "Tus apellidos",
        required: true,
      },
      {
        key: "role",
        label: "Cargo o profesión",
        placeholder: "¿A qué te dedicas?",
        required: true,
      },
      {
        key: "company",
        label: "Empresa o marca",
        placeholder: "El nombre de tu empresa",
      },
      {
        key: "location",
        label: "Ciudad y país",
        placeholder: "¿Dónde trabajas?",
      },
      {
        key: "avatarUrl",
        label: "URL de tu fotografía",
        placeholder: "https://…",
        type: "url",
        hint: "Opcional. Una imagen pública en HTTPS; si la omites se usarán tus iniciales.",
      },
    ],
  },
  {
    title: "Tus canales de contacto",
    description:
      "Completa únicamente los datos que quieras mostrar en tu tarjeta pública.",
    fields: [
      {
        key: "email",
        label: "Correo de contacto",
        placeholder: "Tu correo profesional",
        type: "email",
      },
      {
        key: "phone",
        label: "Teléfono",
        placeholder: "+ seguido del código de país y número",
        type: "tel",
      },
      {
        key: "whatsapp",
        label: "WhatsApp",
        placeholder: "+ seguido del código de país y número",
        type: "tel",
      },
      {
        key: "linkedin",
        label: "LinkedIn",
        placeholder: "https://www.linkedin.com/in/…",
        type: "url",
      },
    ],
  },
];
export function Editor({
  store,
  account,
  auth,
}: {
  store: ProfileStore;
  account: Account | null;
  auth: AuthGateway | null;
}) {
  const [draft, setDraft] = useState<ProfileDraft>(emptyDraft);
  const [record, setRecord] = useState<StoredProfile | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [initial, setInitial] = useState("");
  const [errors, setErrors] = useState<ReturnType<typeof validateDraft>>({});
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const dirty = loaded && JSON.stringify(draft) !== initial;
  useEffect(() => {
    let active = true;
    setLoaded(false);
    store
      .load()
      .then((value) => {
        if (!active) return;
        const data = value?.draft ?? emptyDraft();
        setDraft(data);
        setRecord(value);
        setInitial(JSON.stringify(data));
        setLoaded(true);
      })
      .catch((e) => {
        if (active) {
          setError(
            e instanceof Error ? e.message : "No pudimos cargar tu perfil.",
          );
          setLoaded(true);
        }
      });
    return () => {
      active = false;
    };
  }, [store]);
  useEffect(() => {
    if (!dirty) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);
  function update(key: keyof ProfileDraft, value: string) {
    setDraft((previous) => ({ ...previous, [key]: value }));
    setNotice("");
    setErrors((previous) => ({ ...previous, [key]: undefined }));
  }
  async function save(action: "save" | "preview" | "publish" = "save") {
    setNotice("");
    setError("");
    const value = {
      ...draft,
      slug: draft.slug || createSlug(`${draft.firstName}-${draft.lastName}`),
    };
    setDraft(value);
    const next = validateDraft(value);
    setErrors(next);
    if (Object.keys(next).length) {
      document.getElementById(`edit-${Object.keys(next)[0]}`)?.focus();
      return;
    }
    setBusy(true);
    try {
      const result =
        action === "publish"
          ? await store.publish(value)
          : await store.save(value);
      setRecord(result);
      setDraft(result.draft);
      setInitial(JSON.stringify(result.draft));
      if (action === "preview")
        navigate(
          store.mode === "demo" ? "/demo/vista-previa" : "/vista-previa",
        );
      else
        setNotice(
          action === "publish"
            ? "Tu tarjeta ya está publicada."
            : store.mode === "demo"
              ? "Cambios aplicados a esta demostración. Se restablecen al recargar."
              : store.mode === "device"
                ? "Borrador guardado en este navegador."
                : "Cambios guardados. Publica para actualizar tu tarjeta.",
        );
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "No pudimos guardar. Intenta otra vez.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function unpublish() {
    setBusy(true);
    setError("");
    try {
      const result = await store.unpublish();
      setRecord(result);
      setNotice("Tu tarjeta dejó de estar disponible públicamente.");
    } catch {
      setError("No pudimos retirar la publicación. Intenta de nuevo.");
    } finally {
      setBusy(false);
    }
  }
  function submit(e: FormEvent) {
    e.preventDefault();
    void save();
  }
  async function signOut() {
    if (
      dirty &&
      !window.confirm("Hay cambios sin guardar. ¿Quieres salir de todos modos?")
    )
      return;
    try {
      await auth?.signOut();
      navigate("/");
    } catch {
      setError("No pudimos cerrar la sesión.");
    }
  }
  if (!loaded)
    return (
      <div className="loading-state" role="status">
        <LoaderCircle className="spin" />
        Cargando tu espacio…
      </div>
    );
  const filled = [
    draft.firstName,
    draft.lastName,
    draft.role,
    draft.company,
    draft.bio,
    draft.email || draft.phone || draft.whatsapp,
  ].filter((x) => x.trim()).length;
  return (
    <div className="workspace-shell">
      <header className="workspace-header">
        <Brand />
        <div className="workspace-header-actions">
          <span className="workspace-status">
            {store.mode === "device" ? (
              <Smartphone size={13} />
            ) : (
              <Globe2 size={13} />
            )}{" "}
            {store.mode === "device"
              ? "En este dispositivo"
              : store.mode === "demo"
                ? "Datos de ejemplo"
                : "Cuenta conectada"}
          </span>
          {account && (
            <button className="secondary-button" onClick={signOut}>
              <LogOut size={14} />
              Salir
            </button>
          )}
        </div>
      </header>
      <div className="workspace-layout">
        <aside className="workspace-sidebar">
          <span className="eyebrow">MI ESPACIO</span>
          <Link className="workspace-nav" to="/panel">
            Resumen
          </Link>
          <div className="workspace-nav active">
            <FileText size={17} />
            Mi tarjeta
          </div>
          <button
            className="workspace-nav"
            onClick={() => void save("preview")}
            disabled={busy}
          >
            <Eye size={17} />
            Vista previa
          </button>
          <Link
            className="workspace-nav"
            to="/acceso"
            onClick={(e) => {
              if (
                dirty &&
                !window.confirm(
                  "Hay cambios sin guardar. ¿Quieres salir del editor?",
                )
              )
                e.preventDefault();
            }}
          >
            <ShieldCheck size={17} />
            {account ? "Mi cuenta" : "Acceso a cuentas"}
          </Link>
          <Link className="workspace-nav" to="/contactos">
            Contactos recibidos
          </Link>
          <div className="sidebar-note">
            <ShieldCheck size={18} />
            <p>
              {store.mode === "device"
                ? "Tu borrador permanece en este navegador. Todavía no es visible para otras personas."
                : store.mode === "demo"
                  ? "Explora con datos ficticios. Tus cambios de prueba solo duran esta sesión."
                  : "Solo tú puedes editar tu perfil. Tú decides cuándo publicarlo."}
            </p>
          </div>
        </aside>
        <main className="editor-main">
          <div className="editor-heading">
            <div>
              <span className="eyebrow">TU IDENTIDAD PROFESIONAL</span>
              <h1>{record ? "Dale tu toque." : "Empecemos contigo."}</h1>
              <p>
                {record
                  ? "Mantén tu presentación tan actual como tú."
                  : "Completa tu información y crea una tarjeta que te represente."}
              </p>
            </div>
            <span className="draft-badge">
              {record?.published ? "Publicada" : "Borrador"}
            </span>
          </div>
          {store.mode === "device" && (
            <div className="device-banner">
              <CloudOff size={20} />
              <div>
                <strong>Estás creando un borrador local.</strong>
                <p>
                  Se guarda en este navegador. Para acceder desde otro
                  dispositivo, recibir contactos y compartir un enlace público
                  hará falta activar las cuentas en la nube.
                </p>
              </div>
            </div>
          )}
          {store.mode === "demo" && (
            <div className="demo-panel-banner">
              <ShieldCheck size={17} />
              <span>
                Modo demostración. Los datos son ficticios y puedes editarlos
                libremente.
              </span>
            </div>
          )}
          <div className="profile-progress">
            <span>Tu perfil, paso a paso</span>
            <div>
              <span style={{ width: `${(filled / 6) * 100}%` }} />
            </div>
            <strong>{filled}/6</strong>
          </div>
          <form onSubmit={submit} noValidate>
            <fieldset disabled={busy} className="editor-fields">
              {sections.map((section) => (
                <section className="editor-section" key={section.title}>
                  <div className="editor-section-title">
                    <h2>{section.title}</h2>
                    <p>{section.description}</p>
                  </div>
                  <div className="editor-grid">
                    {section.fields.map((field) => (
                      <div className="field" key={field.key}>
                        <label htmlFor={`edit-${field.key}`}>
                          {field.label}
                          {field.required && <span> *</span>}
                        </label>
                        <input
                          id={`edit-${field.key}`}
                          name={field.key}
                          type={field.type ?? "text"}
                          maxLength={
                            field.key === "avatarUrl"
                              ? 2048
                              : field.key === "email"
                                ? 254
                                : field.key === "linkedin"
                                  ? 2048
                                  : 100
                          }
                          value={draft[field.key]}
                          onChange={(e) => update(field.key, e.target.value)}
                          placeholder={field.placeholder}
                          required={field.required}
                          aria-invalid={!!errors[field.key]}
                          aria-describedby={
                            errors[field.key]
                              ? `error-${field.key}`
                              : field.hint
                                ? `hint-${field.key}`
                                : undefined
                          }
                          autoComplete={
                            field.key === "firstName"
                              ? "given-name"
                              : field.key === "lastName"
                                ? "family-name"
                                : field.key === "email"
                                  ? "email"
                                  : field.key === "phone"
                                    ? "tel"
                                    : undefined
                          }
                        />
                        {field.hint && (
                          <small
                            className="field-hint"
                            id={`hint-${field.key}`}
                          >
                            {field.hint}
                          </small>
                        )}
                        {errors[field.key] && (
                          <small className="error" id={`error-${field.key}`}>
                            {errors[field.key]}
                          </small>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              ))}
              <section className="editor-section">
                <div className="editor-section-title">
                  <h2>Un poco más de ti</h2>
                  <p>Las conexiones también empiezan con una buena historia.</p>
                </div>
                <div className="field">
                  <label htmlFor="edit-bio">
                    Presentación breve{" "}
                    <span className="optional">{draft.bio.length}/500</span>
                  </label>
                  <textarea
                    id="edit-bio"
                    value={draft.bio}
                    onChange={(e) => update("bio", e.target.value)}
                    maxLength={500}
                    rows={4}
                    placeholder="Cuenta qué haces, qué te mueve y cómo puedes aportar."
                  />
                </div>
                <div className="field">
                  <label htmlFor="edit-expertise">Áreas de interés</label>
                  <input
                    id="edit-expertise"
                    value={draft.expertise}
                    onChange={(e) => update("expertise", e.target.value)}
                    maxLength={150}
                    placeholder="Separa tus áreas de interés con comas"
                  />
                </div>
                <div className="field">
                  <label htmlFor="edit-slug">Identificador de tu tarjeta</label>
                  <input
                    id="edit-slug"
                    value={draft.slug}
                    onChange={(e) => update("slug", e.target.value)}
                    readOnly={store.mode === "cloud" && !!record}
                    placeholder="Se generará a partir de tu nombre"
                    aria-invalid={!!errors.slug}
                    aria-describedby={errors.slug ? "error-slug" : "hint-slug"}
                  />
                  <small className="field-hint" id="hint-slug">
                    {store.mode === "cloud" && record
                      ? "El enlace queda fijo para que tu QR siga funcionando."
                      : "Será parte de tu enlace cuando publiques tu tarjeta."}
                  </small>
                  {errors.slug && (
                    <small id="error-slug" className="error">
                      {errors.slug}
                    </small>
                  )}
                </div>
              </section>
              {error && (
                <p role="alert" className="error editor-feedback">
                  {error}
                </p>
              )}
              {notice && (
                <p className="success-message editor-feedback" role="status">
                  <CheckCircle2 size={17} />
                  {notice}
                </p>
              )}
              <div className="editor-actions">
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => void save("preview")}
                >
                  <Eye size={16} />
                  Guardar y previsualizar
                </button>
                <button className="primary-button" type="submit">
                  {busy ? (
                    <LoaderCircle className="spin" size={16} />
                  ) : (
                    <Save size={16} />
                  )}
                  Guardar {store.mode === "device" ? "borrador" : "cambios"}
                </button>
              </div>
            </fieldset>
          </form>
          <section className="publish-panel">
            <div>
              <h2>Tu tarjeta, lista para salir al mundo.</h2>
              <p>
                {store.mode !== "cloud"
                  ? "La publicación real se conectará con el backend. Mientras tanto puedes previsualizar tu tarjeta y descargar los datos para revisar la integración."
                  : "Publica tu tarjeta para que otras personas puedan conocer tu perfil y contactar contigo."}
              </p>
            </div>
            {store.mode !== "cloud" ? (
              <button
                className="secondary-button"
                disabled={!record || dirty}
                onClick={() =>
                  downloadFile(
                    JSON.stringify(record?.draft, null, 2),
                    "one-card-respaldo.json",
                    "application/json",
                  )
                }
              >
                <Download size={16} />
                Descargar respaldo
              </button>
            ) : (
              <div className="publish-actions">
                <button
                  className="primary-button"
                  onClick={() => void save("publish")}
                  disabled={busy}
                >
                  <Globe2 size={16} />
                  {record?.published
                    ? "Actualizar publicación"
                    : "Publicar tarjeta"}
                </button>
                {record?.published && (
                  <>
                    <Link
                      className="secondary-button"
                      to={`/p/${record.draft.slug}`}
                      target="_blank"
                    >
                      Ver tarjeta
                      <ArrowUpRight size={15} />
                    </Link>
                    <button
                      className="text-button"
                      onClick={unpublish}
                      disabled={busy}
                    >
                      Retirar publicación
                    </button>
                  </>
                )}
              </div>
            )}
          </section>
        </main>
      </div>
      <footer className="workspace-footer">
        ONE CARD by R&A · Tu identidad, siempre contigo.
        {record && (
          <span>
            Último guardado:{" "}
            {new Date(record.updatedAt).toLocaleString("es-CO")}
          </span>
        )}
      </footer>
    </div>
  );
}
