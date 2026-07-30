import { browser } from '$app/environment'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'svelte-palette-demo-theme'

const systemTheme = (): Theme =>
	browser && window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

const storedTheme = (): Theme | null => {
	if (!browser) return null
	try {
		const value = localStorage.getItem(STORAGE_KEY)
		return value === 'light' || value === 'dark' ? value : null
	} catch {
		return null
	}
}

const applyTheme = (theme: Theme): void => {
	if (browser) document.documentElement.dataset.theme = theme
}

/*
 * Shared, reactive theme state. The chrome reads it through `getTheme()` and the
 * inline boot script in app.html paints the chrome's `data-theme` on <html>
 * before hydration, so the header never flashes the wrong scheme.
 *
 * SSR and the first client render can't know the resolved theme, so both use the
 * `light` default and `initTheme()` reconciles the store on mount — matching SSR
 * exactly, with no hydration mismatch.
 */
let current = $state<Theme>('light')
let initialized = $state(false)

export const getTheme = (): Theme => current

/*
 * Theme handed to each <Palette> as `data-palette-theme`. Before the store
 * initialises (SSR + first hydration render) we return `'auto'` so the library
 * follows the OS through its own `color-scheme` — this avoids a wrong-scheme
 * flash for dark-preference visitors while still matching the SSR markup. After
 * `initTheme()` it returns the explicit choice, so the header toggle drives every
 * palette in lockstep.
 */
export const getPaletteTheme = (): 'auto' | Theme => (initialized ? current : 'auto')

export const initTheme = (): (() => void) => {
	current = storedTheme() ?? systemTheme()
	initialized = true
	applyTheme(current)

	if (!browser) return () => {}

	const mql = window.matchMedia?.('(prefers-color-scheme: dark)')
	if (!mql) return () => {}

	const onChange = (event: MediaQueryListEvent) => {
		// Only follow the OS while the user has not made an explicit choice.
		if (storedTheme() === null) {
			current = event.matches ? 'dark' : 'light'
			applyTheme(current)
		}
	}
	mql.addEventListener('change', onChange)
	return () => mql.removeEventListener('change', onChange)
}

export const toggleTheme = (): void => {
	current = current === 'dark' ? 'light' : 'dark'
	try {
		localStorage.setItem(STORAGE_KEY, current)
	} catch {
		/* storage unavailable — keep the in-memory choice */
	}
	applyTheme(current)
}
