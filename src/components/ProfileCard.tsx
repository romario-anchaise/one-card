import { useState } from "react";
import {
  ArrowUpRight,
  Linkedin,
  Mail,
  MessageCircle,
  Phone,
  QrCode,
  Share2,
  UserRoundPlus,
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
const labels: Record<ContactKind, string> = {
  whatsapp: "WhatsApp",
  phone: "Celular",
  email: "Correo",
  linkedin: "LinkedIn",
};
export function ProfileCard({
  profile,
  gateway,
  onSave,
  onShare,
  onContact,
  onPhysical,
  preview = false,
}: {
  profile: ProfessionalProfile;
  gateway: ConnectionGateway;
  onSave: () => void;
  onShare: () => void;
  onContact: () => void;
  onPhysical: () => void;
  preview?: boolean;
}) {
  const [failedImage, setFailedImage] = useState<string | null>(null);
  return (
    <article
      className={`profile-card reference-profile finish-${profile.appearance ?? "matte"}`}
      aria-label={`Tarjeta profesional de ${profile.name}`}
    >
      <div className="profile-utility-row">
        <span className="eyebrow">ONE CARD</span>
        <div className="profile-tools">
          <button
            className="icon-button"
            onClick={onShare}
            aria-label="Mostrar QR del perfil"
          >
            <QrCode size={16} />
          </button>
          <button
            className="icon-button"
            onClick={onShare}
            aria-label="Compartir perfil"
          >
            <Share2 size={15} />
          </button>
        </div>
      </div>
      <div className="profile-content">
        <div className="reference-identity">
          <div className="avatar" aria-label={`Avatar de ${profile.name}`}>
            <span>{profile.initials}</span>
            {profile.avatarUrl && failedImage !== profile.avatarUrl && (
              <img
                src={profile.avatarUrl}
                alt=""
                referrerPolicy="no-referrer"
                onError={() => setFailedImage(profile.avatarUrl ?? null)}
              />
            )}
          </div>
          <h1>{profile.name}</h1>
          {profile.role && <p className="role">{profile.role}</p>}
          <p className="reference-location">
            {[profile.company, profile.location].filter(Boolean).join(" · ")}
          </p>
          <div className="reference-badges">
            {profile.demo && <span>PERFIL DE EJEMPLO</span>}
            <button onClick={onShare}>NFC + QR</button>
          </div>
        </div>
        <div className="contact-links">
          {profile.contacts.map((contact) => {
            const Icon = icons[contact.kind];
            return (
              <a
                key={contact.kind}
                href={contact.href}
                onClick={
                  profile.demo
                    ? (event) => {
                        event.preventDefault();
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
                {labels[contact.kind]}
              </a>
            );
          })}
        </div>
        <button className="primary-button save-button" onClick={onSave}>
          <UserRoundPlus size={16} />
          Guardar en Contactos (vCard)
        </button>
        {!!profile.links?.length && (
          <div className="profile-resource-links">
            {profile.links.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.label}
                <ArrowUpRight size={14} />
              </a>
            ))}
          </div>
        )}
        {preview ? (
          <p className="preview-contact-note">
            El formulario de contacto estará disponible en tu tarjeta publicada.
          </p>
        ) : (
          <div className="reference-connect">
            <ConnectionForm
              gateway={gateway}
              profileId={profile.id}
              recipientName={profile.firstName}
              demo={profile.demo}
              compact
            />
          </div>
        )}
        {(profile.bio || profile.expertise.length > 0) && (
          <details className="profile-about">
            <summary>
              Más sobre {profile.firstName}
              <ArrowUpRight size={13} />
            </summary>
            {profile.bio && <p>{profile.bio}</p>}
            <div className="expertise">
              {profile.expertise.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </details>
        )}
        <button className="physical-preview-link" onClick={onPhysical}>
          Ver tarjeta física
          <ArrowUpRight size={13} />
        </button>
        <div className="card-footer">
          <span>Tu identidad. En un solo toque.</span>
          <span className="small-wordmark">R&A · ONE CARD</span>
        </div>
      </div>
    </article>
  );
}
