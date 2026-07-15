import adapter from '@sveltejs/adapter-vercel'

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		// Deploying the demo to Vercel: use the Vercel adapter explicitly and pin the
		// serverless runtime so the build no longer derives it from the build Node version
		// (Vercel builds on Node 24 because of engines ">=22"). See https://kit.svelte.dev/docs/adapters.
		adapter: adapter({ runtime: 'nodejs22.x' }),
	},
}

export default config
