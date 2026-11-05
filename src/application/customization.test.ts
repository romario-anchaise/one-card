import { describe, it, expect } from "vitest";
import {
  emptyDraft,
  isAvatarSource,
  toProfessionalProfile,
  validateDraft,
} from "./workspace-services";
import { createDeviceProfileStore } from "../infrastructure/device-profile-store";
const draft = () => ({
  ...emptyDraft(),
  firstName: "Ana",
  lastName: "Sol",
  role: "Diseñadora",
  slug: "ana-sol",
});
describe("profile personalization", () => {
  it("preserves older drafts while validating new optional settings", () => {
    expect(validateDraft(draft())).toEqual({});
    expect(validateDraft({ ...draft(), appearance: "bamboo" })).toEqual({});
    expect(
      validateDraft({ ...draft(), appearance: "invalid" as never }),
    ).toHaveProperty("appearance");
  });
  it("rejects script links and accepts ordered named HTTPS resources", () => {
    expect(
      validateDraft({
        ...draft(),
        links: [{ id: "1", label: "Web", url: "javascript:alert(1)" }],
      }),
    ).toHaveProperty("links");
    const links = [
      { id: "b", label: "Agenda", url: "https://example.com/agenda" },
      { id: "a", label: "Web", url: "https://example.com" },
    ];
    expect(toProfessionalProfile({ ...draft(), links }).links).toEqual(links);
    expect(
      validateDraft({ ...draft(), links: [links[0], links[0]] }),
    ).toHaveProperty("links");
  });
  it("restricts inline image sources to bounded raster formats", () => {
    expect(isAvatarSource("data:image/webp;base64,AAAA")).toBe(true);
    expect(isAvatarSource("data:image/svg+xml;base64,AAAA")).toBe(false);
    expect(isAvatarSource("data:image/webp;base64," + "A".repeat(750000))).toBe(
      false,
    );
  });
  it("round-trips a personalized draft through device persistence", async () => {
    const memory = new Map<string, string>();
    const store = createDeviceProfileStore({
      getItem: (key) => memory.get(key) ?? null,
      setItem: (key, value) => {
        memory.set(key, value);
      },
    });
    await store.save({
      ...draft(),
      appearance: "steel",
      links: [{ id: "1", label: "Web", url: "https://example.com" }],
    });
    const loaded = await store.load();
    expect(loaded?.draft.appearance).toBe("steel");
    expect(loaded?.draft.links).toHaveLength(1);
  });
});
