/**
 * @jest-environment jsdom
 */

import { fireEvent, render } from '@testing-library/svelte'

import PaletteCompact, { isCompact, isOn } from '../PaletteCompact.svelte'

describe('PaletteCompact', () => {
	it('Displays enlarge icon', () => {
		const isCompact = false
		const { getByTestId } = render(PaletteCompact, { isCompact })
		expect(getByTestId('__palette-compact-compact__')).toBeInTheDocument()
	})

	it('Displays compact icon', () => {
		const isCompact = true
		const { getByTestId } = render(PaletteCompact, { isCompact })
		expect(getByTestId('__palette-compact-enlarge__')).toBeInTheDocument()
	})

	it('Sets aria-label', () => {
		const ariaLabel = 'Foo'
		const { getByLabelText } = render(PaletteCompact, { ariaLabel })
		expect(getByLabelText(ariaLabel)).toBeInTheDocument()
	})

	it('Triggers click event with current state', async () => {
		const onClick = jest.fn()
		const { getByTestId, component } = render(PaletteCompact)
		component.$on('click', onClick)
		const button = getByTestId('__palette-compact__')
		await fireEvent.click(button)
		expect(onClick).toHaveBeenCalledWith(new CustomEvent({ detail: { isCompact: true } }))
	})
})
