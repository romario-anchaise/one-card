import type { LeadRecord, LeadStatus } from "../domain/contact";
export type ContactFilter = LeadStatus | "active" | "all";
export function filterContacts(
  records: readonly LeadRecord[],
  query: string,
  status: ContactFilter,
): LeadRecord[] {
  const needle = query
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  return records.filter(
    (record) =>
      (status === "all" ||
        (status === "active"
          ? record.status !== "archived"
          : record.status === status)) &&
      `${record.name} ${record.company} ${record.email}`
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .includes(needle),
  );
}
function csvCell(value: string) {
  const safe = /^[\s]*[=+@-]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}
export function contactsToCsv(records: readonly LeadRecord[]): string {
  return (
    "\uFEFF" +
    [
      ["Nombre", "Empresa", "Correo", "Mensaje", "Fecha", "Estado"],
      ...records.map((r) => [
        r.name,
        r.company,
        r.email,
        r.message,
        r.date,
        r.status,
      ]),
    ]
      .map((row) => row.map(csvCell).join(","))
      .join("\r\n")
  );
}
