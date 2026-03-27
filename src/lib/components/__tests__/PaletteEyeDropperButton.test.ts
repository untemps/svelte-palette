import { afterEach, expect, test, vi } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/svelte/svelte5'
import userEvent from '@testing-library/user-event'
import type { Component } from 'svelte'

import PaletteEyeDropperButton from '../PaletteEyeDropperButton.svelte'

const setup = (component: Component, options?: Record<string, unknown>) => {
	return {
		user: userEvent.setup(),
		...render(component, options),
	}
}

afterEach(() => cleanup())

window.EyeDropper = function (this: EyeDropper) {
	this.open = () => Promise.resolve({ sRGBHex: '#ff0' })
} as unknown as typeof EyeDropper

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
	const { user } = setup(PaletteEyeDropperButton, { props: { onadd: onAdd } })
	const button = screen.getByTestId('__palette-eyedropper-button__')
	await user.click(button)
	await waitFor(() => expect(onAdd).toHaveBeenCalledWith({ color: '#ff0' }))
})

test('Normalizes rgb color from EyeDropper selection to hex', async () => {
	window.EyeDropper = function (this: EyeDropper) {
		this.open = () => Promise.resolve({ sRGBHex: 'rgb(255, 0, 0)' })
	} as unknown as typeof EyeDropper
	const onAdd = vi.fn()
	const { user } = setup(PaletteEyeDropperButton, { props: { onadd: onAdd } })
	const button = screen.getByTestId('__palette-eyedropper-button__')
	await user.click(button)
	await waitFor(() => expect(onAdd).toHaveBeenCalledWith({ color: '#ff0000' }))
})

test('Normalizes rgba color from EyeDropper selection to hex', async () => {
	window.EyeDropper = function (this: EyeDropper) {
		this.open = () => Promise.resolve({ sRGBHex: 'rgba(0, 128, 0, 1)' })
	} as unknown as typeof EyeDropper
	const onAdd = vi.fn()
	const { user } = setup(PaletteEyeDropperButton, { props: { onadd: onAdd } })
	const button = screen.getByTestId('__palette-eyedropper-button__')
	await user.click(button)
	await waitFor(() => expect(onAdd).toHaveBeenCalledWith({ color: '#008000' }))
})

test('Does not throw when no onadd handler is provided', async () => {
	window.EyeDropper = function (this: EyeDropper) {
		this.open = () => Promise.resolve({ sRGBHex: '#ff0' })
	} as unknown as typeof EyeDropper
	const { user } = setup(PaletteEyeDropperButton)
	const button = screen.getByTestId('__palette-eyedropper-button__')
	await user.click(button)
	// onadd is undefined → onadd?.() short-circuits without error
})

// EyeDropper API is invalid
test('Throws error', async () => {
	window.EyeDropper = function (this: EyeDropper) {
		this.open = () => {
			throw new Error('Error')
		}
	} as unknown as typeof EyeDropper

	const onError = vi.fn(() => 0)
	const ariaLabel = 'Foo'
	const { user } = setup(PaletteEyeDropperButton, {
		props: { ['aria-label']: ariaLabel, onerror: onError },
	})
	const button = screen.getByLabelText(ariaLabel)
	await user.click(button)
	await waitFor(() => expect(onError).toHaveBeenCalled())
})

// EyeDropper API is not available
test('Renders nothing', async () => {
	window.EyeDropper = null as unknown as typeof EyeDropper
	setup(PaletteEyeDropperButton)
	try {
		await screen.findByTestId('__palette-eyedropper-button__')
	} catch (e) {
		expect(e).not.toBeUndefined()
	}
})
