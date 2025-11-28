# Guía de Despliegue en Cloudflare Pages

Esta guía te explicará paso a paso cómo desplegar tu aplicación React (Vite) en Cloudflare Pages de forma gratuita.

## Prerrequisitos

1.  Tener una cuenta en [GitHub](https://github.com/).
2.  Tener una cuenta en [Cloudflare](https://dash.cloudflare.com/sign-up).
3.  Tener tu código subido a un repositorio de GitHub (ya lo tienes).

## Paso 1: Conectar GitHub con Cloudflare Pages

1.  Inicia sesión en tu panel de **Cloudflare**.
2.  En el menú lateral izquierdo, ve a **Workers & Pages**.
3.  Haz clic en el botón azul **Create application** (Crear aplicación).
4.  Selecciona la pestaña **Pages**.
5.  Haz clic en el botón **Connect to Git**.
6.  Selecciona la pestaña **GitHub** y haz clic en **Connect GitHub**.
7.  Te pedirá autorización. Autoriza a Cloudflare para acceder a tus repositorios. Puedes seleccionar "All repositories" o solo el repositorio de tu proyecto (`Filadelfia-React`).
8.  Una vez autorizado, selecciona tu repositorio `Filadelfia-React` de la lista y haz clic en **Begin setup**.

## Paso 2: Configurar el Build (Construcción)

Cloudflare detectará automáticamente que es un proyecto React/Vite, pero verifiquemos la configuración:

1.  **Project name**: Puedes dejar el nombre por defecto o cambiarlo (será parte de tu URL, ej: `filadelfia-react.pages.dev`).
2.  **Production branch**: Déjalo en `main`.
3.  **Framework preset**: Selecciona **Vite** (o React si no aparece Vite, pero Vite es mejor).
4.  **Build command**: Debería ser `npm run build`.
5.  **Build output directory**: Debería ser `dist`.

## Paso 3: Variables de Entorno (IMPORTANTE)

Tu aplicación necesita conectarse a Supabase, así que debes configurar las variables de entorno aquí.

1.  En la misma pantalla de configuración, busca la sección **Environment variables (advanced)**.
2.  Haz clic para expandirla.
3.  Agrega las siguientes variables (copia los valores de tu archivo `.env` local):
    *   **Variable name**: `VITE_SUPABASE_URL`
        *   **Value**: (Tu URL de Supabase, ej: `https://xyz.supabase.co`)
    *   **Variable name**: `VITE_SUPABASE_ANON_KEY`
        *   **Value**: (Tu Anon Key de Supabase)

4.  Haz clic en **Save and Deploy**.

## Paso 4: Finalización

Cloudflare comenzará a construir tu proyecto. Esto tomará 1-2 minutos. Verás un log de la consola mostrando `npm install`, `npm run build`, etc.

*   Si todo sale bien, verás un mensaje de **Success!** y una URL (ej: `https://filadelfia-react.pages.dev`).
*   Haz clic en la URL para visitar tu aplicación en vivo.

## Actualizaciones Automáticas

A partir de ahora, cada vez que hagas un `git push` a la rama `main`, Cloudflare detectará el cambio, reconstruirá la aplicación y la actualizará automáticamente en unos minutos.

---

## Configuración Adicional (Rutas SPA)

Como tu aplicación es una SPA (Single Page Application) con React Router, necesitas asegurarte de que Cloudflare redirija todas las rutas al `index.html`.

Normalmente Cloudflare Pages maneja esto bien por defecto con Vite, pero si al recargar una página interna (ej: `/personas`) te da error 404:

1.  Crea un archivo llamado `_redirects` en la carpeta `public/` de tu proyecto.
2.  Agrega esta línea dentro del archivo:
    ```
    /*  /index.html  200
    ```
3.  Haz commit y push de este archivo.
