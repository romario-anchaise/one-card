# ONE CARD — frontend de R&A Solutions

Interfaz premium diseñada para móvil y adaptable a escritorio. React + TypeScript + Vite. Esta entrega incluye datos ficticios para revisar la tarjeta, acceso, panel, editor y contactos. Gerardo puede conectar su backend a los contratos definidos, sin rehacer la presentación.

Consulta **[estructura.md](estructura.md)** para localizar archivos, rutas, campos, estados y puntos de integración.

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

La demo no autentica, publica perfiles de usuarios ni envía mensajes reales. Los cambios en el perfil de ejemplo duran hasta recargar. El editor vacío guarda un borrador propio en este navegador; no es accesible desde otros dispositivos. Los enlaces de contacto del ejemplo muestran un aviso; vCard y QR están disponibles para revisar su interfaz.

No se necesita Supabase para revisar esta entrega. No se ha configurado backend, OAuth ni base de datos. El código no modifica el despliegue original `auralink-delta.vercel.app`.
