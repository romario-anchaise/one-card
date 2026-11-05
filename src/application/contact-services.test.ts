import { describe, it, expect } from "vitest";
import { contactsToCsv, filterContacts } from "./contact-services";
import type { LeadRecord } from "../domain/contact";
const records: LeadRecord[] = [
  {
    id: "1",
    name: "Andrés",
    initials: "A",
    company: "Marca",
    email: "a@example.com",
    message: "Hola",
    date: "Hoy",
    channel: "Formulario",
    status: "new",
  },
  {
    id: "2",
    name: "Ana",
    initials: "A",
    company: "Otra",
    email: "b@example.com",
    message: "Hola",
    date: "Ayer",
    channel: "Formulario",
    status: "archived",
  },
];
describe("contact management", () => {
  it("combines status and accent-insensitive search", () => {
    expect(
      filterContacts(records, "andres", "active").map((x) => x.id),
    ).toEqual(["1"]);
    expect(filterContacts(records, "", "archived").map((x) => x.id)).toEqual([
      "2",
    ]);
    expect(filterContacts(records, "", "all")).toHaveLength(2);
  });
  it("exports quoted multiline values and neutralizes spreadsheet formulas", () => {
    const csv = contactsToCsv([
      {
        ...records[0],
        name: '=HYPERLINK("x")',
        message: 'Hola, "Ana"\nOtra línea',
      },
    ]);
    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).toContain('"\'=HYPERLINK(""x"")"');
    expect(csv).toContain('"Hola, ""Ana""\nOtra línea"');
  });
});
