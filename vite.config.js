import path from 'path'
import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
	build: {
		lib: {
			name: 'svelte-palette',
			entry: path.resolve(__dirname, 'src/index.js'),
			fileName: 'index',
		},
	},
	plugins: [svelte()],
})
