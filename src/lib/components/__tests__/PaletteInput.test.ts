import { render, screen, waitFor } from '@testing-library/svelte/svelte5'
import userEvent from '@testing-library/user-event'

import PaletteInput from '../PaletteInput.svelte'

const setup = (component: Parameters<typeof render>[0], options?: Parameters<typeof render>[1]) => {
	return {
		user: userEvent.setup(),
		...render(component, options),
	}
}

// Each test installs its own EyeDropper stub; the config's `unstubGlobals: true`
// restores the jsdom baseline (no EyeDropper at all) before every test, so no test
// depends on the order of the others.
const stubEyeDropper = (sRGBHex: string) =>
	vi.stubGlobal(
		'EyeDropper',
		class {
			open = () => Promise.resolve({ sRGBHex })
		}
	)

test('Enables submit button when input color is valid', async () => {
	const { user } = setup(PaletteInput)
	const input = screen.getByTestId('__palette-input-input__')
	const button = screen.getByRole('button')
	expect(button).toBeDisabled()
	await user.type(input, 'ff')
	expect(button).toBeDisabled()
	await user.type(input, 'ff00')
	await waitFor(() => expect(button).toBeEnabled())
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

test('Inherits the default eyedropper accessible name', async () => {
	stubEyeDropper('#ff0')
	setup(PaletteInput)
	const button = await screen.findByRole('button', { name: 'Pick a color from the screen' })
	expect(button).toBeInTheDocument()
})

test('Names the hex input and submit button with default labels', () => {
	setup(PaletteInput)
	const input = screen.getByTestId('__palette-input-input__')
	expect(input).toHaveAttribute('aria-label', 'Enter an hex color value')
	// The validation hint carries no stray quotes (#251).
	expect(input).toHaveAttribute('title', 'The value must be a valid hex color')
	expect(screen.getByTestId('__palette-input-submit__')).toHaveAttribute('aria-label', 'Submit the hex color value')
})

test('Names the hex input, its title and the submit button with custom labels', () => {
	setup(PaletteInput, {
		props: {
			hexLabel: 'Saisir une couleur hexadécimale',
			hexErrorLabel: 'La valeur doit être une couleur hexadécimale valide',
			submitLabel: 'Ajouter la couleur',
		},
	})
	const input = screen.getByTestId('__palette-input-input__')
	expect(input).toHaveAttribute('aria-label', 'Saisir une couleur hexadécimale')
	expect(input).toHaveAttribute('title', 'La valeur doit être une couleur hexadécimale valide')
	expect(screen.getByTestId('__palette-input-submit__')).toHaveAttribute('aria-label', 'Ajouter la couleur')
})

test('Names the eyedropper button with a custom label', async () => {
	stubEyeDropper('#ff0')
	setup(PaletteInput, { props: { eyeDropperLabel: "Prélever une couleur à l'écran" } })
	const button = await screen.findByRole('button', { name: "Prélever une couleur à l'écran" })
	expect(button).toBeInTheDocument()
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

test('Replaces an unsupported but valid input type with "text"', async () => {
	// `number` is a real HTML input type, so without sanitization it would reach the DOM
	// verbatim and render a number spinner. The documented contract only allows text/color.
	setup(PaletteInput, {
		color: '#ff0',
		inputType: 'number',
	})
	const input = screen.getByTestId('__palette-input-input__')
	expect(input).toHaveAttribute('type', 'text')
	// The preview slot is gated on the text branch, so it must still render.
	expect(screen.getByTestId('__palette-input-slot__')).toBeInTheDocument()
})

test('Hides the decorative preview swatch from the accessibility tree', async () => {
	// The swatch is purely decorative; `role="presentation"` would be ignored because
	// PaletteSlot always carries a global `aria-label`, so it must use `aria-hidden` to
	// actually leave the accessibility tree. This attribute is the load-bearing assertion:
	// it is absent on the old `role="presentation"` markup, so this test fails against it.
	setup(PaletteInput, { color: '#ff0' })
	const slot = screen.getByTestId('__palette-input-slot__')
	expect(slot).toHaveAttribute('aria-hidden', 'true')
	// Sanity check that the preview is not exposed as a second button beside the submit
	// control. jsdom already excluded the old presentation-role swatch here (it does not
	// model the browser-only presentational-conflict rule), so this guards the new
	// behaviour rather than reproducing the original leak.
	expect(screen.queryAllByRole('button')).toEqual([screen.getByTestId('__palette-input-submit__')])
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
