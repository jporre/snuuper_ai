import { paraglideVitePlugin } from '@inlang/paraglide-js'
import tailwindcss from '@tailwindcss/vite';
import { svelteTesting } from '@testing-library/svelte/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { enhancedImages } from '@sveltejs/enhanced-img';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    server: {
        allowedHosts: ['jporre.4c.cl']
    },
    plugins: [
        tailwindcss(),
        enhancedImages(),
        sveltekit(),
        paraglideVitePlugin({
            project: './project.inlang',
            outdir: './src/lib/paraglide'
        })
    ],
    // Nest the workspace configuration inside the 'test' property
    test: {
        // You can define root-level test options here if needed
        // e.g., globals: true,

        // Define the workspace projects
        workspace: [
            {
                // Workspace configurations should extend the root config if needed,
                // but 'extends' here might be redundant if inheriting defaults.
                // Consider removing 'extends' unless specifically overriding root test settings.
                plugins: [svelteTesting()], // Plugins specific to this workspace test environment
                test: {
                    name: 'client',
                    environment: 'jsdom',
                    clearMocks: true,
                    include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
                    exclude: ['src/lib/server/**'],
                    setupFiles: ['./vitest-setup-client.ts']
                }
            },
            {
                // Consider removing 'extends' here as well.
                test: {
                    name: 'server',
                    environment: 'node',
                    include: ['src/**/*.{test,spec}.{js,ts}'],
                    exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
                    // No setupFiles needed for node environment? Ensure this is correct.
                }
            }
        ]
    }
});
