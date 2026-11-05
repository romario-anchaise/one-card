import { useEffect, useRef, useState, type FormEvent } from "react";
import { useNavigate, useBlocker, Link } from "react-router-dom";
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
  ProfileTextField,
} from "../domain/workspace";
import {
  createSlug,
  emptyDraft,
  validateDraft,
} from "../application/workspace-services";
import { downloadFile } from "../infrastructure/browser";
import { AppHeader } from "../components/AppHeader";
import { Modal } from "../components/Modal";
import { ProfileCustomization } from "../components/ProfileCustomization";
import { PhysicalCard } from "../components/PhysicalCard";
import { toProfessionalProfile } from "../application/workspace-services";

const sections: {
  title: string;
  description: string;
  fields: {
    key: ProfileTextField;
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
  const savedNavigation = useRef(false);
  const blocker = useBlocker(() => dirty && !savedNavigation.current);
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
  function update(key: ProfileTextField, value: string) {
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
      const key = Object.keys(next)[0];
      const target =
        document.getElementById(`edit-${key}`) ??
        document.getElementById(
          key === "links" ? "profile-links" : "profile-customization",
        );
      let parent = target?.parentElement;
      while (parent) {
        if (parent instanceof HTMLDetailsElement) parent.open = true;
        parent = parent.parentElement;
      }
      target?.focus();
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
      if (action === "preview") {
        savedNavigation.current = true;
        navigate(
          store.mode === "demo" ? "/demo/vista-previa" : "/vista-previa",
        );
      } else
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
      savedNavigation.current = true;
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
  return (
    <div className="workspace-shell minimal-workspace">
      {blocker.state === "blocked" && (
        <Modal title="Cambios sin guardar" onClose={() => blocker.reset()}>
          <p className="modal-description">
            Si sales, perderás los cambios de esta edición.
          </p>
          <div className="modal-actions">
            <button className="primary-button" onClick={() => blocker.reset()}>
              Seguir editando
            </button>
            <button
              className="secondary-button"
              onClick={() => blocker.proceed()}
            >
              Salir sin guardar
            </button>
          </div>
        </Modal>
      )}
      <AppHeader className="workspace-header">
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
      </AppHeader>
      <div className="workspace-layout">
        <aside className="workspace-sidebar">
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
          <Link className="workspace-nav" to="/acceso">
            <ShieldCheck size={17} />
            {account ? "Mi cuenta" : "Acceso a cuentas"}
          </Link>
          <Link className="workspace-nav" to="/contactos">
            Contactos recibidos
          </Link>
        </aside>
        <main className="editor-main">
          <div className="editor-heading">
            <div>
              <h1>Mi tarjeta</h1>
            </div>
            <span className="draft-badge">
              {dirty
                ? "Sin guardar"
                : record?.published
                  ? "Publicada"
                  : "Borrador"}
            </span>
          </div>
          {store.mode === "device" && (
            <div className="device-banner">
              <CloudOff size={20} />
              <div>
                <p>Guardado solo en este navegador.</p>
              </div>
            </div>
          )}
          {store.mode === "demo" && (
            <div className="demo-panel-banner">
              <ShieldCheck size={17} />
              <span>Demo: los cambios se reinician al recargar.</span>
            </div>
          )}
          <form onSubmit={submit} noValidate>
            <fieldset disabled={busy} className="editor-fields">
              <details className="live-card-preview">
                <summary>Vista previa en vivo</summary>
                <PhysicalCard profile={toProfessionalProfile(draft)} />
              </details>
              <details className="editor-advanced">
                <summary>Foto, diseño y enlaces</summary>
                <ProfileCustomization
                  draft={draft}
                  onChange={(changes) => {
                    setDraft((previous) => ({ ...previous, ...changes }));
                    setNotice("");
                  }}
                  onImport={(value) => {
                    setDraft({
                      ...value,
                      slug: store.mode === "demo" ? draft.slug : value.slug,
                    });
                    setErrors({});
                    setNotice(
                      "Respaldo cargado en el editor. Revisa los datos y guarda.",
                    );
                  }}
                  error={errors.links}
                />
              </details>
              {sections.map((section) => (
                <section className="editor-section" key={section.title}>
                  <div className="editor-section-title">
                    <h2>{section.title}</h2>
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
                          value={
                            field.key === "avatarUrl" &&
                            draft.avatarUrl.startsWith("data:")
                              ? ""
                              : draft[field.key]
                          }
                          onChange={(e) => update(field.key, e.target.value)}
                          placeholder={
                            field.key === "avatarUrl" &&
                            draft.avatarUrl.startsWith("data:")
                              ? "Foto cargada desde tu equipo"
                              : field.placeholder
                          }
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
              <details className="editor-advanced">
                <summary>Más información</summary>
                <section className="editor-section">
                  <div className="editor-section-title">
                    <h2>Sobre ti</h2>
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
                    <label htmlFor="edit-slug">
                      Identificador de tu tarjeta
                    </label>
                    <input
                      id="edit-slug"
                      value={draft.slug}
                      onChange={(e) => update("slug", e.target.value)}
                      readOnly={store.mode !== "device" && !!record}
                      placeholder="Se generará a partir de tu nombre"
                      aria-invalid={!!errors.slug}
                      aria-describedby={
                        errors.slug ? "error-slug" : "hint-slug"
                      }
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
              </details>
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
              <h2>{store.mode === "cloud" ? "Publicación" : "Respaldo"}</h2>
              <p>
                {store.mode !== "cloud"
                  ? "Descarga una copia de tus datos."
                  : "Elige cuándo mostrar tu perfil."}
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
