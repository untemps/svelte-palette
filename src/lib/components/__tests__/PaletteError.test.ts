import { render, screen } from '@testing-library/svelte/svelte5'

import PaletteError from '../PaletteError.svelte'

test('Exposes an assertive live region', () => {
	render(PaletteError)
	expect(screen.getByRole('alert')).toBeInTheDocument()
})

test('Announces the default error label', () => {
	render(PaletteError)
	expect(screen.getByRole('alert')).toHaveTextContent('Colors failed to load')
})

test('Announces a custom error label', () => {
	render(PaletteError, { props: { label: 'Échec du chargement des couleurs' } })
	expect(screen.getByRole('alert')).toHaveTextContent('Échec du chargement des couleurs')
})

test('Renders the message of an Error instance', () => {
	render(PaletteError, { props: { error: new Error('Failed to fetch') } })
	expect(screen.getByRole('alert')).toHaveTextContent('Failed to fetch')
})

test('Renders a non-Error rejection reason as text', () => {
	render(PaletteError, { props: { error: 'Network down' } })
	expect(screen.getByRole('alert')).toHaveTextContent('Network down')
})

test('Renders only the label when no error is provided', () => {
	const { container } = render(PaletteError)
	expect(container.querySelector('.palette__error__message')).not.toBeInTheDocument()
})

test('Does not surface "[object Object]" for an opaque object reason', () => {
	const { container } = render(PaletteError, { props: { error: { code: 500 } } })
	expect(screen.getByRole('alert')).not.toHaveTextContent('[object Object]')
	expect(container.querySelector('.palette__error__message')).not.toBeInTheDocument()
})

test('Surfaces the statusText of a response-like reason', () => {
	render(PaletteError, { props: { error: { status: 503, statusText: 'Service Unavailable' } } })
	expect(screen.getByRole('alert')).toHaveTextContent('Service Unavailable')
})

test('Hides the error icon from assistive tech', () => {
	const { container } = render(PaletteError)
	const icon = container.querySelector('.palette__error__icon')
	expect(icon).toHaveAttribute('aria-hidden', 'true')
})
