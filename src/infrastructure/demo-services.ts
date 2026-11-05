import type { ConnectionGateway, ConnectionRequest } from "../domain/profile";
import type {
  ProfileStore,
  StoredProfile,
  ProfileDraft,
} from "../domain/workspace";
import {
  toProfessionalProfile,
  validateDraft,
} from "../application/workspace-services";
import { demoDraft } from "./demo-data";
export const demoConnectionGateway: ConnectionGateway = {
  async send() {
    await new Promise((resolve) => setTimeout(resolve, 650));
    return {
      mode: "demo",
      message:
        "Así se verá la confirmación. Esta es una demostración: no enviamos ni guardamos tus datos.",
    };
  },
};
export function createDemoConnectionGateway(
  onRequest: (profileId: string, request: ConnectionRequest) => void,
): ConnectionGateway {
  return {
    async send(profileId, request) {
      await new Promise((resolve) => setTimeout(resolve, 650));
      onRequest(profileId, request);
      return {
        mode: "demo",
        message:
          "Solicitud añadida a la bandeja de ejemplo durante esta sesión. No se envió a ningún servidor.",
      };
    },
  };
}
export function createDemoProfileStore(
  onSaved?: (draft: ProfileDraft) => void,
): ProfileStore {
  let record: StoredProfile = {
    draft: { ...demoDraft },
    published: false,
    updatedAt: new Date().toISOString(),
  };
  return {
    mode: "demo",
    async load() {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return structuredClone(record);
    },
    async save(draft) {
      if (Object.keys(validateDraft(draft)).length)
        throw new Error("Revisa los campos del perfil.");
      await new Promise((resolve) => setTimeout(resolve, 500));
      record = {
        draft: { ...draft },
        published: false,
        updatedAt: new Date().toISOString(),
      };
      onSaved?.(structuredClone(draft));
      return structuredClone(record);
    },
    async publish() {
      throw new Error("La publicación real se conectará mediante el backend.");
    },
    async unpublish() {
      throw new Error("La tarjeta de ejemplo no tiene una publicación real.");
    },
    async getPublished(slug) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      if (slug !== record.draft.slug) return null;
      return {
        ...toProfessionalProfile(record.draft),
        demo: true,
      };
    },
  };
}
