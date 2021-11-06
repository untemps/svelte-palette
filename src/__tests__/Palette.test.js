/**
 * @jest-environment jsdom
 */

import { fireEvent, getByRole, render } from '@testing-library/svelte'

import Palette from '../Palette.svelte'

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
			allowDeletion: true,
		})
		await fireEvent.mouseEnter(getAllByTestId('__palette-row__')[0])
		expect(getByTestId('__palette-tooltip__')).toBeInTheDocument()
	})
})
