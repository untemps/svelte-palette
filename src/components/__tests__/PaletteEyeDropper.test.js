/**
 * @jest-environment jsdom
 */

import { fireEvent, render, waitFor } from '@testing-library/svelte'

import PaletteEyeDropper from '../PaletteEyeDropper.svelte'

describe('PaletteEyeDropper', () => {
	describe('EyeDropper API is not available', () => {
		it('Renders nothing', () => {
			const { queryByTestId } = render(PaletteEyeDropper)
			expect(queryByTestId('__eyedropper-icon__')).not.toBeInTheDocument()
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

		it('Sets button aria-label', () => {
			const { getByLabelText } = render(PaletteEyeDropper, { ariaLabel: 'foo' })
			expect(getByLabelText('foo')).toBeInTheDocument()
		})

		it('Retrieves color from EyeDropper selection', async () => {
			const onAdd = jest.fn()
			const { getByTestId, component } = render(PaletteEyeDropper)
			const button = getByTestId('__palette-eyedropper__')
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
			const { getByLabelText, component } = render(PaletteEyeDropper, { ariaLabel: 'foo' })
			const button = getByLabelText('foo')
			component.$on('error', onError)
			await fireEvent.click(button)
			await waitFor(() => expect(onError).toHaveBeenCalled())
		})
	})
})
