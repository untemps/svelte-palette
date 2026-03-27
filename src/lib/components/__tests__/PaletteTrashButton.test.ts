import { afterEach, expect, test, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/svelte/svelte5'
import userEvent from '@testing-library/user-event'
import type { Component } from 'svelte'

import PaletteTrashButton from '../PaletteTrashButton.svelte'

const setup = (component: Component, options?: Record<string, unknown>) => {
	return {
		user: userEvent.setup(),
		...render(component, options),
	}
}

afterEach(() => cleanup())

test('Renders trash button', () => {
	setup(PaletteTrashButton)
	const button = screen.getByTestId('__palette-trash-button__')
	expect(button).toBeInTheDocument()
})

test('Triggers click event', async () => {
	const onClick = vi.fn(() => 0)
	const { user } = setup(PaletteTrashButton, { props: { onclick: onClick } })
	const button = screen.getByTestId('__palette-trash-button__')
	await user.click(button)
	expect(onClick).toHaveBeenCalled()
})

test('Attaches active class when isActive is true', () => {
	setup(PaletteTrashButton, { props: { isActive: true } })
	const button = screen.getByTestId('__palette-trash-button__')
	expect(button).toHaveClass('icon_button__button--active')
})
