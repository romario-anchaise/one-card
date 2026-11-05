import { useEffect, useMemo, useState } from "react";
import {
  createHashRouter,
  RouterProvider,
  Link,
  Navigate,
  Route,
  Routes,
  useParams,
  useLocation,
} from "react-router-dom";
import { ArrowLeft, CreditCard, LoaderCircle } from "lucide-react";
import { App } from "./App";
import type { ProfessionalProfile, ConnectionGateway } from "./domain/profile";
import type { LeadRecord } from "./domain/contact";
import type { ProfileStore } from "./domain/workspace";
import { createDeviceProfileStore } from "./infrastructure/device-profile-store";
import {
  createDemoProfileStore,
  demoConnectionGateway,
  createDemoConnectionGateway,
} from "./infrastructure/demo-services";
import { toProfessionalProfile } from "./application/workspace-services";
import { demoContacts, demoDraft } from "./infrastructure/demo-data";
import { Welcome } from "./pages/Welcome";
import { Access } from "./pages/Access";
import { Editor } from "./pages/Editor";
import { Dashboard } from "./pages/Dashboard";
function StatePage({
  title,
  description,
  loading = false,
}: {
  title: string;
  description?: string;
  loading?: boolean;
}) {
  return (
    <main
      className="state-page"
      role={loading ? "status" : undefined}
      aria-live={loading ? "polite" : undefined}
    >
      {loading ? (
        <LoaderCircle className="spin" size={32} />
      ) : (
        <CreditCard size={32} />
      )}
      <h1>{title}</h1>
      {description && <p>{description}</p>}
      {!loading && (
        <Link className="primary-button" to="/">
          Volver al inicio
        </Link>
      )}
    </main>
  );
}
function PublicProfile({
  store,
  gateway,
}: {
  store: ProfileStore;
  gateway: ConnectionGateway;
}) {
  const { slug } = useParams();
  const [profile, setProfile] = useState<ProfessionalProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    store
      .getPublished(slug ?? "")
      .then((p) => {
        if (active) {
          setProfile(p);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setError(true);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [store, slug]);
  useEffect(() => {
    document.title = profile
      ? `${profile.name} · ONE CARD`
      : "ONE CARD · Perfil profesional";
    return () => {
      document.title = "ONE CARD · Tu identidad profesional";
    };
  }, [profile]);
  if (loading) return <StatePage title="Abriendo tarjeta…" loading />;
  if (error)
    return (
      <StatePage
        title="No pudimos abrir la tarjeta."
        description="Intenta de nuevo en unos momentos."
      />
    );
  if (!profile)
    return (
      <StatePage
        title="Esta tarjeta no está disponible."
        description="Explora la tarjeta de ejemplo desde el inicio."
      />
    );
  return (
    <>
      <div className="preview-toolbar">
        <Link to="/panel">
          <ArrowLeft size={15} />
          Explorar panel
        </Link>
        <span>DEMO</span>
      </div>
      <App profile={profile} connectionGateway={gateway} />
    </>
  );
}
function Preview({ store }: { store: ProfileStore }) {
  const [profile, setProfile] = useState<ProfessionalProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    store
      .load()
      .then((value) => {
        if (active) {
          setProfile(
            value
              ? {
                  ...toProfessionalProfile(value.draft),
                  demo: store.mode === "demo",
                }
              : null,
          );
          setLoading(false);
        }
      })
      .catch((e) => {
        if (active) {
          setError(
            e instanceof Error ? e.message : "No pudimos abrir tu borrador.",
          );
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [store]);
  const editPath = store.mode === "demo" ? "/demo/editar" : "/editar";
  if (loading) return <StatePage title="Preparando tu vista previa…" loading />;
  if (error)
    return (
      <StatePage title="No pudimos abrir tu borrador." description={error} />
    );
  if (!profile) return <Navigate to={editPath} replace />;
  return (
    <>
      <div className="preview-toolbar">
        <Link to={editPath}>
          <ArrowLeft size={15} />
          Volver al editor
        </Link>
        <span>VISTA PREVIA · NO PUBLICADA</span>
      </div>
      <App
        profile={profile}
        connectionGateway={demoConnectionGateway}
        preview
      />
    </>
  );
}
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}
function ProductRoutes() {
  const [currentDemoDraft, setCurrentDemoDraft] = useState(() =>
    structuredClone(demoDraft),
  );
  const [contacts, setContacts] = useState<LeadRecord[]>(() =>
    structuredClone(demoContacts),
  );
  const connectionGateway = useMemo(
    () =>
      createDemoConnectionGateway((_profileId, request) => {
        setContacts((previous) => [
          {
            id: crypto.randomUUID(),
            name: request.name,
            initials: request.name
              .trim()
              .split(/\s+/)
              .map((part) => part.charAt(0))
              .slice(0, 2)
              .join("")
              .toUpperCase(),
            company: "Contacto de prueba",
            email: request.email,
            message: request.message,
            date: "Ahora · sesión de demo",
            channel: "Formulario",
            status: "new",
          },
          ...previous,
        ]);
      }),
    [],
  );
  const device = useMemo(
    () =>
      createDeviceProfileStore({
        getItem: (key) => window.localStorage.getItem(key),
        setItem: (key, value) => window.localStorage.setItem(key, value),
      }),
    [],
  );
  const demo = useMemo(() => createDemoProfileStore(setCurrentDemoDraft), []);
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route
          path="/panel"
          element={
            <Dashboard
              profile={currentDemoDraft}
              records={contacts}
              onStatusChange={(id, status) =>
                setContacts((previous) =>
                  previous.map((record) =>
                    record.id === id ? { ...record, status } : record,
                  ),
                )
              }
            />
          }
        />
        <Route
          path="/contactos"
          element={
            <Dashboard
              contactsOnly
              profile={currentDemoDraft}
              records={contacts}
              onStatusChange={(id, status) =>
                setContacts((previous) =>
                  previous.map((record) =>
                    record.id === id ? { ...record, status } : record,
                  ),
                )
              }
            />
          }
        />
        <Route path="/acceso" element={<Access />} />
        <Route path="/registro" element={<Access mode="register" />} />
        <Route path="/recuperar-acceso" element={<Access mode="reset" />} />
        <Route path="/recuperar" element={<Access mode="password" />} />
        <Route
          path="/editar"
          element={<Editor store={device} account={null} auth={null} />}
        />
        <Route
          path="/demo/editar"
          element={<Editor store={demo} account={null} auth={null} />}
        />
        <Route path="/vista-previa" element={<Preview store={device} />} />
        <Route path="/demo/vista-previa" element={<Preview store={demo} />} />
        <Route
          path="/p/valentina-mora"
          element={<Navigate to={`/p/${demoDraft.slug}`} replace />}
        />
        <Route
          path="/p/:slug"
          element={<PublicProfile store={demo} gateway={connectionGateway} />}
        />
        <Route
          path="*"
          element={<StatePage title="No encontramos esta página." />}
        />
      </Routes>
    </>
  );
}
const router = createHashRouter([{ path: "/*", element: <ProductRoutes /> }]);
export function ProductApp() {
  return <RouterProvider router={router} />;
}
