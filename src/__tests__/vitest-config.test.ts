vi.mock('@sveltejs/kit/vite', () => ({ sveltekit: () => [] }))

import config from '../../vitest.config.js'

describe('vitest config', () => {
	describe('include', () => {
		it('scopes collection to the source tree', () => {
			const include = config.test?.include

			expect(include).toBeDefined()
			expect(include?.length).toBeGreaterThan(0)
			include?.forEach((pattern) => {
				expect(pattern.startsWith('src/')).toBe(true)
			})
		})
	})

	describe('coverage', () => {
		it('excludes the build output', () => {
			expect(config.test?.coverage?.exclude).toEqual(expect.arrayContaining(['dist/**', '.svelte-kit/**']))
		})
	})
})
