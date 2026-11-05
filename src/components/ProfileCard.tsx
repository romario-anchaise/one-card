import {
  ArrowDownToLine,
  ArrowUpRight,
  BriefcaseBusiness,
  Linkedin,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  QrCode,
  Share2,
  Radio,
} from "lucide-react";
import type {
  ConnectionGateway,
  ContactKind,
  ProfessionalProfile,
} from "../domain/profile";
import { ConnectionForm } from "./ConnectionForm";
const icons: Record<ContactKind, typeof Mail> = {
  whatsapp: MessageCircle,
  phone: Phone,
  email: Mail,
  linkedin: Linkedin,
};
export function ProfileCard({
  profile,
  gateway,
  onSave,
  onShare,
  onContact,
}: {
  profile: ProfessionalProfile;
  gateway: ConnectionGateway;
  onSave: () => void;
  onShare: () => void;
  onContact: () => void;
}) {
  return (
    <article
      className="profile-card"
      aria-label={`Tarjeta profesional de ${profile.name}`}
    >
      <div className="card-cover">
        <div className="cover-grain" />
        <span className="atelier-logo">
          norte<span>ATELIER</span>
        </span>
        <span className="cover-mark">N</span>
        <span className="cover-tag">PEOPLE. IDEAS. POSSIBILITIES.</span>
      </div>
      <div className="profile-content">
        <div className="profile-topline">
          <div className="avatar" aria-label={`Avatar de ${profile.name}`}>
            {profile.initials}
            <span className="availability" title="Perfil de demostración" />
          </div>
          <div className="profile-tools">
            <button
              className="icon-button"
              onClick={onShare}
              aria-label="Mostrar QR del perfil"
            >
              <QrCode size={18} />
            </button>
            <button
              className="icon-button"
              onClick={onShare}
              aria-label="Compartir perfil"
            >
              <Share2 size={17} />
            </button>
          </div>
        </div>
        <div className="profile-identity">
          <span className="eyebrow identity-label">
            UN GUSTO CONOCERTE, SOY
          </span>
          <h1>
            {profile.name}
            <span className="name-dot">.</span>
          </h1>
          <p className="role">{profile.role}</p>
          <div className="profile-meta">
            <span>
              <BriefcaseBusiness size={13} />
              {profile.company}
            </span>
            <span className="meta-divider" />
            <span>
              <MapPin size={13} />
              {profile.location}
            </span>
          </div>
        </div>
        <p className="bio">{profile.bio}</p>
        <div className="expertise">
          {profile.expertise.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <button className="primary-button save-button" onClick={onSave}>
          <ArrowDownToLine size={17} />
          Guardar en contactos
          <ArrowUpRight size={17} />
        </button>
        <div className="contact-links">
          {profile.contacts.map((contact) => {
            const Icon = icons[contact.kind];
            return (
              <a
                key={contact.kind}
                href={contact.href}
                onClick={
                  profile.demo
                    ? (e) => {
                        e.preventDefault();
                        onContact();
                      }
                    : undefined
                }
                target={
                  contact.href.startsWith("https:") ? "_blank" : undefined
                }
                rel="noopener noreferrer"
              >
                <span className={`contact-icon ${contact.kind}`}>
                  <Icon size={19} />
                </span>
                {contact.label}
              </a>
            );
          })}
        </div>
        <div className="section-divider">
          <span />
          <Radio size={15} />
          <span />
        </div>
        <ConnectionForm gateway={gateway} profileId={profile.id} />
        <div className="card-footer">
          <span>Una conexión. Infinitas posibilidades.</span>
          <span className="small-wordmark">
            ONE CARD
            <ArrowUpRight size={11} />
          </span>
        </div>
      </div>
    </article>
  );
}
