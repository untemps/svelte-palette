import { jest } from '@jest/globals'
import { fireEvent, render } from '@testing-library/svelte'
import { standby } from '@untemps/utils/async/standby'

import PaletteInput from '../PaletteInput.svelte'

describe('PaletteInput', () => {
	it('Enables submit button when input color is valid', async () => {
		const { getByTestId, getByRole } = render(PaletteInput)
		const input = getByTestId('__palette-input-input__')
		const button = getByRole('button')
		await standby()
		expect(button).toBeDisabled()
		await fireEvent.input(input, { target: { value: 'ff' } })
		expect(button).toBeDisabled()
		await fireEvent.input(input, { target: { value: 'ff0' } })
		expect(button).toBeEnabled()
	})

	it('Enables submit button when set color is valid', async () => {
		const { getByTestId } = render(PaletteInput, {
			color: '#ff0',
		})
		const button = getByTestId('__palette-input-submit__')
		expect(button).toBeEnabled()
	})

	it('Disables submit button when set color is invalid', async () => {
		const { getByTestId } = render(PaletteInput, {
			color: 'ff',
		})
		const button = getByTestId('__palette-input-submit__')
		expect(button).toBeDisabled()
	})

	it('Triggers submit with color', async () => {
		const onAdd = jest.fn()
		const { getByTestId, component } = render(PaletteInput)
		const input = getByTestId('__palette-input-input__')
		const button = getByTestId('__palette-input-submit__')
		component.$on('add', onAdd)
		await fireEvent.input(input, { target: { value: 'ff0' } })
		await fireEvent.click(button)
		expect(onAdd).toHaveBeenCalledWith(new CustomEvent({ detail: { color: '#ff0' } }))
	})

	it('Does not display slot if inputType is "color"', async () => {
		const { queryByTestId } = render(PaletteInput, {
			color: 'ff',
			inputType: 'color',
		})
		const button = queryByTestId('__palette-input-slot__')
		expect(button).not.toBeInTheDocument()
	})

	it('Does not display EyeDropper button if API is not available', async () => {
		window.EyeDropper = undefined
		const { queryByTestId } = render(PaletteInput, {
			color: 'ff',
		})
		const button = queryByTestId('__palette-eyedropper-button__')
		expect(button).not.toBeInTheDocument()
	})

	describe('EyeDropper API is not available', () => {
		beforeAll(() => {
			window.EyeDropper = function () {
				this.open = () => Promise.resolve({ sRGBHex: '#ff0' })
			}
		})

		afterAll(() => {
			window.EyeDropper = undefined
		})

		it('Displays EyeDropper button if API is available', async () => {
			const { queryByTestId } = render(PaletteInput, {
				color: 'ff',
			})
			const button = queryByTestId('__palette-eyedropper-button__')
			expect(button).toBeInTheDocument()
		})

		it('Does not display EyeDropper button if inputType is "color"', async () => {
			const { queryByTestId } = render(PaletteInput, {
				color: 'ff',
				inputType: 'color',
			})
			const button = queryByTestId('__palette-eyedropper-button__')
			expect(button).not.toBeInTheDocument()
		})

		it('retrieves color from EyeDropper selection', async () => {
			const onAdd = jest.fn()
			const { getByTestId, component } = render(PaletteInput, {
				color: 'ff',
			})
			const submitButton = getByTestId('__palette-input-submit__')
			const eyeDropperButton = getByTestId('__palette-eyedropper-button__')
			component.$on('add', onAdd)
			await fireEvent.click(eyeDropperButton)
			await fireEvent.click(submitButton)
			expect(onAdd).toHaveBeenCalledWith(new CustomEvent({ detail: { color: '#ff0' } }))
		})
	})
})
