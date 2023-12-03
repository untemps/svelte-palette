import { afterEach, expect, test, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'

import PaletteCompactToggleButton from '../PaletteCompactToggleButton.svelte'

const setup = (component, options) => {
	return {
		user: userEvent.setup(),
		...render(component, options),
	}
}

afterEach(() => cleanup())

test('Displays enlarge icon', () => {
	const isCompact = false
	setup(PaletteCompactToggleButton, { isCompact })
	const button = screen.getByTestId('__compact-icon__')
	expect(button).toBeInTheDocument()
})

test('Displays compact icon', () => {
	const isCompact = true
	setup(PaletteCompactToggleButton, { isCompact })
	const button = screen.getByTestId('__enlarge-icon__')
	expect(button).toBeInTheDocument()
})

test('Sets aria-label', () => {
	const ariaLabel = 'Foo'
	setup(PaletteCompactToggleButton, { ['aria-label']: ariaLabel })
	const button = screen.getByLabelText(ariaLabel)
	expect(button).toBeInTheDocument()
})

test('Triggers click event with current state', async () => {
	const onClick = vi.fn(() => 0)
	const { component, user } = setup(PaletteCompactToggleButton)
	component.$on('click', onClick)
	const button = screen.getByTestId('__palette-compact-toggle-button__')
	await user.click(button)
	expect(onClick).toHaveBeenCalledWith(new CustomEvent({ detail: { isCompact: true } }))
})
