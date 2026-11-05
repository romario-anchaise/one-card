import { describe, it, expect } from "vitest";
import {
  createSlug,
  emptyDraft,
  isHttpsUrl,
  toProfessionalProfile,
  validateDraft,
} from "./workspace-services";
import {
  createDeviceProfileStore,
  DEVICE_PROFILE_KEY,
} from "../infrastructure/device-profile-store";

const validDraft = () => ({
  ...emptyDraft(),
  firstName: "Ana",
  lastName: "Pérez",
  role: "Diseñadora",
  slug: "ana-perez",
});
describe("profile creation", () => {
  it("starts with no invented personal information", () => {
    const draft = emptyDraft();
    expect(draft.firstName).toBe("");
    expect(draft.email).toBe("");
    expect(draft.slug).toBe("");
    expect(draft.phone).toBe("");
  });
  it("normalizes a permalink and validates required fields", () => {
    expect(createSlug("Ána Pérez & Co.")).toBe("ana-perez-co");
    expect(validateDraft(validDraft())).toEqual({});
    expect(validateDraft(emptyDraft())).toHaveProperty("firstName");
  });
  it("rejects executable URLs and deceptive LinkedIn domains", () => {
    expect(isHttpsUrl("javascript:alert(1)")).toBe(false);
    expect(isHttpsUrl("https://linkedin.com.evil.test/a", "linkedin.com")).toBe(
      false,
    );
    expect(isHttpsUrl("https://user:pass@linkedin.com/", "linkedin.com")).toBe(
      false,
    );
    expect(
      validateDraft({ ...validDraft(), linkedin: "javascript:alert(1)" }),
    ).toHaveProperty("linkedin");
  });
  it("only includes channels the owner actually entered", () => {
    const p = toProfessionalProfile(validDraft());
    expect(p.contacts).toEqual([]);
    expect(p.name).toBe("Ana Pérez");
    const withPhone = toProfessionalProfile({
      ...validDraft(),
      phone: "+12025550148",
    });
    expect(withPhone.contacts).toEqual([
      { kind: "phone", label: "Llamar", href: "tel:+12025550148" },
    ]);
  });
});
describe("device draft persistence", () => {
  function storage() {
    const map = new Map<string, string>();
    return {
      getItem: (key: string) => map.get(key) ?? null,
      setItem: (key: string, value: string) => {
        map.set(key, value);
      },
    };
  }
  it("starts empty and restores a saved draft without marking it public", async () => {
    const memory = storage();
    const store = createDeviceProfileStore(memory);
    expect(await store.load()).toBeNull();
    await store.save(validDraft());
    const restored = await createDeviceProfileStore(memory).load();
    expect(restored?.draft.firstName).toBe("Ana");
    expect(restored?.published).toBe(false);
    expect(await store.getPublished("ana-perez")).toBeNull();
    await expect(store.publish(validDraft())).rejects.toThrow("nube");
  });
  it("reports corrupt or blocked storage instead of pretending a save worked", async () => {
    const memory = storage();
    memory.setItem(DEVICE_PROFILE_KEY, "broken");
    await expect(createDeviceProfileStore(memory).load()).rejects.toThrow();
    const blocked = createDeviceProfileStore({
      getItem: () => null,
      setItem: () => {
        throw new Error("QuotaExceeded");
      },
    });
    await expect(blocked.save(validDraft())).rejects.toThrow(
      "no permite guardar",
    );
  });
  it("does not persist invalid profiles", async () => {
    const store = createDeviceProfileStore(storage());
    await expect(store.save(emptyDraft())).rejects.toThrow();
    expect(await store.load()).toBeNull();
  });
});
