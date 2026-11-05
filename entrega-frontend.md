# Entrega para Gerardo

## Incluido en el frontend

- Tarjeta digital centrada y diseño físico fiel a la referencia R&A.
- Interfaz adaptable a celular y computadora, con modo claro, oscuro y automático.
- Inicio, acceso, registro y recuperación como interfaces de demostración.
- Editor con campos definidos, personalización, vista previa, respaldo e importación.
- Bandeja de contactos de la sesión con búsqueda, estados y CSV.
- Enlaces activos de contacto, vCard, QR PNG/SVG y compartir desde el dispositivo.
- Estados de carga, error, confirmación y vacío; animaciones que respetan movimiento reducido.
- Contratos y rutas descritos en `estructura.md`; pruebas y límites registrados en `pruebas.md`.

## Revisión final del frontend

- Aprobar el diseño y el contenido definitivo con Gerardo.
- Sustituir identidad y fotografía ficticias por los recursos aprobados.
- Verificar Safari y selector de archivos en un iPhone físico; revisar también Android real.

## Integración a cargo del backend

- Autenticación real y proveedor Google, recuperación y cierre de sesión.
- Base de datos, almacenamiento de fotos, permisos y autorización por propietario.
- Publicación con enlace permanente, contactos persistentes y métricas reales.
- Conectar las implementaciones de `AuthGateway`, `ProfileStore`, `ConnectionGateway` y `ContactsGateway` a los servicios elegidos.

Los datos de ejemplo y la persistencia de la demo no sustituyen esos servicios. La apariencia visual se guarda solo en el navegador y no exige modificar el backend.
