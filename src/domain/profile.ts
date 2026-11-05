export type ContactKind = "whatsapp" | "phone" | "email" | "linkedin";
export type CardAppearance = "matte" | "bamboo" | "steel";
export interface ProfileLink {
  id: string;
  label: string;
  url: string;
}
export interface ContactLink {
  kind: ContactKind;
  label: string;
  href: string;
}
export interface ProfessionalProfile {
  id: string;
  slug?: string;
  name: string;
  firstName: string;
  lastName: string;
  role: string;
  company: string;
  location: string;
  initials: string;
  avatarUrl?: string;
  email: string;
  phone: string;
  bio: string;
  expertise: readonly string[];
  contacts: readonly ContactLink[];
  demo: boolean;
  appearance?: CardAppearance;
  links?: readonly ProfileLink[];
}
export interface ConnectionRequest {
  name: string;
  email: string;
  message: string;
  consent: boolean;
}
export interface ConnectionReceipt {
  mode: "demo" | "sent";
  message: string;
}
export interface ConnectionGateway {
  send(
    profileId: string,
    request: ConnectionRequest,
  ): Promise<ConnectionReceipt>;
}
