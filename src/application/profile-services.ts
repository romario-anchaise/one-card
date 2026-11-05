import type {
  ConnectionGateway,
  ConnectionRequest,
  ProfessionalProfile,
} from "../domain/profile";
const escapeVCard = (value: string) =>
  value
    .replace(/\\/g, "\\\\")
    .replace(/\r\n|\r|\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
export function createVCard(profile: ProfessionalProfile): string {
  const e = escapeVCard;
  return [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${e(profile.lastName)};${e(profile.firstName)};;;`,
    `FN:${e(profile.name)}`,
    `ORG:${e(profile.company)}`,
    `TITLE:${e(profile.role)}`,
    `TEL;TYPE=CELL:${e(profile.phone)}`,
    `EMAIL:${e(profile.email)}`,
    "END:VCARD",
    "",
  ].join("\r\n");
}
export function validateConnection(
  request: ConnectionRequest,
): Partial<Record<keyof ConnectionRequest, string>> {
  const errors: Partial<Record<keyof ConnectionRequest, string>> = {};
  if (request.name.trim().length < 2)
    errors.name = "Escribe tu nombre (mínimo 2 caracteres).";
  if (request.name.length > 100)
    errors.name = "Usa un máximo de 100 caracteres.";
  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(request.email) ||
    request.email.length > 254
  )
    errors.email = "Escribe un correo válido.";
  if (request.message.length > 500)
    errors.message = "Usa un máximo de 500 caracteres.";
  if (!request.consent)
    errors.consent = "Autoriza el uso de tus datos para responderte.";
  return errors;
}
export async function connect(
  gateway: ConnectionGateway,
  profileId: string,
  request: ConnectionRequest,
) {
  if (Object.keys(validateConnection(request)).length)
    throw new Error("Revisa los campos del formulario.");
  return gateway.send(profileId, {
    ...request,
    name: request.name.trim(),
    email: request.email.trim(),
  });
}
