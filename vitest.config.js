import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		global: true,
		environment: 'jsdom',
		onConsoleLog(log, type) {
			if (type === 'stderr' && log.includes('Not implemented: HTMLFormElement.prototype.requestSubmit')) {
				return false
			}
		},
		coverage: {
			reporter: ['text', 'lcov'],
			exclude: ['src/routes/**', 'svelte.config.js', 'commitlint.config.js'],
		},
		setupFiles: ['./vitest.setup.js'],
	},
	plugins: [sveltekit()],
	resolve: {
		conditions: ['browser'],
	},
})
