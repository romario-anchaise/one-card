import { useState, useRef } from "react";
import {
  ArrowUpRight,
  ArrowDown,
  Check,
  Copy,
  CreditCard,
  Fingerprint,
  Globe2,
  MoveUpRight,
  Radio,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import type { ConnectionGateway, ProfessionalProfile } from "./domain/profile";
import { createVCard } from "./application/profile-services";
import { downloadFile } from "./infrastructure/browser";
import { ProfileCard } from "./components/ProfileCard";
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
  const [modal, setModal] = useState<"share" | "about" | null>(null);
  const [notice, setNotice] = useState("");
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);
  const shareUrl = `${window.location.origin}${window.location.pathname}#/p/${encodeURIComponent(profile.slug ?? profile.id)}`;
  function saveContact() {
    downloadFile(
      createVCard(profile),
      `${profile.id}.vcf`,
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
      setNotice(
        "No se pudo copiar automáticamente. Puedes seleccionar el enlace del perfil.",
      );
    }
  }
  function downloadQr() {
    const svg = qrRef.current?.querySelector("svg");
    if (svg)
      downloadFile(
        new XMLSerializer().serializeToString(svg),
        "one-card-qr.svg",
        "image/svg+xml",
      );
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
        Ir a la tarjeta
      </a>
      <div className="page-shell">
        <header className="site-header">
          <a className="brand" href="#/" aria-label="ONE CARD, inicio">
            <span className="brand-icon">
              <CreditCard size={20} />
            </span>
            ONE CARD<span className="brand-by">by R&A</span>
          </a>
          <div className="header-right">
            <span className="demo-badge">
              <span />
              {preview
                ? "VISTA PREVIA"
                : profile.demo
                  ? "PERFIL DEMO"
                  : "PERFIL PROFESIONAL"}
            </span>
            <button className="header-link" onClick={() => setModal("about")}>
              Conoce ONE CARD
              <ArrowUpRight size={14} />
            </button>
          </div>
        </header>
        <main className="main-layout">
          <aside className="intro">
            <div className="intro-content">
              <span className="eyebrow intro-eyebrow">
                <span className="gold-line" />
                MENOS PAPEL. MÁS CONEXIONES.
              </span>
              <h2>
                El inicio de
                <br />
                algo <span>extraordinario.</span>
              </h2>
              <p className="intro-description">
                Hay personas que conoces.
                <br />Y conexiones que lo cambian todo.
              </p>
              <p className="intro-detail">
                Una tarjeta. Todo lo que necesitas para
                <br className="desktop-break" /> dar el siguiente paso, en un
                solo lugar.
              </p>
              <button
                className="intro-cta"
                onClick={() =>
                  document.getElementById("perfil")?.scrollIntoView()
                }
              >
                Conoce a {profile.firstName}{" "}
                <span>
                  <ArrowDown size={16} />
                </span>
              </button>
              <div className="physical-scene" aria-hidden="true">
                <div className="physical-shadow" />
                <div className="physical-card">
                  <div className="physical-top">
                    <span>ONE CARD</span>
                    <Radio size={22} />
                  </div>
                  <div className="chip">
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className="physical-name">
                    {profile.name}
                    <span>{profile.company}</span>
                  </div>
                  <div className="physical-bottom">
                    <span>YOUR NEXT CONNECTION.</span>
                    <MoveUpRight size={16} />
                  </div>
                </div>
                <div className="scene-caption">
                  <span />
                  DISEÑADA PARA DEJAR HUELLA
                </div>
              </div>
              <div className="intro-benefits">
                <span>
                  <Fingerprint size={16} />
                  Un toque, una conexión
                </span>
                <span>
                  <Globe2 size={16} />
                  Sin apps. Sin límites.
                </span>
              </div>
            </div>
            <div className="intro-footnote">
              <ShieldCheck size={14} />
              <span>Tu identidad, siempre contigo.</span>
            </div>
          </aside>
          <section id="perfil" className="profile-column" tabIndex={-1}>
            <div className="profile-caption">
              <span>
                <span className="status-dot" />
                TARJETA DIGITAL
              </span>
              <span>
                NFC + QR
                <Radio size={12} />
              </span>
            </div>
            <ProfileCard
              profile={profile}
              gateway={connectionGateway}
              preview={preview}
              onSave={saveContact}
              onShare={() => {
                if (preview) {
                  setNotice(
                    "Esta es una vista previa. Publica tu tarjeta en la nube para compartirla.",
                  );
                  return;
                }
                setCopied(false);
                setModal("share");
              }}
              onContact={() =>
                setNotice(
                  "Este perfil es una demostración. Los canales de contacto se activarán con los datos reales del profesional.",
                )
              }
            />
            <p className="powered-by">
              HECHO PARA CONECTAR <span>·</span> POWERED BY{" "}
              <strong>R&A SOLUTIONS</strong>
            </p>
          </section>
        </main>
        <footer className="site-footer">
          <span>© {new Date().getFullYear()} R&A Solutions</span>
          <span>
            Diseñamos conexiones que importan.
            <Sparkles size={12} />
          </span>
          <button onClick={() => setModal("about")}>
            Sobre esta experiencia
            <ArrowUpRight size={12} />
          </button>
        </footer>
      </div>
      {notice && (
        <div className="toast" role="status">
          <Check size={18} />
          <span>{notice}</span>
          <button
            className="icon-button"
            onClick={() => setNotice("")}
            aria-label="Cerrar aviso"
          >
            <X size={17} />
          </button>
        </div>
      )}
      {modal === "share" && (
        <Modal title="Una conexión empieza aquí" onClose={() => setModal(null)}>
          <p className="modal-description">
            Escanea el QR para abrir esta tarjeta o comparte su enlace.
          </p>
          <div ref={qrRef} className="qr-frame">
            <QRCodeSVG value={shareUrl} size={190} level="M" marginSize={2} />
          </div>
          <p className="share-name">
            {profile.name}
            <span>{profile.role}</span>
          </p>
          <label className="field share-url">
            Enlace del perfil
            <input
              readOnly
              value={shareUrl}
              onFocus={(e) => e.target.select()}
            />
          </label>
          <div className="modal-actions">
            <button className="primary-button" onClick={copyLink}>
              {copied ? <Check size={16} /> : <Copy size={16} />}{" "}
              {copied ? "Enlace copiado" : "Copiar enlace"}
            </button>
            <button className="secondary-button" onClick={downloadQr}>
              Descargar QR
            </button>
          </div>
        </Modal>
      )}
      {modal === "about" && (
        <Modal
          title="Tu identidad, en un solo toque"
          onClose={() => setModal(null)}
        >
          <p className="modal-description">
            ONE CARD es una experiencia de tarjeta profesional digital inspirada
            en R&A Solutions.
          </p>
          <div className="about-list">
            <p>
              <CreditCard />
              Comparte tu perfil con un enlace, un QR o una tarjeta NFC.
            </p>
            <p>
              <Globe2 />
              Tu visitante puede abrirlo en su navegador, sin instalar
              aplicaciones.
            </p>
            <p>
              <ShieldCheck />
              Comparte solo los datos que quieras hacer públicos. Los borradores
              guardados en este dispositivo no son perfiles publicados.
            </p>
          </div>
          <button className="primary-button" onClick={() => setModal(null)}>
            Explorar tarjeta
            <ArrowUpRight size={16} />
          </button>
        </Modal>
      )}
    </>
  );
}
