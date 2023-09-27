import { afterEach, expect, test, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/svelte'

import PaletteEyeDropperButton from '../PaletteEyeDropperButton.svelte'

afterEach(() => cleanup())

window.EyeDropper = function () {
	this.open = () => Promise.resolve({ sRGBHex: '#ff0' })
}

test('Renders eye dropper button', async () => {
	render(PaletteEyeDropperButton)
	const button = await screen.findByTestId('__palette-eyedropper-button__')
	expect(button).toBeInTheDocument()
})

test('Sets eye dropper button aria-label', () => {
	const ariaLabel = 'Foo'
	render(PaletteEyeDropperButton, { ['aria-label']: ariaLabel })
	const button = screen.getByLabelText(ariaLabel)
	expect(button).toBeInTheDocument()
})

test('Retrieves color from EyeDropper selection', async () => {
	const onAdd = vi.fn()
	const { component } = render(PaletteEyeDropperButton)
	const button = screen.getByTestId('__palette-eyedropper-button__')
	component.$on('add', onAdd)
	await fireEvent.click(button)
	await waitFor(() => expect(onAdd).toHaveBeenCalledWith(new CustomEvent({ detail: { color: '#ff0' } })))
})

// EyeDropper API is invalid
test('Throws error', async () => {
	window.EyeDropper = function () {
		this.open = () => {
			throw new Error('Error')
		}
	}

	const onError = vi.fn(() => 0)
	const ariaLabel = 'Foo'
	const { component } = render(PaletteEyeDropperButton, { ['aria-label']: ariaLabel })
	const button = screen.getByLabelText(ariaLabel)
	component.$on('error', onError)
	await fireEvent.click(button)
	await waitFor(() => expect(onError).toHaveBeenCalled())
})

// EyeDropper API is not available
test('Renders nothing', async () => {
	window.EyeDropper = null
	render(PaletteEyeDropperButton)
	try {
		await screen.findByTestId('__palette-eyedropper-button__')
	} catch (e) {
		expect(e).not.toBeUndefined()
	}
})
