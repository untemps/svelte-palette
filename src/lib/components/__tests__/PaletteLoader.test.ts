import { render, screen } from '@testing-library/svelte/svelte5'

import PaletteLoader from '../PaletteLoader.svelte'

test('Exposes a live status region', () => {
	render(PaletteLoader)
	expect(screen.getByRole('status')).toBeInTheDocument()
})

test('Announces the default loading label', () => {
	render(PaletteLoader)
	expect(screen.getByRole('status')).toHaveTextContent('Loading colors')
})

test('Announces a custom loading label', () => {
	render(PaletteLoader, { props: { label: 'Chargement des couleurs' } })
	expect(screen.getByRole('status')).toHaveTextContent('Chargement des couleurs')
})

test('Hides the spinner graphic from assistive tech', () => {
	const { container } = render(PaletteLoader)
	const spinner = container.querySelector('.palette__loader__spinner')
	expect(spinner).toHaveAttribute('aria-hidden', 'true')
})
