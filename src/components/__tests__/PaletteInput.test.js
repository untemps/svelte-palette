/**
 * @jest-environment jsdom
 */

import { fireEvent, getByRole, render } from '@testing-library/svelte'

import PaletteInput from '../PaletteInput.svelte'

describe('PaletteInput', () => {
	it('Sets aria labels', () => {
		const { getByLabelText } = render(PaletteInput, { inputAriaLabel: 'foo', buttonAriaLabel: 'bar' })
		expect(getByLabelText('foo')).toBeInTheDocument()
		expect(getByLabelText('bar')).toBeInTheDocument()
	})

	it('Enables submit button when input color is valid', async () => {
		const { getByLabelText, getByTitle } = render(PaletteInput, {
			inputTitle: 'foo',
			buttonAriaLabel: 'bar',
		})
		const input = getByTitle('foo')
		const button = getByLabelText('bar')
		await _sleep()
		expect(button).toBeDisabled()
		await fireEvent.input(input, { target: { value: 'ff' } })
		expect(button).toBeDisabled()
		await fireEvent.input(input, { target: { value: 'ff0' } })
		expect(button).toBeEnabled()
	})

	it('Enables submit button when set color is valid', async () => {
		const { getByRole } = render(PaletteInput, {
			color: '#ff0',
		})
		const button = getByRole('button')
		expect(button).toBeEnabled()
	})

	it('Disables submit button when set color is invalid', async () => {
		const { getByLabelText } = render(PaletteInput, {
			color: 'ff',
			buttonAriaLabel: 'bar',
		})
		const button = getByLabelText('bar')
		expect(button).toBeDisabled()
	})

	it('Triggers submit with color', async () => {
		const onAdd = jest.fn()
		const { getByLabelText, getByTitle, component } = render(PaletteInput, {
			inputTitle: 'foo',
			buttonAriaLabel: 'bar',
		})
		const input = getByTitle('foo')
		const button = getByLabelText('bar')
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
		const { queryByLabelText } = render(PaletteInput, {
			color: 'ff',
			eyeDropperButtonAriaLabel: 'bar',
		})
		const button = queryByLabelText('bar')
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
			const { queryByLabelText } = render(PaletteInput, {
				color: 'ff',
				eyeDropperButtonAriaLabel: 'bar',
			})
			const button = queryByLabelText('bar')
			expect(button).toBeInTheDocument()
		})

		it('Does not display EyeDropper button if inputType is "color"', async () => {
			const { queryByLabelText } = render(PaletteInput, {
				color: 'ff',
				inputType: 'color',
				eyeDropperButtonAriaLabel: 'bar',
			})
			const button = queryByLabelText('bar')
			expect(button).not.toBeInTheDocument()
		})

		it('retrieves color from EyeDropper selection', async () => {
			const onAdd = jest.fn()
			const { getByLabelText, component } = render(PaletteInput, {
				color: 'ff',
				buttonAriaLabel: 'foo',
				eyeDropperButtonAriaLabel: 'bar',
			})
			const submitButton = getByLabelText('foo')
			const eyeDropperButton = getByLabelText('bar')
			component.$on('add', onAdd)
			await fireEvent.click(eyeDropperButton)
			await fireEvent.click(submitButton)
			expect(onAdd).toHaveBeenCalledWith(new CustomEvent({ detail: { color: '#ff0' } }))
		})
	})
})
