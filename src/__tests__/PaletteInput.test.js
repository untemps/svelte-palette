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
			buttonAriaLabel: 'bar'
		})
		const input = getByTitle('foo')
		const button = getByLabelText('bar')
		component.$on('add', onAdd)
		await fireEvent.input(input, { target: { value: 'ff0' } })
		await fireEvent.click(button)
		expect(onAdd).toHaveBeenCalledWith(new CustomEvent({ detail: { color: '#ff0' } }))
	})
})
