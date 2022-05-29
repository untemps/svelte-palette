/**
 * @jest-environment jsdom
 */

import { fireEvent, render } from '@testing-library/svelte'

import PaletteSlot, { emptyAriaLabel } from '../PaletteSlot.svelte'

describe('PaletteSlot', () => {
	it('Sets color as aria-label if color is set', () => {
		const color = '#ff0'
		const { getByLabelText } = render(PaletteSlot, { color })
		expect(getByLabelText(color)).toBeInTheDocument()
	})

	it('Sets empty aria-label if color is not set', () => {
		const { getByLabelText } = render(PaletteSlot, { emptyAriaLabel: 'foo' })
		expect(getByLabelText('foo')).toBeInTheDocument()
	})

	it('Triggers click event', async () => {
		const color = '#ff0'
		const onClick = jest.fn()
		const { getByTestId, component } = render(PaletteSlot, { color })
		component.$on('click', onClick)
		const slot = getByTestId('__palette-slot-root__')
		await fireEvent.click(slot)
		expect(onClick).toHaveBeenCalledWith(new CustomEvent({ detail: { color } }))
	})

	it('Attaches empty class if color is not set', () => {
		const { getByTestId } = render(PaletteSlot)
		expect(getByTestId('__palette-slot-root__')).toHaveClass('empty')
	})

	it('Does not attach empty class if color is set', () => {
		const color = '#ff0'
		const { getByTestId } = render(PaletteSlot, { color })
		expect(getByTestId('__palette-slot-root__')).not.toHaveClass('empty')
	})

	it('Attaches clickable class if slot is enabled', () => {
		const color = '#ff0'
		const { getByTestId, component } = render(PaletteSlot, { color })
		expect(getByTestId('__palette-slot-root__')).toHaveClass('clickable')
	})

	it('Does not attach clickable class if slot is disabled', () => {
		const color = '#ff0'
		const { getByTestId, component } = render(PaletteSlot, { color, disabled: true })
		expect(getByTestId('__palette-slot-root__')).not.toHaveClass('clickable')
	})

	it('Disables slot', () => {
		const color = '#ff0'
		const { getByTestId, component } = render(PaletteSlot, { color, disabled: true })
		expect(getByTestId('__palette-slot-root__')).toBeDisabled()
	})

	it('Selects slot', () => {
		const color = '#ff0'
		const { getByTestId, component } = render(PaletteSlot, { color, selected: true })
		expect(getByTestId('__palette-slot-root__')).toHaveClass('selected')
	})
})
