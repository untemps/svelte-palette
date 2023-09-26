import { afterEach, expect, test, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/svelte'

import { COMPACT } from '../../enums/PaletteIcon'

import PaletteIconButton from '../PaletteIconButton.svelte'

afterEach(() => cleanup())

test('Renders nothing', () => {
	render(PaletteIconButton)
	const button = screen.getByTestId('__palette-icon-button__')
	expect(button).toBeEmptyDOMElement()
})

test('Displays icon', () => {
	render(PaletteIconButton, { icon: COMPACT })
	const button = screen.getByTestId('__palette-icon-button__')
	const icon = screen.getByTestId('__compact-icon__')
	expect(button).not.toBeEmptyDOMElement()
	expect(icon).toBeInTheDocument()
})

test('Triggers click event', async () => {
	const onClick = vi.fn()
	const { component } = render(PaletteIconButton, { icon: COMPACT })
	component.$on('click', onClick)
	const button = screen.getByTestId('__palette-icon-button__')
	await fireEvent.click(button)
	expect(onClick).toHaveBeenCalled()
})
