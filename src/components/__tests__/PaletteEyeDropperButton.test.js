import { jest } from '@jest/globals'
import { fireEvent, render, waitFor } from '@testing-library/svelte'

import PaletteEyeDropperButton from '../PaletteEyeDropperButton.svelte'

describe('PaletteEyeDropperButton', () => {
	describe('EyeDropper API is not available', () => {
		it('Renders nothing', () => {
			const { queryByTestId } = render(PaletteEyeDropperButton)
			expect(queryByTestId('__palette-eyedropper-button__')).not.toBeInTheDocument()
		})
	})

	describe('EyeDropper API is available', () => {
		beforeAll(() => {
			window.EyeDropper = function () {
				this.open = () => Promise.resolve({ sRGBHex: '#ff0' })
			}
		})

		afterAll(() => {
			window.EyeDropper = undefined
		})

		it('Renders eye dropper button', () => {
			const { getByTestId } = render(PaletteEyeDropperButton)
			expect(getByTestId('__palette-eyedropper-button__')).toBeInTheDocument()
		})

		it('Sets eye dropper button aria-label', () => {
			const ariaLabel = 'Foo'
			const { getByLabelText } = render(PaletteEyeDropperButton, { ['aria-label']: ariaLabel })
			expect(getByLabelText(ariaLabel)).toBeInTheDocument()
		})

		it('Retrieves color from EyeDropper selection', async () => {
			const onAdd = jest.fn()
			const { getByTestId, component } = render(PaletteEyeDropperButton)
			const button = getByTestId('__palette-eyedropper-button__')
			component.$on('add', onAdd)
			await fireEvent.click(button)
			await waitFor(() => expect(onAdd).toHaveBeenCalledWith(new CustomEvent({ detail: { color: '#ff0' } })))
		})
	})

	describe('EyeDropper API is invalid', () => {
		beforeAll(() => {
			window.EyeDropper = {}
		})

		afterAll(() => {
			window.EyeDropper = undefined
		})

		it('Throws error', async () => {
			const onError = jest.fn()
			const ariaLabel = 'Foo'
			const { getByLabelText, component } = render(PaletteEyeDropperButton, { ['aria-label']: ariaLabel })
			const button = getByLabelText(ariaLabel)
			component.$on('error', onError)
			await fireEvent.click(button)
			await waitFor(() => expect(onError).toHaveBeenCalled())
		})
	})
})
