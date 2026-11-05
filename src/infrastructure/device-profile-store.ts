import type { ProfileStore, StoredProfile } from "../domain/workspace";
import {
  isStoredDraft,
  validateDraft,
} from "../application/workspace-services";

export const DEVICE_PROFILE_KEY = "one-card.profile.v1";

/** A device draft is never considered a public, remotely accessible profile. */
export function createDeviceProfileStore(
  storage: Pick<Storage, "getItem" | "setItem">,
): ProfileStore {
  return {
    mode: "device",
    async load() {
      const raw = storage.getItem(DEVICE_PROFILE_KEY);
      if (!raw) return null;
      try {
        const record: unknown = JSON.parse(raw);
        if (
          !record ||
          typeof record !== "object" ||
          !("draft" in record) ||
          !isStoredDraft(record.draft)
        )
          throw new Error();
        const updatedAt =
          "updatedAt" in record && typeof record.updatedAt === "string"
            ? record.updatedAt
            : "";
        return { draft: record.draft, published: false, updatedAt };
      } catch {
        throw new Error(
          "No pudimos leer el borrador guardado. Exporta o respalda los datos del navegador antes de restaurarlo.",
        );
      }
    },
    async save(draft) {
      if (Object.keys(validateDraft(draft)).length)
        throw new Error("Revisa los campos del perfil.");
      const record: StoredProfile = {
        draft,
        published: false,
        updatedAt: new Date().toISOString(),
      };
      try {
        storage.setItem(DEVICE_PROFILE_KEY, JSON.stringify(record));
      } catch {
        throw new Error(
          "El navegador no permite guardar el borrador. Comprueba el almacenamiento disponible.",
        );
      }
      return record;
    },
    async publish() {
      throw new Error(
        "La publicación requiere una cuenta conectada a la nube.",
      );
    },
    async unpublish() {
      throw new Error("Este borrador no está publicado.");
    },
    async getPublished() {
      return null;
    },
  };
}
