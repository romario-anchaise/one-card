# Prueba de trabajo — ONE CARD

Fecha: 5 de noviembre de 2026.

Entorno: Chrome de escritorio, con tamaños móviles simulados. Código local de la versión minimalista. Las pruebas de borrador se ejecutaron en el puerto 5174, separado del origen principal 5173 para no sobrescribir borradores existentes.

## Resultados observados

| Caso                                                    | Resultado                                                            |
| ------------------------------------------------------- | -------------------------------------------------------------------- |
| Abrir tarjeta y cargar fotografía de ejemplo            | Correcto                                                             |
| Vista móvil de 320, 360 y 390 px; escritorio de 1600 px | Sin desbordamiento horizontal                                        |
| Enviar formulario vacío                                 | Muestra errores de nombre, correo y consentimiento                   |
| Completar formulario y autorizar por teclado            | Contacto añadido a la bandeja de la sesión                           |
| Panel después del envío                                 | El contador pasó de 3 a 4                                            |
| Marcar contacto como atendido                           | Estado visible «Atendido»                                            |
| Archivar el mismo contacto                              | Estado visible «Archivado»                                           |
| Filtrar archivados                                      | Se muestra únicamente el contacto archivado                          |
| Exportar el filtro a CSV                                | Archivo descargado y contenido leído: una fila, el contacto filtrado |
| Editar cargo e intentar ir a Resumen                    | Diálogo interno «Cambios sin guardar»                                |
| Elegir «Seguir editando»                                | El cargo modificado se conserva                                      |
| Guardar y previsualizar                                 | El cargo guardado aparece en la tarjeta                              |
| Botón Atrás con una edición pendiente                   | Muestra el mismo diálogo protector                                   |
| Elegir «Salir sin guardar»                              | Se descarta solo el cambio temporal y se conserva el último guardado |
| Crear enlace HTTP inválido y plegar su sección          | Al guardar, la sección se abre y muestra el error HTTPS              |
| Corregir enlace a HTTPS                                 | Guardado correcto y enlace visible en la tarjeta                     |
| Crear un borrador sin datos de ejemplo                  | Correcto: nombre QA, apellidos Local, cargo Pruebas                  |
| Recargar el origen aislado                              | El borrador conserva nombre y cargo                                  |
| Compartir un borrador sin publicar                      | No genera un enlace público ficticio; muestra aviso                  |
| Descargar vCard                                         | Archivo .vcf descargado, contenido y campos verificados              |
| Descargar QR PNG                                        | Archivo descargado, firma PNG y dimensiones 1024 × 1024 verificadas  |
| Descargar QR SVG                                        | Archivo descargado, no vacío                                         |
| Copiar enlace                                           | Botón cambia a «Copiado»                                             |
| Consola de Chrome durante el recorrido                  | Sin errores de ejecución capturados                                  |

## Correcciones realizadas

1. Se eliminaron bloques promocionales, frases repetidas, badges redundantes y decoración que desplazaba las acciones principales.
2. Las opciones de foto/diseño/enlaces y la información adicional quedaron plegadas; la edición básica queda visible.
3. La navegación del editor usa `createHashRouter` y `useBlocker`. Un diálogo propio protege tanto enlaces internos como Atrás, sin depender de `window.confirm` para esas salidas.
4. Los errores dentro de opciones plegadas abren su sección y reciben foco.
5. Los perfiles sin empresa o ubicación no renderizan una línea vacía. La vCard omite campos opcionales vacíos.
6. Las descargas muestran confirmación en la interfaz. Se comprobó el archivo exportado, porque el evento de descarga de la herramienta de navegador no se notificó aunque Chrome sí descargó.

## Pruebas automatizadas

`npm test`: 18 casos aprobados en 4 archivos. Cubren vCard y escapado, campos opcionales vacíos, validación y consentimiento, persistencia local, personalización compatible con borradores anteriores, URLs y formatos de imagen permitidos, filtros y exportación CSV segura.

`npm run build`: compilación TypeScript y producción Vite.

## Pendientes y límites concretos

### Revisión de tamaños de iPhone

Prueba visual adicional en Chrome de escritorio con tamaños de pantalla simulados; **no es una prueba del motor Safari ni de un dispositivo iOS real**.

| Pantalla simulada     | Desbordamiento horizontal | Campos del formulario    |
| --------------------- | ------------------------- | ------------------------ |
| 375 × 667             | No                        | 16 px                    |
| 390 × 844             | No                        | 16 px                    |
| 393 × 852             | No                        | 16 px                    |
| 430 × 932             | No                        | 16 px                    |
| 844 × 390, horizontal | No                        | Corregidos de 12 a 16 px |

Los contactos tienen áreas de 62 px de alto en vertical. Compartir y cerrar ventanas se comprobaron con áreas táctiles de 44 px. El diálogo de compartir cabe en horizontal y permite desplazamiento interno. El campo de correo conserva `type="email"`.

Queda pendiente comprobar en Safari de un iPhone físico: teclado y zoom reales, barras dinámicas, áreas seguras, descarga/importación de vCard y QR, apertura de otras apps y compartir nativo.

- **Carga de foto e importación JSON mediante selección de archivo:** la extensión de Chrome no permite `setFiles` sin «Allow access to file URLs». No se cambió ese permiso. El selector se abrió, pero la carga automática quedó bloqueada antes de que la aplicación recibiera el archivo. Estas dos acciones requieren comprobación manual o habilitar el permiso de la extensión.
- **Android físico:** la prueba usó un viewport móvil de Chrome de escritorio. Falta comprobar escaneo del QR, importación de vCard, selector de fotos y compartir nativo en un teléfono real. NFC requiere además una tarjeta física configurada.
- **Backend:** registro, Google, recuperación de cuenta, publicación, datos entre dispositivos y métricas reales no están conectados. Las pruebas de sesión no equivalen a probar esos servicios.
- **Persistencia de la demo:** perfiles y contactos de ejemplo se reinician al recargar. El borrador propio se guarda solo en el navegador que lo creó.

La prueba confirma los recorridos listados, no la integración de servicios que aún no existen.
