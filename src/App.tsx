import { useRef, useState } from "react";
import { ArrowUpRight, Check, Copy, Share2, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import type { ConnectionGateway, ProfessionalProfile } from "./domain/profile";
import { createVCard } from "./application/profile-services";
import { downloadFile } from "./infrastructure/browser";
import { downloadQrPng } from "./infrastructure/qr-download";
import { ProfileCard } from "./components/ProfileCard";
import { PhysicalCard } from "./components/PhysicalCard";
import { Brand } from "./components/Brand";
import { Modal } from "./components/Modal";
export function App({
  profile,
  connectionGateway,
  preview = false,
}: {
  profile: ProfessionalProfile;
  connectionGateway: ConnectionGateway;
  preview?: boolean;
}) {
  const [modal, setModal] = useState<"share" | "physical" | null>(null);
  const [notice, setNotice] = useState("");
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);
  const shareUrl = `${window.location.origin}${window.location.pathname}#/p/${encodeURIComponent(profile.slug ?? profile.id)}`;
  function share() {
    if (preview) {
      setNotice("Este borrador todavía no tiene un enlace público.");
      return;
    }
    setCopied(false);
    setModal("share");
  }
  function saveContact() {
    downloadFile(
      createVCard(profile),
      `${profile.slug ?? profile.id}.vcf`,
      "text/vcard;charset=utf-8",
    );
    setNotice(
      profile.demo ? "Contacto de ejemplo descargado." : "Contacto descargado.",
    );
  }
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
    } catch {
      setNotice("Selecciona y copia el enlace del perfil.");
    }
  }
  async function nativeShare() {
    try {
      if (navigator.share)
        await navigator.share({
          title: `${profile.name} · ONE CARD`,
          url: shareUrl,
        });
      else await copyLink();
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError"))
        setNotice("No se pudo compartir. Puedes copiar el enlace.");
    }
  }
  async function downloadQr(format: "svg" | "png") {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;
    try {
      if (format === "png") await downloadQrPng(svg);
      else
        downloadFile(
          new XMLSerializer().serializeToString(svg),
          "one-card-qr.svg",
          "image/svg+xml",
        );
      setNotice(`QR ${format.toUpperCase()} generado.`);
    } catch {
      setNotice("No pudimos generar el QR. Intenta con el otro formato.");
    }
  }
  return (
    <>
      <a
        className="skip-link"
        href="#perfil"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("perfil")?.focus();
          document.getElementById("perfil")?.scrollIntoView();
        }}
      >
        Ir al perfil
      </a>
      <div className="page-shell reference-theme minimal-public">
        <header className="minimal-header">
          <Brand />
        </header>
        <main className="minimal-profile-layout">
          <aside className="physical-showcase">
            <PhysicalCard profile={profile} />
            <span>ONE CARD · NFC + QR</span>
          </aside>
          <section id="perfil" className="profile-column" tabIndex={-1}>
            <ProfileCard
              profile={profile}
              gateway={connectionGateway}
              preview={preview}
              onSave={saveContact}
              onShare={share}
              onPhysical={() => setModal("physical")}
            />
          </section>
        </main>
      </div>
      {notice && (
        <div className="toast" role="status">
          <Check size={17} />
          <span>{notice}</span>
          <button
            className="icon-button"
            aria-label="Cerrar aviso"
            onClick={() => setNotice("")}
          >
            <X size={16} />
          </button>
        </div>
      )}
      {modal === "share" && (
        <Modal title="Compartir tarjeta" onClose={() => setModal(null)}>
          <div ref={qrRef} className="qr-frame">
            <QRCodeSVG value={shareUrl} size={190} level="M" marginSize={2} />
          </div>
          <label className="field share-url">
            Enlace
            <input
              readOnly
              value={shareUrl}
              onFocus={(e) => e.target.select()}
            />
          </label>
          <div className="modal-actions">
            <button className="primary-button" onClick={copyLink}>
              {copied ? <Check size={15} /> : <Copy size={15} />}{" "}
              {copied ? "Copiado" : "Copiar enlace"}
            </button>
            <button
              className="secondary-button"
              onClick={() => downloadQr("png")}
            >
              QR PNG
            </button>
            <button
              className="secondary-button"
              onClick={() => downloadQr("svg")}
            >
              QR SVG
            </button>
          </div>
          <button
            className="text-button native-share-button"
            onClick={nativeShare}
          >
            <Share2 size={14} />
            Compartir desde el dispositivo
          </button>
        </Modal>
      )}
      {modal === "physical" && (
        <Modal title="Tarjeta física" onClose={() => setModal(null)}>
          <PhysicalCard profile={profile} />
        </Modal>
      )}
    </>
  );
}
