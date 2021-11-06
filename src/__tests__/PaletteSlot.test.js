/**
 * @jest-environment jsdom
 */

import { fireEvent, render } from '@testing-library/svelte'

import PaletteSlot from '../PaletteSlot.svelte'

describe('PaletteSlot', () => {
	it('triggers click event', async () => {
		const color = '#ff0'
		const onClick = jest.fn()
		const { getByTestId, component } = render(PaletteSlot, { color })
		component.$on('click', onClick)
		const slot = getByTestId('__palette-slot-root__')
		await fireEvent.click(slot)
		expect(onClick).toHaveBeenCalledWith(new CustomEvent({ detail: { color } }))
	})
})
