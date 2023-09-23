import { jest } from '@jest/globals'
import { fireEvent, render } from '@testing-library/svelte'

import PaletteCompactToggleButton from '../PaletteCompactToggleButton.svelte'

describe('PaletteCompactToggleButton', () => {
	it('Displays enlarge icon', () => {
		const isCompact = false
		const { getByTestId } = render(PaletteCompactToggleButton, { isCompact })
		expect(getByTestId('__compact-icon__')).toBeInTheDocument()
	})

	it('Displays compact icon', () => {
		const isCompact = true
		const { getByTestId } = render(PaletteCompactToggleButton, { isCompact })
		expect(getByTestId('__enlarge-icon__')).toBeInTheDocument()
	})

	it('Sets aria-label', () => {
		const ariaLabel = 'Foo'
		const { getByLabelText } = render(PaletteCompactToggleButton, { ['aria-label']: ariaLabel })
		expect(getByLabelText(ariaLabel)).toBeInTheDocument()
	})

	it('Triggers click event with current state', async () => {
		const onClick = jest.fn()
		const { getByTestId, component } = render(PaletteCompactToggleButton)
		component.$on('click', onClick)
		const button = getByTestId('__palette-compact-toggle-button__')
		await fireEvent.click(button)
		expect(onClick).toHaveBeenCalledWith(new CustomEvent({ detail: { isCompact: true } }))
	})
})
