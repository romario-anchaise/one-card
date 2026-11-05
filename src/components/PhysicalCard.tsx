import type { ProfessionalProfile } from "../domain/profile";
export function PhysicalCard({ profile }: { profile: ProfessionalProfile }) {
  return (
    <div
      className="reference-physical-card"
      aria-label={`Diseño de tarjeta física de ${profile.name}`}
    >
      <div className="physical-brand">
        ONE CARD<span>R&A</span>
        <i />
      </div>
      <div className="physical-owner">
        <strong>{profile.name}</strong>
        <span>{profile.role}</span>
        <small>{profile.company}</small>
      </div>
      <span className="physical-gold-chip" aria-hidden="true" />
    </div>
  );
}
