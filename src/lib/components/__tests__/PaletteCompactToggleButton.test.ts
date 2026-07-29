import { render, screen } from '@testing-library/svelte/svelte5'
import userEvent from '@testing-library/user-event'

import PaletteCompactToggleButton from '../PaletteCompactToggleButton.svelte'

const setup = (component: Parameters<typeof render>[0], options?: Parameters<typeof render>[1]) => {
	return {
		user: userEvent.setup(),
		...render(component, options),
	}
}

test('Displays enlarge icon', () => {
	const isCompact = false
	setup(PaletteCompactToggleButton, { isCompact })
	const button = screen.getByTestId('__compact-icon__')
	expect(button).toBeInTheDocument()
})

test('Displays compact icon', () => {
	const isCompact = true
	setup(PaletteCompactToggleButton, { isCompact })
	const button = screen.getByTestId('__enlarge-icon__')
	expect(button).toBeInTheDocument()
})

test('Sets aria-label', () => {
	const ariaLabel = 'Foo'
	setup(PaletteCompactToggleButton, { ['aria-label']: ariaLabel })
	const button = screen.getByLabelText(ariaLabel)
	expect(button).toBeInTheDocument()
})

test('Names the button with the default compact label when full', () => {
	setup(PaletteCompactToggleButton, { isCompact: false })
	expect(screen.getByLabelText('Compact the palette')).toBeInTheDocument()
})

test('Names the button with the default enlarge label when compact', () => {
	setup(PaletteCompactToggleButton, { isCompact: true })
	expect(screen.getByLabelText('Enlarge the palette')).toBeInTheDocument()
})

test('Names the button with a custom compact label when full', () => {
	setup(PaletteCompactToggleButton, { isCompact: false, compactLabel: 'Réduire la palette' })
	expect(screen.getByLabelText('Réduire la palette')).toBeInTheDocument()
})

test('Names the button with a custom enlarge label when compact', () => {
	setup(PaletteCompactToggleButton, { isCompact: true, enlargeLabel: 'Agrandir la palette' })
	expect(screen.getByLabelText('Agrandir la palette')).toBeInTheDocument()
})

test('Triggers click event with current state', async () => {
	const onClick = vi.fn(() => 0)
	const { user } = setup(PaletteCompactToggleButton, { props: { onclick: onClick } })
	const button = screen.getByTestId('__palette-compact-toggle-button__')
	await user.click(button)
	expect(onClick).toHaveBeenCalledWith(expect.any(MouseEvent))
})
