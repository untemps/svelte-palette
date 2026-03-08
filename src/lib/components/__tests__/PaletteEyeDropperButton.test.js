import { afterEach, expect, test, vi } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/svelte/svelte5'
import userEvent from '@testing-library/user-event'

import PaletteEyeDropperButton from '../PaletteEyeDropperButton.svelte'

const setup = (component, options) => {
	return {
		user: userEvent.setup(),
		...render(component, options),
	}
}

afterEach(() => cleanup())

window.EyeDropper = function () {
	this.open = () => Promise.resolve({ sRGBHex: '#ff0' })
}

test('Renders eye dropper button', async () => {
	setup(PaletteEyeDropperButton)
	const button = await screen.findByTestId('__palette-eyedropper-button__')
	expect(button).toBeInTheDocument()
})

test('Sets eye dropper button aria-label', () => {
	const ariaLabel = 'Foo'
	setup(PaletteEyeDropperButton, { ['aria-label']: ariaLabel })
	const button = screen.getByLabelText(ariaLabel)
	expect(button).toBeInTheDocument()
})

test('Retrieves color from EyeDropper selection', async () => {
	const onAdd = vi.fn()
	const { user } = setup(PaletteEyeDropperButton, { events: { add: onAdd } })
	const button = screen.getByTestId('__palette-eyedropper-button__')
	await user.click(button)
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
	const { user } = setup(PaletteEyeDropperButton, {
		props: { ['aria-label']: ariaLabel },
		events: { error: onError },
	})
	const button = screen.getByLabelText(ariaLabel)
	await user.click(button)
	await waitFor(() => expect(onError).toHaveBeenCalled())
})

// EyeDropper API is not available
test('Renders nothing', async () => {
	window.EyeDropper = null
	setup(PaletteEyeDropperButton)
	try {
		await screen.findByTestId('__palette-eyedropper-button__')
	} catch (e) {
		expect(e).not.toBeUndefined()
	}
})
