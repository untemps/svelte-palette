/**
 * @jest-environment jsdom
 */

import { fireEvent, render } from '@testing-library/svelte'

import { COMPACT } from '../../enums/PaletteIcon'

import IconButton from '../IconButton.svelte'

describe('IconButton', () => {
	it('Renders nothing', () => {
		const { getByTestId } = render(IconButton)
		expect(getByTestId('__icon-button__')).toBeEmptyDOMElement()
	})

	it('Displays icon', () => {
		const { getByTestId } = render(IconButton, { icon: COMPACT })
		expect(getByTestId('__icon-button__')).not.toBeEmptyDOMElement()
		expect(getByTestId('__compact-icon__')).toBeInTheDocument()
	})

	it('Triggers click event', async () => {
		const onClick = jest.fn()
		const { getByTestId, component } = render(IconButton, { icon: COMPACT })
		component.$on('click', onClick)
		const button = getByTestId('__icon-button__')
		await fireEvent.click(button)
		expect(onClick).toHaveBeenCalled()
	})
})
