import { describe, expect, it } from "vitest";
import { connect, createVCard, validateConnection } from "./profile-services";
import { emptyDraft, toProfessionalProfile } from "./workspace-services";
describe("vCard export", () => {
  it("omits missing optional fields in a newly created profile", () => {
    const card = createVCard(
      toProfessionalProfile({
        ...emptyDraft(),
        firstName: "QA",
        lastName: "Local",
        role: "Pruebas",
      }),
    );
    expect(card).toContain("FN:QA Local");
    expect(card).not.toContain("TEL;");
    expect(card).not.toContain("EMAIL:");
    expect(card).not.toContain("ORG:");
  });
  it("escapes reserved characters and line breaks to prevent property injection", () => {
    const card = createVCard({
      ...toProfessionalProfile({
        ...emptyDraft(),
        firstName: "Ana",
        lastName: "Sol",
        role: "Diseñadora",
        slug: "ana-sol",
      }),
      name: "Ana; Sol, Pérez\nTEL:injected",
      company: "A\\B",
    });
    expect(card).toContain("FN:Ana\\; Sol\\, Pérez\\nTEL:injected\r\n");
    expect(card).toContain("ORG:A\\\\B\r\n");
    expect(
      card.split("\r\n").filter((line) => line.startsWith("TEL:")),
    ).toHaveLength(0);
    expect(card).toMatch(/^BEGIN:VCARD\r\nVERSION:3.0/);
    expect(card.endsWith("END:VCARD\r\n")).toBe(true);
  });
});
describe("connection use case", () => {
  const valid = {
    name: " Ana ",
    email: "ana@example.com",
    message: "Hola",
    consent: true,
  };
  it("requires valid contact information and explicit consent", () => {
    expect(
      validateConnection({
        name: "",
        email: "invalid",
        message: "",
        consent: false,
      }),
    ).toHaveProperty("consent");
    expect(
      Object.keys(
        validateConnection({
          name: "",
          email: "invalid",
          message: "",
          consent: false,
        }),
      ),
    ).toHaveLength(3);
    expect(
      validateConnection({ ...valid, message: "a".repeat(501) }),
    ).toHaveProperty("message");
  });
  it("rejects invalid input before calling the gateway", async () => {
    let called = false;
    await expect(
      connect(
        {
          send: async () => {
            called = true;
            return { mode: "sent", message: "ok" };
          },
        },
        "id",
        { ...valid, consent: false },
      ),
    ).rejects.toThrow();
    expect(called).toBe(false);
  });
  it("accepts interchangeable gateways and normalizes the name", async () => {
    const result = await connect(
      {
        send: async (id, data) => {
          expect(id).toBe("profile");
          expect(data.name).toBe("Ana");
          return { mode: "sent", message: "ok" };
        },
      },
      "profile",
      valid,
    );
    expect(result.mode).toBe("sent");
  });
});
