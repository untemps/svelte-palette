import { afterEach, expect, test, vi } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/svelte/svelte5'
import userEvent from '@testing-library/user-event'

import PaletteInput from '../PaletteInput.svelte'

const setup = (component: Parameters<typeof render>[0], options?: Parameters<typeof render>[1]) => {
	return {
		user: userEvent.setup(),
		...render(component, options),
	}
}

// Each test installs its own EyeDropper stub; vi.unstubAllGlobals() restores the
// jsdom baseline (no EyeDropper at all) so no test depends on the order of the others.
const stubEyeDropper = (sRGBHex: string) =>
	vi.stubGlobal(
		'EyeDropper',
		class {
			open = () => Promise.resolve({ sRGBHex })
		}
	)

afterEach(() => {
	cleanup()
	vi.unstubAllGlobals()
})

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

test('Prevents native form submission to avoid a page reload', async () => {
	const { container } = setup(PaletteInput, { props: { color: '#ff0' } })
	const form = container.querySelector('form') as HTMLFormElement
	const event = new Event('submit', { bubbles: true, cancelable: true })
	form.dispatchEvent(event)
	expect(event.defaultPrevented).toBe(true)
})

test('Does not render the eyedropper as a submit button', async () => {
	stubEyeDropper('#ff0')
	setup(PaletteInput)
	const button = await screen.findByTestId('__palette-eyedropper-button__')
	expect(button).toHaveAttribute('type', 'button')
})

test('Does not render the add button as a submit button', async () => {
	setup(PaletteInput)
	const button = screen.getByTestId('__palette-input-submit__')
	expect(button).toHaveAttribute('type', 'button')
})

test('Triggers submit with color when clicking add button', async () => {
	const onAdd = vi.fn(() => 0)
	const { user } = setup(PaletteInput, { props: { onadd: onAdd } })
	const input = screen.getByTestId('__palette-input-input__')
	const button = screen.getByTestId('__palette-input-submit__')
	await user.type(input, 'ff0')
	await user.click(button)
	expect(onAdd).toHaveBeenCalledWith({ color: '#ff0' })
})

test('Triggers submit with color when pressing Enter', async () => {
	const onAdd = vi.fn(() => 0)
	const { user } = setup(PaletteInput, { props: { onadd: onAdd } })
	const input = screen.getByTestId('__palette-input-input__')
	await user.type(input, 'ff0')
	await user.keyboard('[Enter]')
	expect(onAdd).toHaveBeenCalledWith({ color: '#ff0' })
})

test('Triggers submit with color when pressing Enter on the numeric keypad', async () => {
	// The numeric-keypad Enter reports key="Enter" but code="NumpadEnter"; the handler must key off `key`.
	const onAdd = vi.fn(() => 0)
	const { user } = setup(PaletteInput, { props: { onadd: onAdd } })
	const input = screen.getByTestId('__palette-input-input__')
	await user.type(input, 'ff0')
	input.dispatchEvent(new KeyboardEvent('keypress', { key: 'Enter', code: 'NumpadEnter', bubbles: true }))
	expect(onAdd).toHaveBeenCalledWith({ color: '#ff0' })
})

test('Does not submit when pressing Enter with an invalid color', async () => {
	const onAdd = vi.fn(() => 0)
	const { user } = setup(PaletteInput, { props: { onadd: onAdd } })
	const input = screen.getByTestId('__palette-input-input__')
	await user.type(input, 'zz')
	await user.keyboard('[Enter]')
	expect(onAdd).not.toHaveBeenCalled()
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
	vi.stubGlobal('EyeDropper', undefined)
	setup(PaletteInput, {
		color: 'ff',
		inputType: 'foo',
	})
	const button = screen.queryByTestId('__palette-eyedropper-button__')
	expect(button).not.toBeInTheDocument()
})

test('Updates input value with color from eyedropper', async () => {
	stubEyeDropper('#ff0')
	const { user } = setup(PaletteInput)
	const button = await screen.findByTestId('__palette-eyedropper-button__')
	await user.click(button)
	const input = screen.getByTestId('__palette-input-input__')
	await waitFor(() => expect(input).toHaveValue('#ff0'))
})
