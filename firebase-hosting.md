# Publicación en Firebase Hosting

ONE CARD usa el proyecto `one-card-romario` y el destino de Hosting `one-card`. El sitio público es [one-card-romario.web.app](https://one-card-romario.web.app/).

Desde esta carpeta, con una cuenta autorizada en Firebase:

```powershell
npm run build
npx firebase-tools deploy --only hosting:one-card --project one-card-romario
```

Firebase publica la compilación estática de `dist/`. Este despliegue no instala servicios de autenticación, base de datos ni funciones.
