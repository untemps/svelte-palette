import { afterEach, expect, test, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/svelte'

import PaletteCompactToggleButton from '../PaletteCompactToggleButton.svelte'

afterEach(() => cleanup())

test('Displays enlarge icon', () => {
	const isCompact = false
	render(PaletteCompactToggleButton, { isCompact })
	const button = screen.getByTestId('__compact-icon__')
	expect(button).toBeInTheDocument()
})

test('Displays compact icon', () => {
	const isCompact = true
	render(PaletteCompactToggleButton, { isCompact })
	const button = screen.getByTestId('__enlarge-icon__')
	expect(button).toBeInTheDocument()
})

test('Sets aria-label', () => {
	const ariaLabel = 'Foo'
	render(PaletteCompactToggleButton, { ['aria-label']: ariaLabel })
	const button = screen.getByLabelText(ariaLabel)
	expect(button).toBeInTheDocument()
})

test('Triggers click event with current state', async () => {
	const onClick = vi.fn(() => 0)
	const { component } = render(PaletteCompactToggleButton)
	component.$on('click', onClick)
	const button = screen.getByTestId('__palette-compact-toggle-button__')
	await fireEvent.click(button)
	expect(onClick).toHaveBeenCalledWith(new CustomEvent({ detail: { isCompact: true } }))
})
