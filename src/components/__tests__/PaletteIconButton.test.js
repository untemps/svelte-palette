import { jest } from '@jest/globals'
import { fireEvent, render } from '@testing-library/svelte'

import { COMPACT } from '../../enums/PaletteIcon'

import PaletteIconButton from '../PaletteIconButton.svelte'

describe('PaletteIconButton', () => {
	it('Renders nothing', () => {
		const { getByTestId } = render(PaletteIconButton)
		expect(getByTestId('__palette-icon-button__')).toBeEmptyDOMElement()
	})

	it('Displays icon', () => {
		const { getByTestId } = render(PaletteIconButton, { icon: COMPACT })
		expect(getByTestId('__palette-icon-button__')).not.toBeEmptyDOMElement()
		expect(getByTestId('__compact-icon__')).toBeInTheDocument()
	})

	it('Triggers click event', async () => {
		const onClick = jest.fn()
		const { getByTestId, component } = render(PaletteIconButton, { icon: COMPACT })
		component.$on('click', onClick)
		const button = getByTestId('__palette-icon-button__')
		await fireEvent.click(button)
		expect(onClick).toHaveBeenCalled()
	})
})
