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
 * Shared, reactive theme state. Components read it through `getTheme()` so they
 * re-render on toggle, and each <Palette> is passed the value as
 * `data-palette-theme` to keep the library's dark mode in lockstep with the
 * showcase chrome. SSR and the first client render use the `light` default; the
 * inline boot script in app.html paints the correct attribute before hydration,
 * and `initTheme()` reconciles the store on mount without a hydration mismatch.
 */
let current = $state<Theme>('light')

export const getTheme = (): Theme => current

export const initTheme = (): (() => void) => {
	current = storedTheme() ?? systemTheme()
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
