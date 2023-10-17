import { afterEach, expect, test, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/svelte'
import { standby } from '@untemps/utils/async/standby'

import PaletteInput from '../PaletteInput.svelte'

afterEach(() => cleanup())
test('Enables submit button when input color is valid', async () => {
	render(PaletteInput)
	const input = screen.getByTestId('__palette-input-input__')
	const button = screen.getByRole('button')
	await standby()
	expect(button).toBeDisabled()
	await fireEvent.input(input, { target: { value: 'ff' } })
	expect(button).toBeDisabled()
	await fireEvent.input(input, { target: { value: 'ff0' } })
	expect(button).toBeEnabled()
})

test('Enables submit button when set color is valid', async () => {
	render(PaletteInput, {
		color: '#ff0',
	})
	const button = screen.getByTestId('__palette-input-submit__')
	expect(button).toBeEnabled()
})

test('Disables submit button when set color is invalid', async () => {
	render(PaletteInput, {
		color: 'ff',
	})
	const button = screen.getByTestId('__palette-input-submit__')
	expect(button).toBeDisabled()
})

test('Triggers submit with color', async () => {
	const onAdd = vi.fn(() => 0)
	const { component } = render(PaletteInput)
	const input = screen.getByTestId('__palette-input-input__')
	const button = screen.getByTestId('__palette-input-submit__')
	component.$on('add', onAdd)
	await fireEvent.input(input, { target: { value: 'ff0' } })
	await fireEvent.click(button)
	expect(onAdd).toHaveBeenCalledWith(new CustomEvent({ detail: { color: '#ff0' } }))
})

test('Does not display slot if inputType is "color"', async () => {
	render(PaletteInput, {
		color: 'ff',
		inputType: 'color',
	})
	const button = screen.queryByTestId('__palette-input-slot__')
	expect(button).not.toBeInTheDocument()
})

test('Does not display EyeDropper button if API is not available', async () => {
	window.EyeDropper = undefined
	render(PaletteInput, {
		color: 'ff',
	})
	const button = screen.queryByTestId('__palette-eyedropper-button__')
	expect(button).not.toBeInTheDocument()
})
