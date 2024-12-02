We use svelte5, sveltekit, tailwindcss, daisyui and MongoDB. 
Key Principles
- Write concise, technical code with accurate Svelte 5 and SvelteKit examples.
- Leverage SvelteKit's server-side rendering (SSR) and static site generation (SSG) capabilities.
- Prioritize performance optimization and minimal JavaScript for optimal user experience.
- Use descriptive variable names and follow Svelte and SvelteKit conventions.
- Organize files using SvelteKit's file-based routing system.

Code Style and Structure
- Write concise, technical TypeScript or JavaScript code with accurate examples.
- Use functional and declarative programming patterns; avoid unnecessary classes except for state machines.
- Prefer iteration and modularization over code duplication.
- Structure files: component logic, markup, styles, helpers, types.
- Follow Svelte's official documentation for setup and configuration: https://svelte.dev/docs

Naming Conventions
- Use lowercase with hyphens for component files (e.g., `components/auth-form.svelte`).
- Use PascalCase for component names in imports and usage.
- Use camelCase for variables, functions, and props.

TypeScript Usage
- Use TypeScript for all code; prefer interfaces over types.
- Avoid enums; use const objects instead.
- Use functional components with TypeScript interfaces for props.
- Enable strict mode in TypeScript for better type safety.

Svelte Runes
- `$state`: Declare reactive state
  ```typescript
  let count = $state(0);
  ```
- `$derived`: Compute derived values
  ```typescript
  let doubled = $derived(count * 2);
  ```
- `$effect`: Manage side effects and lifecycle
  ```typescript
  $effect(() => {
    console.log(`Count is now ${count}`);
  });
  ```
- `$props`: Declare component props
  ```typescript
  let { optionalProp = 42, requiredProp } = $props();
  ```
- `$bindable`: Create two-way bindable props
  ```typescript
  let { bindableProp = $bindable() } = $props();
  ```
- `$inspect`: Debug reactive state (development only)
  ```typescript
  $inspect(count);
  ```

State Management
- Use classes for complex state management (state machines):
  ```typescript
  // counter.svelte.ts
  class Counter {
    count = $state(0);
    incrementor = $state(1);
    
    increment() {
      this.count += this.incrementor;
    }
    
    resetCount() {
      this.count = 0;
    }
    
    resetIncrementor() {
      this.incrementor = 1;
    }
  }

  export const counter = new Counter();
  ```
- Use in components:
  ```svelte
  <script lang="ts">
  import { counter } from './counter.svelte.ts';
  </script>

  <button on:click={() => counter.increment()}>
    Count: {counter.count}
  </button>
  ```
Performance Optimization
- Leverage Svelte's compile-time optimizations.
- Use `{#key}` blocks to force re-rendering of components when needed.
- Implement code splitting using dynamic imports for large applications.
- Profile and monitor performance using browser developer tools.
- Use `$effect.tracking()` to optimize effect dependencies.
- Minimize use of client-side JavaScript; leverage SvelteKit's SSR and SSG.
- Implement proper lazy loading for images and other assets.

Data Fetching and API Routes
- Use load functions for server-side data fetching.
- Implement proper error handling for data fetching operations.
- Create API routes in the src/routes/gtyui6t7_lk/ directory.
- Implement proper request handling and response formatting in API routes.
- Use SvelteKit's hooks for global API middleware.