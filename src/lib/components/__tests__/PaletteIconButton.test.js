import { afterEach, expect, test, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'

import { COMPACT } from '../../enums/PaletteIcon'

import PaletteIconButton from '../PaletteIconButton.svelte'

const setup = (component, options) => {
	return {
		user: userEvent.setup(),
		...render(component, options),
	}
}

afterEach(() => cleanup())

test('Renders nothing', () => {
	setup(PaletteIconButton)
	const button = screen.getByTestId('__palette-icon-button__')
	expect(button).toBeEmptyDOMElement()
})

test('Displays icon', () => {
	setup(PaletteIconButton, { icon: COMPACT })
	const button = screen.getByTestId('__palette-icon-button__')
	expect(button).not.toBeEmptyDOMElement()
})

test('Triggers click event', async () => {
	const onClick = vi.fn(() => 0)
	const { component, user } = setup(PaletteIconButton, { icon: COMPACT })
	component.$on('click', onClick)
	const button = screen.getByTestId('__palette-icon-button__')
	await user.click(button)
	expect(onClick).toHaveBeenCalled()
})
