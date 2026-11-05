import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  CreditCard,
  Eye,
  FileText,
  LayoutDashboard,
  Link2,
  Mail,
  Search,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { Brand } from "../components/Brand";
import { Modal } from "../components/Modal";
import {
  demoContacts,
  demoDraft,
  demoMetrics,
} from "../infrastructure/demo-data";

export function Dashboard({
  contactsOnly = false,
}: {
  contactsOnly?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<
    (typeof demoContacts)[number] | null
  >(null);
  const contacts = demoContacts.filter((contact) =>
    `${contact.name} ${contact.company} ${contact.email}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <div className="workspace-shell">
      <header className="workspace-header">
        <Brand />
        <div className="dashboard-account">
          <span className="demo-pill">DEMO</span>
          <span className="mini-avatar">VM</span>
          <div>
            <strong>
              {demoDraft.firstName} {demoDraft.lastName}
            </strong>
            <span>Tu espacio profesional</span>
          </div>
        </div>
      </header>
      <div className="workspace-layout">
        <aside className="workspace-sidebar">
          <span className="eyebrow">MI ESPACIO</span>
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
            Contactos<span className="nav-count">3</span>
          </Link>
          <Link className="workspace-nav" to="/p/valentina-mora">
            <Eye size={17} />
            Ver tarjeta
          </Link>
          <Link className="workspace-nav" to="/acceso">
            <ShieldCheck size={17} />
            Acceso
          </Link>
          <div className="sidebar-note">
            <ShieldCheck size={18} />
            <p>
              Una vista de tu próxima gran conexión. Los perfiles, contactos y
              métricas de esta demo son ficticios.
            </p>
          </div>
        </aside>
        <main className="dashboard-main reveal">
          <div className="dashboard-heading">
            <div>
              <span className="eyebrow">
                {contactsOnly ? "TU RED, MÁS CERCA" : "CADA CONEXIÓN CUENTA"}
              </span>
              <h1>
                {contactsOnly ? (
                  "Personas con posibilidades."
                ) : (
                  <>
                    Hola, {demoDraft.firstName}
                    <span>.</span>
                  </>
                )}
              </h1>
              <p>
                {contactsOnly
                  ? "Una conversación puede ser el comienzo de algo extraordinario."
                  : "Tu próxima oportunidad puede estar a un solo toque."}
              </p>
            </div>
            <Link className="secondary-button" to="/demo/editar">
              Editar mi tarjeta
              <ArrowUpRight size={15} />
            </Link>
          </div>
          <div className="demo-panel-banner">
            <ShieldCheck size={16} />
            <span>
              Vista de ejemplo. Las métricas y los contactos muestran cómo se
              verá tu panel.
            </span>
          </div>
          {!contactsOnly && (
            <>
              <div className="metric-grid">
                {[
                  {
                    label: "Vistas del perfil",
                    value: demoMetrics.views,
                    icon: Eye,
                    note: "Descubrieron tu historia",
                  },
                  {
                    label: "Nuevos contactos",
                    value: demoMetrics.contacts,
                    icon: Users,
                    note: "Nuevas conversaciones",
                  },
                  {
                    label: "Clics en enlaces",
                    value: demoMetrics.linkClicks,
                    icon: Link2,
                    note: "Interés que se convierte en acción",
                  },
                ].map(({ label, value, icon: Icon, note }) => (
                  <article className="metric-card" key={label}>
                    <div>
                      <span>{label}</span>
                      <Icon size={17} />
                    </div>
                    <strong>{value}</strong>
                    <p>{note}</p>
                    <span className="metric-example">DATOS DE EJEMPLO</span>
                  </article>
                ))}
              </div>
              <div className="dashboard-middle">
                <section className="activity-panel">
                  <div className="panel-heading">
                    <div>
                      <span className="eyebrow">PRESENCIA QUE CRECE</span>
                      <h2>Tu semana en conexiones</h2>
                    </div>
                    <span className="week-label">Semana de ejemplo</span>
                  </div>
                  <div
                    className="week-chart"
                    role="img"
                    aria-label="Gráfica ilustrativa: lunes 10, martes 16, miércoles 12, jueves 22, viernes 18, sábado 27, domingo 19 vistas"
                  >
                    <div className="chart-guide">
                      <span>30</span>
                      <span>15</span>
                      <span>0</span>
                    </div>
                    <div className="chart-bars">
                      {demoMetrics.weeklyViews.map((value, index) => (
                        <div className="chart-column" key={index}>
                          <div className="chart-bar-area">
                            <div
                              className={`chart-bar ${index === 5 ? "highlight" : ""}`}
                              style={{
                                height: `${(value / 30) * 100}%`,
                                animationDelay: `${index * 70}ms`,
                              }}
                            >
                              <span>{value}</span>
                            </div>
                          </div>
                          <span>
                            {
                              ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"][
                                index
                              ]
                            }
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
                <section className="card-shortcut">
                  <span className="eyebrow">TU MEJOR PRESENTACIÓN</span>
                  <div className="mini-card">
                    <CreditCard size={20} />
                    <span>ONE CARD</span>
                    <strong>
                      {demoDraft.firstName}
                      <br />
                      {demoDraft.lastName}
                    </strong>
                    <ArrowUpRight size={20} />
                  </div>
                  <p>Una tarjeta. Todo tu potencial.</p>
                  <Link to="/p/valentina-mora">
                    Así te ven los demás
                    <ArrowRight size={15} />
                  </Link>
                </section>
              </div>
            </>
          )}
          <section className="contacts-panel">
            <div className="contacts-heading">
              <div>
                <span className="eyebrow">CONVERSACIONES POR EMPEZAR</span>
                <h2>
                  {contactsOnly ? "Tus contactos" : "Tus últimas conexiones"}
                </h2>
              </div>
              <label className="contact-search">
                <Search size={15} />
                <span className="sr-only">Buscar contactos</span>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar una persona…"
                  aria-label="Buscar contactos"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    aria-label="Limpiar búsqueda"
                  >
                    <X size={13} />
                  </button>
                )}
              </label>
            </div>
            <div className="contact-table">
              {contacts.length ? (
                contacts.map((contact) => (
                  <button
                    className="contact-row"
                    key={contact.id}
                    onClick={() => setSelected(contact)}
                  >
                    <span className="contact-person">
                      <span className="contact-avatar">{contact.initials}</span>
                      <span>
                        <strong>{contact.name}</strong>
                        <small>{contact.company}</small>
                      </span>
                    </span>
                    <span className="contact-email">{contact.email}</span>
                    <span className="contact-date">{contact.date}</span>
                    <ArrowUpRight size={16} />
                  </button>
                ))
              ) : (
                <div className="contacts-empty">
                  <Search size={24} />
                  <h3>No encontramos coincidencias.</h3>
                  <p>Prueba con otro nombre, empresa o correo.</p>
                  <button className="text-button" onClick={() => setQuery("")}>
                    Mostrar todos los contactos
                  </button>
                </div>
              )}
            </div>
            <div className="contacts-footer">
              <span>
                <CheckCircle2 size={12} />
                Contactos de ejemplo · Sin datos reales
              </span>
              {!contactsOnly && (
                <Link to="/contactos">
                  Ver todos
                  <ArrowRight size={13} />
                </Link>
              )}
            </div>
          </section>
        </main>
      </div>
      <footer className="workspace-footer">
        <span>© {new Date().getFullYear()} R&A Solutions · ONE CARD</span>
        <span>Menos papel. Más posibilidades.</span>
      </footer>
      {selected && (
        <Modal title="Una nueva conversación" onClose={() => setSelected(null)}>
          <div className="contact-detail">
            <span className="contact-avatar">{selected.initials}</span>
            <h3>{selected.name}</h3>
            <span>{selected.company}</span>
            <p>{selected.message}</p>
            <div>
              <Mail size={15} />
              {selected.email}
            </div>
            <small>
              Mensaje de demostración. No se enviará ninguna respuesta.
            </small>
          </div>
        </Modal>
      )}
    </div>
  );
}
