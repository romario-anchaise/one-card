import type { ConnectionGateway } from "../domain/profile";
import type { ProfileStore, StoredProfile } from "../domain/workspace";
import {
  toProfessionalProfile,
  validateDraft,
} from "../application/workspace-services";
import { demoDraft, demoAvatarUrl } from "./demo-data";
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
export function createDemoProfileStore(): ProfileStore {
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
        avatarUrl: record.draft.avatarUrl || demoAvatarUrl,
        demo: true,
      };
    },
  };
}
