# ONE CARD — tarjeta profesional pública

Primera fase: interfaz responsive inspirada en R&A Solutions. React + TypeScript + Vite. Los datos de Valentina Mora son ilustrativos. No es el código fuente de auralink-delta.vercel.app ni modifica ese despliegue.

## Desarrollo

Requiere Node.js 22.12+ (o 24 LTS).

```sh
npm install
npm run dev
npm test
npm run build
```

## Arquitectura

- `src/domain`: modelos y contratos `ProfileRepository` / `ConnectionGateway`, independientes de React.
- `src/application`: generación de vCard, validación y caso de uso de conexión.
- `src/infrastructure`: datos ilustrativos, gateway demo y descargas del navegador.
- `src/components`: tarjeta, formulario y diálogo reutilizables.
- `src/main.tsx`: composición e inyección de implementaciones.

Responsabilidad única por módulo y dependencias hacia contratos. Un repositorio HTTP puede sustituir los datos demo; un gateway HTTP puede sustituir el formulario demo sin modificar su presentación. No se introducen clases ni abstracciones adicionales sin necesidad.

## Incluido

- Tarjeta adaptable a móvil/escritorio, contactos, exportación vCard con escapado de caracteres.
- QR generado localmente para la URL actual, descarga SVG y copia de enlace.
- Diálogos con foco confinado, Escape y retorno de foco mediante `dialog` nativo.
- Formulario con validación, consentimiento, estados de envío, error y confirmación.
- Navegación con teclado, etiquetas, enlace de salto y respeto de movimiento reducido.

## Límites de esta fase

El formulario **no envía ni persiste datos** y lo indica en pantalla. Los enlaces de contacto del perfil demo muestran un aviso para evitar contactar a terceros. La vCard contiene datos de ejemplo. El QR de localhost solo es accesible desde el equipo local; para NFC/QR físicos debe usarse una URL pública permanente.

No se implementan todavía autenticación, editor, métricas ni asociación física de NFC. El círculo de avatar usa iniciales hasta disponer de una fotografía autorizada. Las tipografías se cargan desde Google Fonts con fuentes del sistema como respaldo.

## Siguiente fase

Implementar perfiles persistentes con URL estable (`/p/:slug`) y adaptadores de API; añadir acceso con Google al panel. El servidor debe verificar identidad y propiedad del perfil, validar entradas y URLs, limitar solicitudes y aplicar protección antispam. El consentimiento no sustituye una política de privacidad del producto. No colocar secretos en variables `VITE_*` ni en el navegador.

## Publicación

`npm run build` genera `dist/`, apto para hosting estático. El archivo `.openai/hosting.json` conserva la identidad del Site privado de vista previa.
