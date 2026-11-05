import type { ProfileDraft } from "../domain/workspace";
export const demoAvatarUrl = "/demo-avatar.jpg";
/** Illustrative fixtures, never actual users, analytics, or contacts. */
export const demoDraft: ProfileDraft = {
  id: "e5b9e38a-32ec-4b81-a674-5ebcbfd5c5db",
  slug: "valentina-mora",
  firstName: "Valentina",
  lastName: "Mora",
  role: "Directora de Alianzas",
  company: "Norte Atelier",
  location: "Ciudad de México, MX",
  bio: "Creo en las conexiones que abren posibilidades. Conecto marcas, ideas y personas para construir alianzas que dejan huella.",
  email: "valentina@example.com",
  phone: "+12025550148",
  whatsapp: "+12025550148",
  linkedin: "https://www.linkedin.com/",
  avatarUrl: "",
  expertise: "Alianzas estratégicas, Brand experience, Networking",
};
export const demoContacts = [
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
  },
  {
    id: "contact-3",
    name: "Diego Salas",
    initials: "DS",
    company: "Distrito Studio",
    email: "diego@example.com",
    message: "Me interesa conocer más sobre las alianzas de Norte Atelier.",
    date: "Ayer, 09:15",
    channel: "Formulario",
  },
] as const;
export const demoMetrics = {
  views: 124,
  contacts: 3,
  linkClicks: 48,
  weeklyViews: [10, 16, 12, 22, 18, 27, 19],
};
