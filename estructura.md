# ONE CARD — guía para conectar el backend

## Alcance de esta entrega

Frontend adaptable a móvil y computadora. Incluye tarjeta pública de ejemplo, inicio, login, registro, recuperación de acceso, panel, editor y contactos. **No contiene backend, cuentas reales, OAuth activo, métricas reales ni envíos reales.** Los datos ficticios están aislados en `src/infrastructure/demo-data.ts`.

Los retrasos en los adaptadores demo sirven para presentar los estados de carga. No son llamadas de red. El acceso demo no guarda contraseñas ni autentica usuarios. Google muestra un aviso hasta que se inyecte una implementación real de `AuthGateway`.

## Dónde está cada cosa

```text
src/
  main.tsx                            Montaje de React y estilos globales
  ProductApp.tsx                      Rutas y composición de adaptadores
  App.tsx                             Presentación de la tarjeta y diálogo QR
  domain/
    profile.ts                        Perfil público, contactos y ConnectionGateway
    workspace.ts                      ProfileDraft, ProfileStore y AuthGateway
    contact.ts                        Registro de contacto, estados y contrato remoto
  application/
    profile-services.ts               vCard, validación y envío mediante contrato
    workspace-services.ts             Borrador vacío, slug, URLs y transformación
    contact-services.ts               Búsqueda, filtros y exportación CSV
    *.test.ts                         Pruebas de lógica y persistencia local
  infrastructure/
    demo-data.ts                      ÚNICO origen de personas y métricas de ejemplo
    demo-services.ts                  ProfileStore en memoria y envío simulado
    device-profile-store.ts           Borrador propio en localStorage
    browser.ts                        Descargas mediante Blob
    photo.ts                          Preparación local de fotos
    qr-download.ts                    Generación de QR en PNG
  pages/
    Welcome.tsx                       Inicio y accesos a recorridos
    Access.tsx                        Login, registro y recuperación
    Dashboard.tsx                     Resumen, gráfica y contactos de ejemplo
    Editor.tsx                        Edición, validación y guardado del perfil
  components/
    Brand.tsx                         Identidad visual y enlace al inicio
    ProfileCard.tsx                   Tarjeta reutilizable basada en props
    ProfileCustomization.tsx          Foto, acabados, enlaces e importación
    PhysicalCard.tsx                  Tarjeta física negra fiel al prototipo
    ConnectionForm.tsx                Formulario y estados de envío
    Modal.tsx                         Diálogo nativo, Escape y foco confinado
  styles.css                          Diseño de tarjeta y base visual
  workspace.css                       Inicio, acceso y editor
  demo.css                            Panel, contactos y animaciones
  reference.css                       Ajustes visuales fieles al prototipo R&A
  functionality.css                   Controles de personalización y gestión
```

## Rutas de la demo

Se utiliza `HashRouter` para funcionar en hosting estático sin reglas especiales de reescritura. Un enlace completo tiene la forma `https://dominio/#/panel`.

| Ruta                 | Pantalla / comportamiento                              |
| -------------------- | ------------------------------------------------------ |
| `/`                  | Inicio; enlaces a panel, tarjeta y creación desde cero |
| `/p/valentina-mora`  | Perfil ficticio; QR y vCard de ejemplo                 |
| `/panel`             | Métricas y contactos de ejemplo                        |
| `/contactos`         | Búsqueda y lectura de mensajes ficticios               |
| `/demo/editar`       | Editor con datos de ejemplo; cambios solo en memoria   |
| `/demo/vista-previa` | Vista previa de los cambios hechos en la demo          |
| `/editar`            | Editor sin datos personales predefinidos               |
| `/vista-previa`      | Borrador propio guardado en este navegador             |
| `/acceso`            | Formulario de login y botón Google                     |
| `/registro`          | Formulario de registro                                 |
| `/recuperar-acceso`  | Solicitud de recuperación                              |
| `/recuperar`         | Interfaz de nueva contraseña                           |

Editar la demo y recargar la página restaura los ejemplos. El borrador propio usa una clave distinta y **no se publica** ni se mezcla con el ejemplo. Un QR de borrador no se genera como si fuera un enlace público.

## Campos del perfil: contrato canónico

`ProfileDraft` es el modelo de edición. Los campos de texto usan cadenas; para texto opcional vacío, usar `""`. `appearance` y `links` son extensiones opcionales compatibles con borradores anteriores.

| Campo       | Uso                                 | Validación en frontend                                                  |
| ----------- | ----------------------------------- | ----------------------------------------------------------------------- |
| `id`        | ID estable del perfil               | UUID generado al crear el borrador; el backend debe validar y autorizar |
| `slug`      | Enlace permanente                   | 3–60 caracteres, letras minúsculas, números y guiones                   |
| `firstName` | Nombre                              | Obligatorio, máximo 100                                                 |
| `lastName`  | Apellidos                           | Obligatorio, máximo 100                                                 |
| `role`      | Cargo / profesión                   | Obligatorio, máximo 100                                                 |
| `company`   | Empresa / marca                     | Opcional, máximo 100                                                    |
| `location`  | Ciudad / país                       | Opcional, máximo 100                                                    |
| `bio`       | Presentación                        | Opcional, máximo 500                                                    |
| `email`     | Correo que se mostrará públicamente | Opcional, formato email, máximo 254                                     |
| `phone`     | Teléfono público                    | Opcional, `+` y entre 7–15 dígitos                                      |
| `whatsapp`  | Número de WhatsApp                  | Opcional, mismo formato internacional                                   |
| `linkedin`  | Perfil de LinkedIn                  | Opcional, HTTPS y dominio LinkedIn                                      |
| `avatarUrl` | Fotografía                          | Opcional, URL HTTPS, máximo 2048                                        |
| `expertise` | Áreas de interés                    | Opcional, texto separado por comas, máximo 150                          |

`toProfessionalProfile()` deriva nombre completo, iniciales, etiquetas y enlaces desde esos campos. No almacenar HTML ni aceptar URLs ejecutables en el servidor. Los canales vacíos se omiten. La foto puede ser una URL HTTPS o una imagen raster preparada en el navegador; todavía no se sube a un servidor.

`StoredProfile` envuelve `{ draft, published, updatedAt }`. La fecha debe ser ISO 8601. `published` distingue un borrador de una publicación real; no convertir el guardado local en publicación.

## Puntos de conexión

### Perfiles

Implementar `ProfileStore` (`domain/workspace.ts`) y sustituir la implementación correspondiente en `ProductApp.tsx`:

```ts
interface ProfileStore {
  readonly mode: "device" | "cloud" | "demo";
  load(): Promise<StoredProfile | null>;
  save(draft: ProfileDraft): Promise<StoredProfile>;
  publish(draft: ProfileDraft): Promise<StoredProfile>;
  unpublish(): Promise<StoredProfile>;
  getPublished(slug: string): Promise<ProfessionalProfile | null>;
}
```

`Editor` consume este contrato; no conoce HTTP, SQL ni Supabase. Mantener separado el borrador de la versión pública: guardar cambios no debe exponerlos hasta publicar. Conservar el `slug` para no invalidar QR/NFC. Los errores del adaptador se presentan en pantalla; no devolver un éxito si el servidor falla.

### Autenticación

Implementar `AuthGateway` e inyectarlo en `Access`. Métodos: `getAccount`, `subscribe`, `signIn`, `signUp`, `signInWithGoogle`, `signOut`, `requestPasswordReset`, `updatePassword`.

**También se debe conectar la sesión y la navegación en `ProductApp.tsx`:** proteger el editor y el panel, redirigir después de login, procesar callbacks y cambiar de adaptador según usuario. Pasar `auth` a `Access` por sí solo no implementa este flujo completo. El contrato de `signUp` devuelve `true` si el proveedor requiere confirmar el correo; conectar la confirmación correspondiente.

Para Supabase futuro: usar su SDK en un adaptador, habilitar Google en el proveedor y configurar las URLs permitidas. No poner `service_role`, secretos OAuth o contraseñas en el cliente. Los guards de React no reemplazan autorización y RLS en el servidor.

### Solicitudes de contacto

`ConnectionGateway.send(profileId, request)` recibe `{ name, email, message, consent }` y devuelve `{ mode: 'sent', message }` solo después de guardar realmente. La demo devuelve `mode: 'demo'` y lo explica en pantalla. Los componentes dependen del contrato, no del proveedor.

### Métricas y bandeja

`ProductApp.tsx` mantiene la bandeja de ejemplo en memoria e inyecta `records` y `onStatusChange` en `Dashboard.tsx`. El formulario de la tarjeta añade solicitudes a esta misma bandeja mediante `createDemoConnectionGateway`. **No se envían a una API y se pierden al recargar.** Los objetos de contacto contienen `id`, `name`, `initials`, `company`, `email`, `message`, `date`, `channel`, `status`; convertir `date` a una fecha ISO real en el DTO del backend. Las vistas y clics siguen siendo métricas ilustrativas de `demo-data.ts`; el contador de contactos nuevos se deriva de la bandeja de la sesión.

### Funcionalidad adicional y nuevos puntos de integración

- `ProfileCustomization.tsx`: elegir/quitar foto, acabado, añadir/editar/ordenar/quitar hasta seis enlaces e importar un respaldo. No importa contraseñas ni sesiones. La importación conserva el ID local y el slug fijo de la demo.
- `photo.ts`: prepara JPG/PNG/WebP de hasta 5 MB en el navegador, recorta al centro y reduce a 512 × 512. Usa `avatarUrl` como data URL raster de hasta 750000 caracteres. El backend deberá sustituirla por una URL de almacenamiento después de subir y validar la imagen.
- `appearance?: 'matte' | 'bamboo' | 'steel'`: acabado renderizado por `PhysicalCard` y acento del perfil. El valor por defecto es `matte`.
- `links?: { id: string; label: string; url: string }[]`: recursos en el orden elegido, máximo seis; título de hasta 60 caracteres y URL HTTPS de hasta 2048. Se validan al guardar y se muestran en la tarjeta.
- `Editor.tsx`: vista física en vivo, guardado y vista previa digital. Los cambios guardados en la demo actualizan también el nombre que muestra el panel.
- `contact.ts`: `LeadRecord`, `LeadStatus` y contrato `ContactsGateway` para el adaptador futuro. Estados: `new`, `contacted`, `archived`. Archivar es reversible.
- `contact-services.ts`: búsqueda sin distinguir tildes, filtros combinados y CSV con valores escapados y protección contra fórmulas de hoja de cálculo.
- `Dashboard.tsx`: filtros, exportación del resultado actual, marcar atendido/nuevo, archivar/restaurar; estado gestionado por el padre para conservarlo entre pantallas.
- `qr-download.ts` y `App.tsx`: descargar QR como PNG de 1024 × 1024 o SVG, copiar enlace y compartir mediante la función nativa del dispositivo cuando está disponible. El borrador sin publicar sigue sin ofrecer un enlace público ficticio.
- `functionality.css`: controles y estados de estos recorridos, incluidos tamaños móviles.

Para conectar el backend, sustituir las operaciones de memoria por el adaptador de contactos, guardar archivos en el almacenamiento elegido y devolver las mismas estructuras de dominio. El servidor debe validar propiedad, tipos, tamaño, URLs y permisos; las validaciones del navegador son solo experiencia de usuario.

## Criterios de organización

- Responsabilidad única: componentes, validación, modelos y persistencia en módulos distintos.
- Inversión de dependencias: editor y formulario reciben interfaces, no SDKs.
- Sustitución: adaptadores demo, local y futuro remoto comparten contratos.
- Reutilización: la misma tarjeta muestra datos de ejemplo, un borrador o un perfil remoto.
- Escalabilidad: añadir proveedores y pantallas sin duplicar la tarjeta ni introducir backend dentro de los componentes.

No se han añadido clases, herencia ni una capa por cada función solo para aparentar SOLID. Los contratos pequeños representan necesidades reales de la interfaz.

## Diseño y accesibilidad

Paleta oscura con acentos dorados, componentes adaptables, botones táctiles, foco visible, etiquetas, errores asociados, diálogos con teclado y animaciones reducidas cuando el sistema lo pide. Las fuentes externas tienen alternativas del sistema.

Los tiempos de simulación viven en `demo-services.ts`; las animaciones de entrada, gráfica y confirmación en `demo.css`. Los estados vacíos de búsqueda y perfil inexistente se pueden abrir navegando o buscando una cadena que no coincida.

La tarjeta sigue la referencia visual de R&A: negro y dorado, foto centrada, canales de contacto, vCard blanca y formulario «Conectar de vuelta». `reference.css` contiene estos ajustes. `PhysicalCard` se reutiliza en escritorio y en el diálogo móvil. La fotografía ilustrativa está en `public/demo-avatar.jpg` ([fuente de imagen en Unsplash](https://images.unsplash.com/photo-1580489944761-15a19d654956)); no representa una cuenta real.

## Verificación y entrega

```sh
npm install
npm run dev
npm test
npm run build
```

La salida `dist/` es estática. `.openai/hosting.json` pertenece a la vista previa privada de Sites, no al backend del producto. Esta demo funciona en navegadores Android/iOS y escritorio; no es un APK ni una app Kotlin.
