import { afterEach, expect, test, vi } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'

import PaletteInput from '../PaletteInput.svelte'

const setup = (component, options) => {
	return {
		user: userEvent.setup(),
		...render(component, options),
	}
}

afterEach(() => cleanup())

test('Enables submit button when input color is valid', async () => {
	const { user } = setup(PaletteInput)
	const input = screen.getByTestId('__palette-input-input__')
	const button = screen.getByRole('button')
	expect(button).toBeDisabled()
	await user.type(input, 'ff')
	expect(button).toBeDisabled()
	await user.type(input, 'ff0')
	waitFor(() => expect(button).toBeEnabled())
})

test('Enables submit button when set color is valid', async () => {
	setup(PaletteInput, {
		color: '#ff0',
	})
	const button = screen.getByTestId('__palette-input-submit__')
	expect(button).toBeEnabled()
})

test('Disables submit button when set color is invalid', async () => {
	setup(PaletteInput, {
		color: 'ff',
	})
	const button = screen.getByTestId('__palette-input-submit__')
	expect(button).toBeDisabled()
})

test('Triggers submit with color when clicking add button', async () => {
	const onAdd = vi.fn(() => 0)
	const { component, user } = setup(PaletteInput)
	const input = screen.getByTestId('__palette-input-input__')
	const button = screen.getByTestId('__palette-input-submit__')
	component.$on('add', onAdd)
	await user.type(input, 'ff0')
	await user.click(button)
	expect(onAdd).toHaveBeenCalledWith(new CustomEvent({ detail: { color: '#ff0' } }))
})

test('Triggers submit with color when pressing Enter', async () => {
	const onAdd = vi.fn(() => 0)
	const { component, user } = setup(PaletteInput)
	const input = screen.getByTestId('__palette-input-input__')
	component.$on('add', onAdd)
	await user.type(input, 'ff0')
	await user.keyboard('[Enter]')
	expect(onAdd).toHaveBeenCalledWith(new CustomEvent({ detail: { color: '#ff0' } }))
})

test('Does not display slot if inputType is "color"', async () => {
	setup(PaletteInput, {
		color: 'ff',
		inputType: 'color',
	})
	const button = screen.queryByTestId('__palette-input-slot__')
	expect(button).not.toBeInTheDocument()
})

test('Does not display EyeDropper button if API is not available', async () => {
	window.EyeDropper = undefined
	setup(PaletteInput, {
		color: 'ff',
		inputType: 'foo',
	})
	const button = screen.queryByTestId('__palette-eyedropper-button__')
	expect(button).not.toBeInTheDocument()
})
