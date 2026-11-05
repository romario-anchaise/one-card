import type { ContactLink, ProfessionalProfile } from "../domain/profile";
import type { ProfileDraft } from "../domain/workspace";

export function emptyDraft(): ProfileDraft {
  return {
    id: crypto.randomUUID(),
    slug: "",
    firstName: "",
    lastName: "",
    role: "",
    company: "",
    location: "",
    bio: "",
    email: "",
    phone: "",
    whatsapp: "",
    linkedin: "",
    avatarUrl: "",
    expertise: "",
  };
}

export function createSlug(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60)
    .replace(/-$/, "");
}

export function isHttpsUrl(value: string, hostname?: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      (!hostname ||
        url.hostname === hostname ||
        url.hostname.endsWith(`.${hostname}`))
    );
  } catch {
    return false;
  }
}

export function validateDraft(
  draft: ProfileDraft,
): Partial<Record<keyof ProfileDraft, string>> {
  const errors: Partial<Record<keyof ProfileDraft, string>> = {};
  for (const key of ["firstName", "lastName", "role"] as const)
    if (!draft[key].trim()) errors[key] = "Completa este campo.";
  for (const key of [
    "firstName",
    "lastName",
    "role",
    "company",
    "location",
  ] as const)
    if (draft[key].length > 100) errors[key] = "Máximo 100 caracteres.";
  if (
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(draft.slug) ||
    draft.slug.length < 3 ||
    draft.slug.length > 60
  )
    errors.slug = "Usa entre 3 y 60 letras minúsculas, números o guiones.";
  if (
    draft.email &&
    (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email) ||
      draft.email.length > 254)
  )
    errors.email = "Escribe un correo válido.";
  for (const key of ["phone", "whatsapp"] as const)
    if (draft[key] && !/^\+[1-9]\d{6,14}$/.test(draft[key]))
      errors[key] = "Usa el formato internacional: + y entre 7 y 15 dígitos.";
  if (draft.bio.length > 500) errors.bio = "Máximo 500 caracteres.";
  if (draft.expertise.length > 150) errors.expertise = "Máximo 150 caracteres.";
  if (draft.linkedin && !isHttpsUrl(draft.linkedin, "linkedin.com"))
    errors.linkedin = "Usa un enlace https:// de LinkedIn.";
  if (
    draft.avatarUrl &&
    (!isHttpsUrl(draft.avatarUrl) || draft.avatarUrl.length > 2048)
  )
    errors.avatarUrl = "Usa una URL HTTPS válida (máximo 2048 caracteres).";
  return errors;
}

export function toProfessionalProfile(
  draft: ProfileDraft,
): ProfessionalProfile {
  const contacts: ContactLink[] = [];
  if (/^\+[1-9]\d{6,14}$/.test(draft.whatsapp))
    contacts.push({
      kind: "whatsapp",
      label: "WhatsApp",
      href: `https://wa.me/${draft.whatsapp.slice(1)}`,
    });
  if (/^\+[1-9]\d{6,14}$/.test(draft.phone))
    contacts.push({
      kind: "phone",
      label: "Llamar",
      href: `tel:${draft.phone}`,
    });
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email))
    contacts.push({
      kind: "email",
      label: "Correo",
      href: `mailto:${encodeURIComponent(draft.email)}`,
    });
  if (isHttpsUrl(draft.linkedin, "linkedin.com"))
    contacts.push({
      kind: "linkedin",
      label: "LinkedIn",
      href: draft.linkedin,
    });
  return {
    ...draft,
    name: `${draft.firstName} ${draft.lastName}`.trim(),
    initials:
      `${draft.firstName.charAt(0)}${draft.lastName.charAt(0)}`.toUpperCase(),
    expertise: draft.expertise
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean)
      .slice(0, 5),
    contacts,
    avatarUrl: isHttpsUrl(draft.avatarUrl) ? draft.avatarUrl : undefined,
    demo: false,
  };
}

export function isStoredDraft(value: unknown): value is ProfileDraft {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    [
      "id",
      "slug",
      "firstName",
      "lastName",
      "role",
      "company",
      "location",
      "bio",
      "email",
      "phone",
      "whatsapp",
      "linkedin",
      "avatarUrl",
      "expertise",
    ].every((key) => typeof record[key] === "string") &&
    !Object.keys(validateDraft(value as ProfileDraft)).length
  );
}
