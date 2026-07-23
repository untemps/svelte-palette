import { afterEach, expect, test, vi } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/svelte/svelte5'
import userEvent from '@testing-library/user-event'

import PaletteEyeDropperButton from '../PaletteEyeDropperButton.svelte'

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

const stubEyeDropperThrowing = () =>
	vi.stubGlobal(
		'EyeDropper',
		class {
			open = () => {
				throw new Error('Error')
			}
		}
	)

afterEach(() => {
	cleanup()
	vi.unstubAllGlobals()
})

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
	stubEyeDropper('#ff0')
	const onAdd = vi.fn()
	const { user } = setup(PaletteEyeDropperButton, { props: { onadd: onAdd } })
	const button = screen.getByTestId('__palette-eyedropper-button__')
	await user.click(button)
	await waitFor(() => expect(onAdd).toHaveBeenCalledWith({ color: '#ff0' }))
})

test('Normalizes rgb color from EyeDropper selection to hex', async () => {
	stubEyeDropper('rgb(255, 0, 0)')
	const onAdd = vi.fn()
	const { user } = setup(PaletteEyeDropperButton, { props: { onadd: onAdd } })
	const button = screen.getByTestId('__palette-eyedropper-button__')
	await user.click(button)
	await waitFor(() => expect(onAdd).toHaveBeenCalledWith({ color: '#ff0000' }))
})

test('Normalizes rgba color from EyeDropper selection to hex', async () => {
	stubEyeDropper('rgba(0, 128, 0, 1)')
	const onAdd = vi.fn()
	const { user } = setup(PaletteEyeDropperButton, { props: { onadd: onAdd } })
	const button = screen.getByTestId('__palette-eyedropper-button__')
	await user.click(button)
	await waitFor(() => expect(onAdd).toHaveBeenCalledWith({ color: '#008000' }))
})

// EyeDropper API is invalid
test('Throws error', async () => {
	stubEyeDropperThrowing()
	const onError = vi.fn(() => 0)
	const ariaLabel = 'Foo'
	const { user } = setup(PaletteEyeDropperButton, {
		props: { ['aria-label']: ariaLabel, onerror: onError },
	})
	const button = screen.getByLabelText(ariaLabel)
	await user.click(button)
	await waitFor(() => expect(onError).toHaveBeenCalled())
})

// The component only touches the EyeDropper API on click: availability gating
// lives in PaletteInput, so the button itself renders even without the API.
test('Renders even when the EyeDropper API is not available', () => {
	vi.stubGlobal('EyeDropper', undefined)
	setup(PaletteEyeDropperButton)
	expect(screen.getByTestId('__palette-eyedropper-button__')).toBeInTheDocument()
})
