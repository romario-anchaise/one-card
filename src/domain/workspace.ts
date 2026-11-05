import type {
  ProfessionalProfile,
  CardAppearance,
  ProfileLink,
} from "./profile";

export interface ProfileDraft {
  id: string;
  slug: string;
  firstName: string;
  lastName: string;
  role: string;
  company: string;
  location: string;
  bio: string;
  email: string;
  phone: string;
  whatsapp: string;
  linkedin: string;
  avatarUrl: string;
  expertise: string;
  appearance?: CardAppearance;
  links?: ProfileLink[];
}
export type ProfileTextField = Exclude<keyof ProfileDraft, "links">;

export interface StoredProfile {
  draft: ProfileDraft;
  published: boolean;
  updatedAt: string;
}

export interface ProfileStore {
  readonly mode: "device" | "cloud" | "demo";
  load(): Promise<StoredProfile | null>;
  save(draft: ProfileDraft): Promise<StoredProfile>;
  publish(draft: ProfileDraft): Promise<StoredProfile>;
  unpublish(): Promise<StoredProfile>;
  getPublished(slug: string): Promise<ProfessionalProfile | null>;
}

export interface Account {
  id: string;
  email: string;
}
export interface AuthGateway {
  getAccount(): Promise<Account | null>;
  subscribe(callback: (account: Account | null) => void): () => void;
  signIn(email: string, password: string): Promise<void>;
  signUp(email: string, password: string): Promise<boolean>;
  signInWithGoogle(): Promise<void>;
  signOut(): Promise<void>;
  requestPasswordReset(email: string): Promise<void>;
  updatePassword(password: string): Promise<void>;
}
