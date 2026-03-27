import { afterEach, expect, test, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/svelte/svelte5'
import userEvent from '@testing-library/user-event'
import type { Component } from 'svelte'

import { COMPACT } from '../../enums/PaletteIcon'

import PaletteIconButton from '../PaletteIconButton.svelte'

const setup = (component: Component, options?: Record<string, unknown>) => {
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
	const { user } = setup(PaletteIconButton, { props: { icon: COMPACT, onclick: onClick } })
	const button = screen.getByTestId('__palette-icon-button__')
	await user.click(button)
	expect(onClick).toHaveBeenCalled()
})

test('Attaches active class when isActive is true', () => {
	setup(PaletteIconButton, { props: { icon: COMPACT, isActive: true } })
	const button = screen.getByTestId('__palette-icon-button__')
	expect(button).toHaveClass('icon_button__button--active')
})

test('Applies custom class when class prop is set', () => {
	setup(PaletteIconButton, { props: { class: 'custom-class' } })
	const button = screen.getByTestId('__palette-icon-button__')
	expect(button).toHaveClass('custom-class')
})
