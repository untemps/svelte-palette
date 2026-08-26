import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		globals: true,
		environment: 'jsdom',
		include: ['src/**/*.{test,spec}.{js,ts}'],
		// Automatically restore globals stubbed with vi.stubGlobal before each test,
		// so no test file can leak a stub into the tests that follow it.
		unstubGlobals: true,
		coverage: {
			reporter: ['text', 'lcov'],
			exclude: ['src/routes/**', 'svelte.config.js', 'commitlint.config.js', 'dist/**', '.svelte-kit/**'],
		},
		setupFiles: ['./vitest.setup.js'],
	},
	plugins: [sveltekit()],
	resolve: {
		conditions: ['browser'],
	},
})
