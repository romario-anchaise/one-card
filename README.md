# ONE CARD — frontend de R&A Solutions

Interfaz premium diseñada para móvil y adaptable a escritorio. React + TypeScript + Vite. Esta entrega incluye datos ficticios para revisar la tarjeta, acceso, panel, editor y contactos. Gerardo puede conectar su backend a los contratos definidos, sin rehacer la presentación.

Consulta **[estructura.md](estructura.md)** para localizar archivos, rutas, campos, estados y puntos de integración.

Consulta **[pruebas.md](pruebas.md)** para los resultados de la prueba funcional en Chrome y los pendientes reales.

Consulta **[entrega-frontend.md](entrega-frontend.md)** para separar la revisión visual de la integración que realizará Gerardo. La apariencia se cambia desde el icono de la cabecera: claro, oscuro o automático; la elección queda guardada en el navegador.

## Ejecutar

Node.js 22.12+ o 24 LTS.

```sh
npm install
npm run dev
```

## Verificar

```sh
npm test
npm run build
```

## Recorridos

- Inicio: `/`.
- Tarjeta de ejemplo: `/#/p/valentina-mora`.
- Panel y métricas de ejemplo: `/#/panel`.
- Editor con datos de ejemplo: `/#/demo/editar`.
- Crear un borrador vacío: `/#/editar`.
- Acceso y registro: `/#/acceso`, `/#/registro`.

La demo no autentica, publica perfiles de usuarios ni envía mensajes a un servidor. Los cambios del perfil de ejemplo y la bandeja duran hasta recargar. El formulario sí añade solicitudes de prueba a la bandeja de esa sesión, donde pueden marcarse atendidas o archivarse. El editor vacío guarda un borrador propio en este navegador; no es accesible desde otros dispositivos.

Incluye carga y preparación local de foto, acabados mate/bambú/acero, enlaces ordenables, vista previa conectada, importación/exportación JSON, filtros y CSV de contactos, QR PNG/SVG, vCard y compartir desde el dispositivo. Los botones de WhatsApp, teléfono, correo y LinkedIn son enlaces activos, también en el perfil de ejemplo. Para contactar a una persona real, sustituir los datos ficticios desde el editor. No se envían mensajes ni se realizan llamadas automáticamente.

No se necesita Supabase para revisar esta entrega. No se ha configurado backend, OAuth ni base de datos. El código no modifica el despliegue original `auralink-delta.vercel.app`.
