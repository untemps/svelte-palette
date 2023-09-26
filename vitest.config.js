import { defineConfig } from 'vitest/config'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
	test: {
		global: true,
		environment: 'jsdom',
		coverage: {
			reporter: ['text', 'json', 'html'],
		},
		setupFiles: ['./vitest.setup.js']
	},
	plugins: [svelte({ hot: !process.env.VITEST })],
})
