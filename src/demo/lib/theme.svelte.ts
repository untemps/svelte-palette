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

let current = $state<Theme>('light')
let initialized = $state(false)

export const getTheme = (): Theme => current

export const getPaletteTheme = (): 'auto' | Theme => (initialized ? current : 'auto')

export const initTheme = (): (() => void) => {
	current = storedTheme() ?? systemTheme()
	initialized = true
	applyTheme(current)

	if (!browser) return () => {}

	const mql = window.matchMedia?.('(prefers-color-scheme: dark)')
	if (!mql) return () => {}

	const onChange = (event: MediaQueryListEvent) => {
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
	} catch {}
	applyTheme(current)
}
