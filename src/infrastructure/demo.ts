import type { ConnectionGateway, ProfileRepository } from "../domain/profile";
export const profileRepository: ProfileRepository = {
  getPublicProfile: () => ({
    id: "valentina-mora",
    name: "Valentina Mora",
    firstName: "Valentina",
    lastName: "Mora",
    role: "Directora de Alianzas",
    company: "Norte Atelier",
    location: "Ciudad de México, MX",
    initials: "VM",
    email: "valentina@example.com",
    phone: "+12025550148",
    demo: true,
    bio: "Creo en las conexiones que abren posibilidades. Conecto marcas, ideas y personas para construir alianzas que dejan huella.",
    expertise: ["Alianzas estratégicas", "Brand experience", "Networking"],
    contacts: [
      {
        kind: "whatsapp",
        label: "WhatsApp",
        href: "https://wa.me/12025550148",
      },
      { kind: "phone", label: "Llamar", href: "tel:+12025550148" },
      { kind: "email", label: "Correo", href: "mailto:valentina@example.com" },
      {
        kind: "linkedin",
        label: "LinkedIn",
        href: "https://www.linkedin.com/",
      },
    ],
  }),
};
export const demoConnectionGateway: ConnectionGateway = {
  async send() {
    return {
      mode: "demo",
      message:
        "Formulario validado. Este perfil es una demostración: tus datos no se han enviado ni guardado.",
    };
  },
};
