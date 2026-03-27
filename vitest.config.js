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
			include: ['src/lib/components/**/*.{ts,svelte}', 'src/lib/utils/**/*.ts'],
			exclude: ['src/lib/**/__tests__/**'],
		},
		setupFiles: ['./vitest.setup.js'],
	},
	plugins: [sveltekit()],
	resolve: {
		conditions: ['browser'],
	},
})
