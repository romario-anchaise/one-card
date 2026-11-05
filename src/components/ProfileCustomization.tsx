import { useState, type ChangeEvent } from "react";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  ImagePlus,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import type { ProfileDraft } from "../domain/workspace";
import { prepareProfilePhoto } from "../infrastructure/photo";
import { isStoredDraft } from "../application/workspace-services";
export function ProfileCustomization({
  draft,
  onChange,
  onImport,
  error,
}: {
  draft: ProfileDraft;
  onChange: (changes: Partial<ProfileDraft>) => void;
  onImport: (value: ProfileDraft) => void;
  error?: string;
}) {
  const [photoError, setPhotoError] = useState("");
  const [failedPhoto, setFailedPhoto] = useState("");
  const [loading, setLoading] = useState(false);
  async function photo(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setPhotoError("");
    try {
      onChange({ avatarUrl: await prepareProfilePhoto(file) });
    } catch (err) {
      setPhotoError(
        err instanceof Error ? err.message : "No pudimos cargar la foto.",
      );
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  }
  async function restore(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError("");
    try {
      if (file.size > 1024 * 1024)
        throw new Error("El respaldo debe pesar menos de 1 MB.");
      const value: unknown = JSON.parse(await file.text());
      if (!isStoredDraft(value))
        throw new Error("El archivo no contiene un perfil válido.");
      if (
        window.confirm(
          "Se reemplazarán los campos del editor por este respaldo. ¿Continuar?",
        )
      )
        onImport({ ...value, id: draft.id });
    } catch (err) {
      setPhotoError(
        err instanceof Error ? err.message : "No pudimos leer el respaldo.",
      );
    } finally {
      e.target.value = "";
    }
  }
  const links = draft.links ?? [];
  function move(index: number, delta: number) {
    const copy = [...links];
    [copy[index], copy[index + delta]] = [copy[index + delta], copy[index]];
    onChange({ links: copy });
  }
  return (
    <section
      className="editor-section customization-section"
      id="profile-customization"
      tabIndex={-1}
    >
      <div className="editor-section-title">
        <h2>Hazla tuya</h2>
        <p>
          Personaliza tu foto, el acabado y los enlaces que quieres compartir.
        </p>
      </div>
      <div className="photo-editor">
        <div className="photo-editor-avatar">
          {draft.avatarUrl && failedPhoto !== draft.avatarUrl ? (
            <img
              src={draft.avatarUrl}
              alt="Vista previa de tu foto"
              onError={() => setFailedPhoto(draft.avatarUrl)}
            />
          ) : (
            <ImagePlus size={26} />
          )}
        </div>
        <div>
          <label className="secondary-button file-action">
            <ImagePlus size={15} />
            {loading ? "Preparando foto…" : "Elegir foto"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={loading}
              onChange={photo}
            />
          </label>
          <small>JPG, PNG o WebP · Hasta 5 MB · Recorte centrado</small>
          {draft.avatarUrl && (
            <button
              className="text-button"
              type="button"
              onClick={() => onChange({ avatarUrl: "" })}
            >
              Quitar fotografía
            </button>
          )}
        </div>
      </div>
      {photoError && (
        <p role="alert" className="error">
          {photoError}
        </p>
      )}
      <details className="optional-message">
        <summary>Usar un enlace de imagen</summary>
        <div className="field">
          <label htmlFor="edit-avatarUrl">URL de la fotografía</label>
          <input
            id="edit-avatarUrl"
            type="url"
            maxLength={2048}
            value={draft.avatarUrl.startsWith("data:") ? "" : draft.avatarUrl}
            placeholder="https://…"
            onChange={(e) => onChange({ avatarUrl: e.target.value })}
          />
        </div>
      </details>
      <fieldset className="appearance-options">
        <legend>Acabado de la tarjeta</legend>
        {[
          { id: "matte", label: "Negro mate" },
          { id: "bamboo", label: "Bambú" },
          { id: "steel", label: "Acero" },
        ].map((item) => (
          <label key={item.id} className={`appearance-option ${item.id}`}>
            <input
              type="radio"
              name="appearance"
              value={item.id}
              checked={(draft.appearance ?? "matte") === item.id}
              onChange={() =>
                onChange({
                  appearance: item.id as NonNullable<
                    ProfileDraft["appearance"]
                  >,
                })
              }
            />
            <span />
            {item.label}
          </label>
        ))}
      </fieldset>
      <div className="links-editor-heading" id="profile-links" tabIndex={-1}>
        <div>
          <h3>Tus enlaces</h3>
          <p>Portafolio, sitio web, agenda o catálogo. Hasta 6 enlaces.</p>
        </div>
        <button
          className="secondary-button"
          type="button"
          disabled={links.length >= 6}
          onClick={() =>
            onChange({
              links: [
                ...links,
                { id: crypto.randomUUID(), label: "", url: "" },
              ],
            })
          }
        >
          <Plus size={15} />
          Añadir
        </button>
      </div>
      {links.length === 0 && (
        <p className="empty-links">
          Todavía no tienes enlaces adicionales. Añade el primero.
        </p>
      )}
      {links.map((link, index) => (
        <div className="editable-link" key={link.id}>
          <div className="field">
            <label htmlFor={`link-label-${link.id}`}>
              Título del enlace {index + 1}
            </label>
            <input
              id={`link-label-${link.id}`}
              value={link.label}
              maxLength={60}
              placeholder="¿Qué quieres compartir?"
              onChange={(e) =>
                onChange({
                  links: links.map((item) =>
                    item.id === link.id
                      ? { ...item, label: e.target.value }
                      : item,
                  ),
                })
              }
            />
          </div>
          <div className="field">
            <label htmlFor={`link-url-${link.id}`}>URL HTTPS</label>
            <input
              id={`link-url-${link.id}`}
              value={link.url}
              type="url"
              maxLength={2048}
              placeholder="https://…"
              onChange={(e) =>
                onChange({
                  links: links.map((item) =>
                    item.id === link.id
                      ? { ...item, url: e.target.value }
                      : item,
                  ),
                })
              }
            />
          </div>
          <div className="link-order-actions">
            <button
              type="button"
              className="icon-button"
              aria-label={`Ocultar enlace ${index + 1}`}
              aria-pressed={link.hidden === true}
              title={link.hidden ? "Mostrar enlace" : "Ocultar enlace"}
              onClick={() =>
                onChange({
                  links: links.map((item) =>
                    item.id === link.id ? { ...item, hidden: !item.hidden } : item,
                  ),
                })
              }
            >
              {link.hidden ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
            <button
              type="button"
              className="icon-button"
              disabled={index === 0}
              aria-label={`Subir enlace ${index + 1}`}
              onClick={() => move(index, -1)}
            >
              <ArrowUp size={15} />
            </button>
            <button
              type="button"
              className="icon-button"
              disabled={index === links.length - 1}
              aria-label={`Bajar enlace ${index + 1}`}
              onClick={() => move(index, 1)}
            >
              <ArrowDown size={15} />
            </button>
            <button
              type="button"
              className="icon-button"
              aria-label={`Eliminar enlace ${index + 1}`}
              onClick={() =>
                onChange({ links: links.filter((item) => item.id !== link.id) })
              }
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      ))}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <div className="restore-profile">
        <label className="file-action">
          <Upload size={15} />
          Importar un respaldo JSON
          <input
            type="file"
            accept="application/json,.json"
            onChange={restore}
          />
        </label>
        <span>
          Solo reemplaza el editor. Revisa los datos antes de guardar.
        </span>
      </div>
    </section>
  );
}
