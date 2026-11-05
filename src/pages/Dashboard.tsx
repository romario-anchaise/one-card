import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Archive,
  ArrowUpRight,
  CheckCircle2,
  Download,
  Eye,
  FileText,
  LayoutDashboard,
  Mail,
  RotateCcw,
  Search,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { AppHeader } from "../components/AppHeader";
import { Modal } from "../components/Modal";
import type { LeadRecord, LeadStatus } from "../domain/contact";
import type { ProfileDraft } from "../domain/workspace";
import {
  contactsToCsv,
  filterContacts,
  type ContactFilter,
} from "../application/contact-services";
import { downloadFile } from "../infrastructure/browser";
import { demoMetrics } from "../infrastructure/demo-data";
const statusLabel: Record<LeadStatus, string> = {
  new: "Nuevo",
  contacted: "Atendido",
  archived: "Archivado",
};
export function Dashboard({
  contactsOnly = false,
  records,
  onStatusChange,
  profile,
}: {
  contactsOnly?: boolean;
  records: LeadRecord[];
  onStatusChange: (id: string, status: LeadStatus) => void;
  profile: ProfileDraft;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ContactFilter>("active");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const selected = records.find((record) => record.id === selectedId) ?? null;
  const contacts = filterContacts(records, query, filter);
  function exportCsv() {
    downloadFile(
      contactsToCsv(contacts),
      "one-card-contactos.csv",
      "text/csv;charset=utf-8",
    );
    setNotice(
      `CSV generado: ${contacts.length} contacto${contacts.length === 1 ? "" : "s"}.`,
    );
  }
  return (
    <div className="workspace-shell minimal-workspace">
      <AppHeader className="workspace-header">
        <span className="demo-pill">DEMO</span>
      </AppHeader>
      <div className="workspace-layout">
        <aside className="workspace-sidebar">
          <Link
            className={`workspace-nav ${contactsOnly ? "" : "active"}`}
            to="/panel"
          >
            <LayoutDashboard size={17} />
            Resumen
          </Link>
          <Link className="workspace-nav" to="/demo/editar">
            <FileText size={17} />
            Mi tarjeta
          </Link>
          <Link
            className={`workspace-nav ${contactsOnly ? "active" : ""}`}
            to="/contactos"
          >
            <Users size={17} />
            Contactos
          </Link>
          <Link className="workspace-nav" to={`/p/${profile.slug}`}>
            <Eye size={17} />
            Ver tarjeta
          </Link>
          <Link className="workspace-nav" to="/acceso">
            <ShieldCheck size={17} />
            Acceso
          </Link>
        </aside>
        <main className="dashboard-main">
          <div className="dashboard-heading">
            <h1>{contactsOnly ? "Contactos" : "Resumen"}</h1>
            <Link className="secondary-button" to="/demo/editar">
              Editar tarjeta
              <ArrowUpRight size={14} />
            </Link>
          </div>
          <p className="minimal-demo-note">
            Demo: datos de ejemplo. Los cambios duran esta sesión.
          </p>
          {!contactsOnly && (
            <div className="metric-grid">
              {[
                { label: "Vistas", value: demoMetrics.views },
                {
                  label: "Contactos nuevos",
                  value: records.filter((r) => r.status === "new").length,
                },
                { label: "Clics", value: demoMetrics.linkClicks },
              ].map((metric) => (
                <article className="metric-card" key={metric.label}>
                  <div>{metric.label}</div>
                  <strong>{metric.value}</strong>
                </article>
              ))}
            </div>
          )}
          <section className="contacts-panel">
            <div className="contacts-heading">
              <h2>{contactsOnly ? "Recibidos" : "Contactos"}</h2>
              <label className="contact-search">
                <Search size={15} />
                <span className="sr-only">Buscar contactos</span>
                <input
                  aria-label="Buscar contactos"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar…"
                />
                {query && (
                  <button
                    aria-label="Limpiar búsqueda"
                    onClick={() => setQuery("")}
                  >
                    <X size={13} />
                  </button>
                )}
              </label>
            </div>
            <div className="contact-management">
              <label>
                Estado
                <select
                  value={filter}
                  onChange={(e) => {
                    setFilter(e.target.value as ContactFilter);
                    setNotice("");
                  }}
                >
                  <option value="active">Activos</option>
                  <option value="new">Nuevos</option>
                  <option value="contacted">Atendidos</option>
                  <option value="archived">Archivados</option>
                  <option value="all">Todos</option>
                </select>
              </label>
              <span>
                {contacts.length} resultado{contacts.length === 1 ? "" : "s"}
              </span>
              <button
                className="secondary-button"
                disabled={!contacts.length}
                onClick={exportCsv}
              >
                <Download size={14} />
                Exportar CSV
              </button>
            </div>
            {notice && (
              <p className="inline-feedback" role="status">
                {notice}
              </p>
            )}
            <div className="contact-table">
              {contacts.length ? (
                contacts.map((contact) => (
                  <button
                    className="contact-row"
                    key={contact.id}
                    onClick={() => setSelectedId(contact.id)}
                  >
                    <span className="contact-person">
                      <span className="contact-avatar">{contact.initials}</span>
                      <span>
                        <strong>{contact.name}</strong>
                        {contact.company && <small>{contact.company}</small>}
                      </span>
                    </span>
                    <span className="contact-email">{contact.email}</span>
                    <span className={`lead-status ${contact.status}`}>
                      {statusLabel[contact.status]}
                    </span>
                    <ArrowUpRight size={15} />
                  </button>
                ))
              ) : (
                <div className="contacts-empty">
                  <Search size={22} />
                  <h3>Sin resultados</h3>
                  <button
                    className="text-button"
                    onClick={() => {
                      setQuery("");
                      setFilter("all");
                    }}
                  >
                    Ver todos
                  </button>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
      {selected && (
        <Modal title="Contacto" onClose={() => setSelectedId(null)}>
          <div className="contact-detail">
            <h3>{selected.name}</h3>
            {selected.company && <span>{selected.company}</span>}
            <p>{selected.message || "Sin mensaje."}</p>
            <div>
              <Mail size={15} />
              {selected.email}
            </div>
            <span className={`lead-status ${selected.status}`} role="status">
              {statusLabel[selected.status]}
            </span>
            <div className="lead-detail-actions">
              <button
                className="primary-button"
                onClick={() =>
                  onStatusChange(
                    selected.id,
                    selected.status === "contacted" ? "new" : "contacted",
                  )
                }
              >
                <CheckCircle2 size={15} />
                {selected.status === "contacted"
                  ? "Marcar nuevo"
                  : "Marcar atendido"}
              </button>
              <button
                className="secondary-button"
                onClick={() =>
                  onStatusChange(
                    selected.id,
                    selected.status === "archived" ? "new" : "archived",
                  )
                }
              >
                {selected.status === "archived" ? (
                  <RotateCcw size={15} />
                ) : (
                  <Archive size={15} />
                )}
                {selected.status === "archived" ? "Restaurar" : "Archivar"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
