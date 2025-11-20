# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a SvelteKit application using Svelte 5 with experimental features, built with modern web technologies including TailwindCSS v4, shadcn-svelte UI components, 

Every time you write a Svelte component or a Svelte module you MUST invoke the `svelte-autofixer` tool providing the code. The tool will return a list of issues or suggestions. If there are any issues or suggestions you MUST fix them and call the tool again with the updated code. You MUST keep doing this until the tool returns no issues or suggestions. Only then you can return the code to the user.

## ⚠️ PRINCIPIO FUNDAMENTAL: SIMPLICIDAD PRIMERO

**SIEMPRE busca la solución MÁS SIMPLE primero. NO compliques innecesariamente.**

### Reglas obligatorias de simplicidad:

1. **NO uses `goto()` cuando un simple `href` funciona**
   - ❌ MAL: `<Button onclick={() => goto('/ruta')}>`
   - ✅ BIEN: `<Button href="/ruta">`

2. **NO recargas la página para filtrar datos locales**
   - ❌ MAL: Filtrar en servidor + `goto()` con query params
   - ✅ BIEN: Cargar datos una vez + filtrar con `$derived`

3. **USA `$derived` para datos calculados reactivos**
   - ❌ MAL: Funciones complejas con `$state` y efectos
   - ✅ BIEN: `const filtered = $derived(data.filter(...))`

4. **Componentes shadcn-svelte: usa `href` cuando es posible**
   - Los componentes Button, Link, etc. aceptan `href` directamente
   - NO necesitas funciones intermedias para navegación

5. **Filtrado y búsqueda:**
   - SIEMPRE en cliente con `$derived` si los datos caben en memoria (<1000 items)
   - SOLO en servidor si son miles de registros o necesitas paginación real

6. **Antes de escribir código complejo, pregúntate:**
   - "¿Esto realmente necesita ser tan complejo?"
   - "¿Hay una manera más simple con las primitivas de Svelte 5?"
   - "¿Estoy sobre-ingeniando esto?"

**Si estás a punto de usar `goto()`, `invalidate()`, o funciones complejas de navegación, DETENTE y busca la solución simple primero.**
**Evita usar custom or special eventListeners si es que puedes resolverlo con un $state reactivo.**

## Architecture & Structure

### Core Technology Stack
- **Framework**: SvelteKit 2.48+ with Node adapter
- **UI Framework**: Svelte 5.43+ with experimental async compiler option
- **Styling**: TailwindCSS v4 with Vite integration, using custom OKLCH color system
- **Component Library**: shadcn-svelte (bits-ui based) with extensive sidebar components
- **Database**: PostgreSQL with Drizzle ORM
- **Testing**: Vitest for unit tests, Playwright for E2E
- **Build Tool**: Vite 7.2+

### Project Configuration
- Responsive design (mobile-first)
- Clean and maintainable code with re-usable Svelte components

Please read all the latest documentation for (Svelte Kit)[svelte.dev/llms.txt] and Tailwind CSS to ensure you are familiar with the latest features and best practices before implementing any new features or changes in these areas.

#### Path Aliases (svelte.config.js)
- `$lib` → `src/lib`
- `$src` → `src`
- `$components` → `src/lib/components`
- `$api` → `src/routes/api`


### Component Architecture

The application uses shadcn-svelte components extensively, particularly:
- Lucide icons must always use the latest version @lucide/svelte
- svelte-sonner for notifications
- mode-watcher for dark mode

### Database Schema
Located in `src/lib/server/db/schema.ts`, using Drizzle ORM with PostgreSQL. 

### Styling System
- TailwindCSS v4 with custom configuration
- OKLCH color system for precise color management
- Custom CSS variables for theming (light/dark modes)
- Font system using Karla and Mulish variable fonts
- tw-animate-css for animations

# Error Handling

SvelteKit provides utilities for creating HTTP errors and redirects that integrate seamlessly with the framework's error handling system.
Throws an HTTP error that SvelteKit will handle appropriately, returning an error response without invoking the `handleError` hook.
1. **Use appropriate status codes**: 404 for not found, 403 for forbidden, 400 for bad request, etc.
2. **Don't catch thrown errors/redirects**: Let SvelteKit handle them unless you need to add logging
3. **Provide helpful error messages**: Users and developers should understand what went wrong
4. **Use redirects for state changes**: After successful form submissions, use 303 redirects
5. **Handle errors at appropriate levels**: Use load functions for page-level errors, endpoints for API errors

/**
 * Throws an error with a HTTP status code and an optional message.
 * When called during request handling, this will cause SvelteKit to
 * return an error response without invoking `handleError`.
 * @param status - HTTP status code (must be 400-599)
 * @param body - Error body that conforms to App.Error type or string
 * @throws HttpError - Instructs SvelteKit to initiate HTTP error handling
 * @throws Error - If the provided status is invalid
 */
function error(status: number, body: App.Error | string): never;
```

**Usage Examples:**

```typescript
import { error } from '@sveltejs/kit';

// In a load function
export async function load({ params }) {
  const post = await getPost(params.id);
  
  if (!post) {
    throw error(404, 'Post not found');
  }
  
  if (!post.published) {
    throw error(403, 'Post not published');
  }
  
  return { post };
}

// In an API endpoint
export async function GET({ params }) {
  const user = await getUser(params.id);
  
  if (!user) {
    throw error(404, {
      message: 'User not found',
      code: 'USER_NOT_FOUND'
    });
  }
  
  return json(user);
}
```

### Testing Architecture
- **Client Tests**: Browser-based tests using Vitest with Playwright provider
  - Pattern: `src/**/*.svelte.{test,spec}.{js,ts}`
  - Excludes server code
- **Server Tests**: Node environment tests
  - Pattern: `src/**/*.{test,spec}.{js,ts}`
  - Excludes Svelte component tests

### MDsveX Integration
MDsveX is configured for `.svx` and `.md` files but should be used carefully with the experimental compiler options.

# Code style
- Use ES modules (import/export) syntax, not CommonJS (require)
- Destructure imports when possible (eg. import { foo } from 'bar')
- Each Svelte component should declare its own prop types using TypeScript within the same file
- Svelte component files should have constants declared outside the component function
- Use camelCase for variable and function names
- Use PascalCase for Svelte components
- Avoid use of inline styles, prefer Tailwind CSS classes
- Avoid using `any` type in Typescript or casting with as
- Declare constant values and objects using `const`
- Constant values that are objects, do not use CAPS for the variable name, use camelCase instead suffixed with 'Value'
- Event handlers should be named with the `handle` prefix (e.g. `handleClick`)
- Only write code comments when the code is not clear and keep it conscise, avoid commenting out code
- Avoid magic numbers and strings, use constants instead
- Each file should have line break at the end
- Try to limit components and modules up to 200 lines and split in to different components to manage complexity
- Typescript files should be camelCase e.g. myService.ts

# Workflow

- Be sure to run `npm run check` when you're done making a series of code changes
- Use `npm run format` whenever the format is not correct
- Prefer running single tests, and not the whole test suite, for performance

# Dependency management

- Ensure to find the latest version of a package before adding it
- Avoid using deprecated packages or APIs

You are able to use the Svelte MCP server, where you have access to comprehensive Svelte 5 and SvelteKit documentation. Here's how to use the available tools effectively:

## Available MCP Tools:

### 1. list-sections
Use this FIRST to discover all available documentation sections. Returns a structured list with titles, use_cases, and paths.
When asked about Svelte or SvelteKit topics, ALWAYS use this tool at the start of the chat to find relevant sections.

### 2. get-documentation
Retrieves full documentation content for specific sections. Accepts single or multiple sections.
After calling the list-sections tool, you MUST analyze the returned documentation sections (especially the use_cases field) and then use the get-documentation tool to fetch ALL documentation sections that are relevant for the user's task.

### 3. svelte-autofixer
Analyzes Svelte code and returns issues and suggestions.
You MUST use this tool whenever writing Svelte code before sending it to the user. Keep calling it until no issues or suggestions are returned.

### 4. playground-link
Generates a Svelte Playground link with the provided code.
After completing the code, ask the user if they want a playground link. Only call this tool after user confirmation and NEVER if code was written to files in their project.

**Documentation**:
- Comprehensive SvelteKit documentation in `CLAUDE.md` for lessons learned and best practices.
- Inline code comments ONLY for complex logic.
- All documentation must by produced in spanish.
- All documentation must be kept in docs/ folder. Up-to-date documentation is critical and MUST be in docs/vigente.
- Working and older documents in docs/en-progreso.
- Documentation must cover architecture, setup, deployment, and common tasks. IN SPANISH ONLY.

## Common Patterns
Always make a priority to look for the most recent documentation in project.docs/vigente before suggesting code.
look for simple solutions first. try to avoid complex implementations when simpler ones will do. on liners are preferred when possible.