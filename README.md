# Aplicacion de Consulta interna de Snuuper
## Descripción
Esta aplicación permite a los usuarios de Snuuper consultar información interna de la empresa, como lo son los horarios de trabajo, los días festivos, los cumpleaños de los compañeros, entre otros.
Tambien puede contener minisitios o aplicaciones pensadas como pruebas de concepto para futuras aplicaciones.
## Base de Tecnologia
A partir del contenido de `package.json`, esta aplicación llamada "snuuper-internos" utiliza un stack centrado en [SvelteKit](https://kit.svelte.dev/) con `vite` como bundler, y se enfoca en una interfaz de usuario moderna y responsiva. Aquí está un desglose de sus principales características y dependencias:

### 1. **Frontend y Desarrollo con SvelteKit y Vite**
   - `@sveltejs/kit`, `@sveltejs/vite-plugin-svelte`, `svelte`: SvelteKit y sus plugins relacionados se usan para construir la aplicación en el frontend con Vite, lo cual asegura un desarrollo rápido y eficiente.
   - `@sveltejs/enhanced-img` y `lucide-svelte`: Añaden funcionalidad y componentes visuales como iconos para mejorar la experiencia de usuario.
   - `@sveltejs/adapter-node`: Permite el despliegue de la aplicación en entornos Node.js.
   - `svelte-motion`: Para efectos de animación en la interfaz.

### 2. **Estilos y UI**
   - `tailwindcss`, `@tailwindcss/forms`, `@tailwindcss/typography`: Se utiliza TailwindCSS para un diseño modular y fácil de mantener, junto con sus plugins para formularios y tipografía.
   - `tailwind-variants`, `tailwind-merge`: Complementos para gestionar variantes y optimizar clases de Tailwind.
   - `bits-ui` y `clsx`: Herramientas adicionales para construir y gestionar componentes de la interfaz.

### 3. **Autenticación y Seguridad**
   - `lucia`, `@lucia-auth/adapter-drizzle`, `@lucia-auth/adapter-mongodb`: Lucia se emplea como solución de autenticación, compatible con bases de datos como Drizzle y MongoDB.
   - `jsonwebtoken`: Para la creación y verificación de JWTs, esencial para manejar autenticación segura.
   
### 4. **Bases de Datos y Backend**
   - `drizzle-kit`, `drizzle-orm`, `drizzle-zod`: Drizzle ORM se encarga de la conexión y administración de bases de datos, facilitando migraciones, consultas, y tipado.
   - `mongodb`, `postgres`: Conectores para manejar datos en MongoDB y PostgreSQL, indicando que la app probablemente interactúa con estas bases de datos.

### 6. **Desarrollo, Testing y Estándares**
   - `prettier`, `eslint`, `typescript`: Configuraciones de linting y formateo, además del tipado estático para TypeScript.
   - `svelte-check`, `typescript-eslint`: Herramientas para garantizar calidad y consistencia en el código TypeScript.
   - `vitest`: Framework de testing, probablemente para pruebas unitarias.

### 7. **Integración en Tiempo Real y Otros Servicios**
   - `@supabase/realtime-js`, `@supabase/supabase-js`: Para soporte de funcionalidades en tiempo real, posiblemente en conjunto con Supabase.
   - `flowise-sdk`: Herramienta de flujo de trabajo, podría estar orientada a facilitar la automatización de tareas o integraciones.

### 8. **Despliegue y Hosting**
La aplicacion sveltekit puede probarse localmente ejecutando npm run dev
en produccion o para produccion se debe ejecutar npm run build

## Instrucciones especificas para Docker
gcloud auth login
gcloud config set project snuuper
# para autenticar con el repo de docker
gcloud auth configure-docker \
    us-central1-docker.pkg.dev

docker buildx create --use desktop-linux

# para construir la imagen completa en dos partes y subirla atiro
docker buildx build --platform linux/amd64,linux/arm64 . --no-cache --rm -t us-central1-docker.pkg.dev/snuuper-01/snuuper/snuuper-interno --push

# para hacer los commits y push automaticos utilizando fabric ai. 
summary=$(git diff | fabric -g=es --model="gpt-4o-mini" -p summarize_git_diff -c)
git add -A && git commit -m "$summary" && git push
# Consideraciones para actualizar los paquetes de node
para saber que se debe actualizar puedes correr npx ncu
para actualizar los paquetes sin mayor cambio (estos son cambio en el tercer digito de la version semantica), puedes correr npx ncu -u -t patch 
para actualizar los paquetes con cambio en la version menor (segundo digito de la version semantica), puedes correr npx ncu -u -t minor
