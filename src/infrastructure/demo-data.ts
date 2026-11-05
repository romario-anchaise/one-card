import type { ProfileDraft } from "../domain/workspace";
import type { LeadRecord } from "../domain/contact";
/** Example card shown without a registered account. */
export const demoDraft: ProfileDraft = {
  id: "e5b9e38a-32ec-4b81-a674-5ebcbfd5c5db",
  slug: "romario-anchaise",
  firstName: "Romario",
  lastName: "Anchaise",
  role: "Profesional",
  company: "",
  location: "Arequipa, Perú",
  bio: "",
  email: "",
  phone: "",
  whatsapp: "",
  linkedin: "",
  avatarUrl: "",
  expertise: "",
};
export const demoContacts: LeadRecord[] = [
  {
    id: "contact-1",
    name: "Andrés Rivera",
    initials: "AR",
    company: "Estudio Forma",
    email: "andres@example.com",
    message:
      "Me gustaría conversar sobre una colaboración para nuestro próximo proyecto.",
    date: "Hoy, 10:42",
    channel: "Formulario",
    status: "new",
  },
  {
    id: "contact-2",
    name: "Camila Torres",
    initials: "CT",
    company: "Nodo Creativo",
    email: "camila@example.com",
    message:
      "Un gusto conocerte. Sigamos en contacto para futuras oportunidades.",
    date: "Ayer, 16:20",
    channel: "Formulario",
    status: "new",
  },
  {
    id: "contact-3",
    name: "Diego Salas",
    initials: "DS",
    company: "Distrito Studio",
    email: "diego@example.com",
    message: "Me interesa conversar sobre una posible alianza.",
    date: "Ayer, 09:15",
    channel: "Formulario",
    status: "new",
  },
];
export const demoMetrics = {
  views: 124,
  contacts: 3,
  linkClicks: 48,
  weeklyViews: [10, 16, 12, 22, 18, 27, 19],
};
