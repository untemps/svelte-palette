/**
 * @jest-environment jsdom
 */

import { fireEvent, render, waitFor } from '@testing-library/svelte'

import Palette from '../Palette.svelte'
import { TOOLTIP } from '../../enums/PaletteDeletionMode'

describe('Palette', () => {
	it('Displays as many color slots as set', async () => {
		const colors = ['#ff0', '#0ff', '#f0f']
		const { getAllByTestId } = render(Palette, {
			colors,
		})
		expect(getAllByTestId('__palette-row__')).toHaveLength(colors.length)
	})

	it('Triggers select with color', async () => {
		const onSelect = jest.fn()
		const colors = ['#ff0', '#0ff', '#f0f']
		const { getAllByTestId, component } = render(Palette, {
			colors,
		})
		component.$on('select', onSelect)
		const row = getAllByTestId('__palette-row__')[0]
		await fireEvent.click(row.firstChild)
		expect(onSelect).toHaveBeenCalledWith(new CustomEvent({ detail: { color: colors[0] } }))
	})

	it('Displays tooltip if allowDeletion is truthy', async () => {
		const colors = ['#ff0', '#0ff', '#f0f']
		const { getByTestId, getAllByTestId } = render(Palette, {
			colors,
			deletionMode: TOOLTIP,
		})
		const row = getAllByTestId('__palette-row__')[0]
		await fireEvent.mouseOver(row) // fireEvent.mouseEnter only works if mouseOver is triggered before
		await fireEvent.mouseEnter(row)
		await waitFor(() => expect(getByTestId('__palette-tooltip__')).toBeInTheDocument())
	})

	it('Displays transparent slot if showTransparentSlot is truthy', async () => {
		const onSelect = jest.fn()
		const colors = ['#ff0', '#0ff', '#f0f']
		const { getAllByTestId, component } = render(Palette, {
			colors,
			showTransparentSlot: true,
		})
		component.$on('select', onSelect)
		expect(getAllByTestId('__palette-row__')).toHaveLength(colors.length + 1)
		const row = getAllByTestId('__palette-row__')[0]
		await fireEvent.click(row.firstChild)
		expect(onSelect).toHaveBeenCalledWith(new CustomEvent({ detail: { color: null } }))
	})

	it.each([
		[['#ff0', '#0ff', '#f0f'], 99, 4],
		[['#ff0', '#0ff', '#f0f'], -1, 4],
		[['#ff0', '#0ff', '#f0f'], 3, 3],
		[['#ff0', '#0ff', '#f0f'], 1, 1],
	])('Adds or replaces color regarding maxColors value', async (colors, maxColors, expected) => {
		const onSelect = jest.fn()
		const { getByTestId, getAllByTestId, component } = render(Palette, {
			colors,
			maxColors,
		})
		component.$on('select', onSelect)
		const input = getByTestId('__palette-input-input__')
		const submit = getByTestId('__palette-input-submit__')
		const newColor = '0f0'
		await fireEvent.input(input, { target: { value: newColor } })
		await fireEvent.click(submit)
		const slots = getAllByTestId('__palette-slot__')
		expect(slots).toHaveLength(expected)
		await fireEvent.click(slots[slots.length - 1])
		expect(onSelect).toHaveBeenCalledWith(new CustomEvent({ detail: { color: '#000' } }))
	})

	it.each([
		[['#ff0', '#0ff', '#f0f'], false, 3],
		[['#ff0', '#0ff', '#f0f', '#f0f'], false, 3],
		[['#ff0', '#0ff', '#f0f'], true, 4],
	])('Adds or not color regarding allowDuplicates value', async (colors, allowDuplicates, expected) => {
		const onSelect = jest.fn()
		const { getByTestId, getAllByTestId, component } = render(Palette, {
			colors,
			allowDuplicates,
		})
		component.$on('select', onSelect)
		const input = getByTestId('__palette-input-input__')
		const submit = getByTestId('__palette-input-submit__')
		const newColor = 'f0f'
		await fireEvent.input(input, { target: { value: newColor } })
		await fireEvent.click(submit)
		const slots = getAllByTestId('__palette-slot__')
		expect(slots).toHaveLength(expected)
		await fireEvent.click(slots[slots.length - 1])
		expect(onSelect).toHaveBeenCalledWith(new CustomEvent({ detail: { color: '#f0f' } }))
	})

	it('Removes duplicates when updating allowDuplicates value', async () => {
		const colors = ['#ff0', '#0ff', '#f0f', '#f0f', '#f0f']
		const { getAllByTestId, rerender } = render(Palette, {
			colors,
			allowDuplicates: true,
		})
		expect(getAllByTestId('__palette-slot__')).toHaveLength(colors.length)
		rerender({
			colors,
			allowDuplicates: false,
		})
		expect(getAllByTestId('__palette-slot__')).toHaveLength(3)
	})
})
