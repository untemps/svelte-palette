import { afterEach, expect, test, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/svelte/svelte5'
import userEvent from '@testing-library/user-event'

import PaletteSettingsButton from '../PaletteSettingsButton.svelte'

const setup = (component, options) => {
	return {
		user: userEvent.setup(),
		...render(component, options),
	}
}

afterEach(() => cleanup())

test('Renders with correct data-testid', () => {
	setup(PaletteSettingsButton)
	const button = screen.getByTestId('__palette-settings-button__')
	expect(button).toBeInTheDocument()
})

test('Renders with correct aria-label', () => {
	setup(PaletteSettingsButton)
	const button = screen.getByLabelText('Go to settings')
	expect(button).toBeInTheDocument()
})

test('Calls onclick when clicked', async () => {
	const onClick = vi.fn(() => 0)
	const { user } = setup(PaletteSettingsButton, { props: { onclick: onClick } })
	const button = screen.getByTestId('__palette-settings-button__')
	await user.click(button)
	expect(onClick).toHaveBeenCalled()
})
