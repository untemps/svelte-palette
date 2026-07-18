import { afterEach, expect, test, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/svelte/svelte5'
import userEvent from '@testing-library/user-event'

import PaletteSlot from '../PaletteSlot.svelte'

const setup = (component: Parameters<typeof render>[0], options?: Parameters<typeof render>[1]) => {
	return {
		user: userEvent.setup(),
		...render(component, options),
	}
}

afterEach(() => cleanup())

test('Sets color as aria-label if color is set', () => {
	const color = '#ff0'
	setup(PaletteSlot, { color })
	const slot = screen.getByLabelText(color)
	expect(slot).toBeInTheDocument()
})

test('Sets empty aria-label if color is not set', () => {
	setup(PaletteSlot, { ['aria-label']: 'foo' })
	const slot = screen.getByLabelText('foo')
	expect(slot).toBeInTheDocument()
})

test('Triggers click event', async () => {
	const color = '#ff0'
	const onClick = vi.fn(() => 0)
	const { user } = setup(PaletteSlot, { props: { color, onselect: onClick } })
	const slot = screen.getByTestId('__palette-slot__')
	await user.click(slot)
	expect(onClick).toHaveBeenCalledWith({ color })
})

test('Attaches empty class if color is not set', () => {
	setup(PaletteSlot)
	const slot = screen.getByTestId('__palette-slot__')
	expect(slot).toHaveClass('empty')
})

test('Does not attach empty class if color is set', () => {
	const color = '#ff0'
	setup(PaletteSlot, { color })
	const slot = screen.getByTestId('__palette-slot__')
	expect(slot).not.toHaveClass('empty')
})

test('Attaches clickable class if slot is enabled', () => {
	const color = '#ff0'
	setup(PaletteSlot, { color })
	const slot = screen.getByTestId('__palette-slot__')
	expect(slot).toHaveClass('clickable')
})

test('Does not attach clickable class if slot is disabled', () => {
	const color = '#ff0'
	setup(PaletteSlot, { color, disabled: true })
	const slot = screen.getByTestId('__palette-slot__')
	expect(slot).not.toHaveClass('clickable')
})

test('Disables slot', () => {
	const color = '#ff0'
	setup(PaletteSlot, { color, disabled: true })
	const slot = screen.getByTestId('__palette-slot__')
	expect(slot).toBeDisabled()
})

test('Selects slot', () => {
	const color = '#ff0'
	setup(PaletteSlot, { color, selected: true })
	const slot = screen.getByTestId('__palette-slot__')
	expect(slot).toHaveClass('selected')
})

test('Does not call onselect when slot is disabled', async () => {
	const color = '#ff0'
	const onClick = vi.fn(() => 0)
	const { user } = setup(PaletteSlot, { props: { color, disabled: true, onselect: onClick } })
	const slot = screen.getByTestId('__palette-slot__')
	await user.click(slot)
	expect(onClick).not.toHaveBeenCalled()
})

test('Calls transition fn when slot enters the DOM', () => {
	const color = '#ff0'
	const transitionFn = vi.fn(() => ({}))
	setup(PaletteSlot, { props: { color, transition: { fn: transitionFn } } })
	expect(transitionFn).toHaveBeenCalled()
})

test('Does not set a role by default', () => {
	const color = '#ff0'
	setup(PaletteSlot, { color })
	const slot = screen.getByTestId('__palette-slot__')
	expect(slot).not.toHaveAttribute('role')
})

test('Applies the option role when provided', () => {
	const color = '#ff0'
	setup(PaletteSlot, { color, ['role']: 'option' })
	const slot = screen.getByTestId('__palette-slot__')
	expect(slot).toHaveAttribute('role', 'option')
})

test('Reflects the selected state through aria-selected when it is an option', () => {
	const color = '#ff0'
	setup(PaletteSlot, { color, ['role']: 'option', selected: true })
	const slot = screen.getByTestId('__palette-slot__')
	expect(slot).toHaveAttribute('aria-selected', 'true')
})

test('Sets aria-selected to false when an unselected option', () => {
	const color = '#ff0'
	setup(PaletteSlot, { color, ['role']: 'option' })
	const slot = screen.getByTestId('__palette-slot__')
	expect(slot).toHaveAttribute('aria-selected', 'false')
})

test('Does not set aria-selected outside of an option role', () => {
	const color = '#ff0'
	setup(PaletteSlot, { color, selected: true })
	const slot = screen.getByTestId('__palette-slot__')
	expect(slot).not.toHaveAttribute('aria-selected')
})

test('Defaults tabindex to 0', () => {
	const color = '#ff0'
	setup(PaletteSlot, { color })
	const slot = screen.getByTestId('__palette-slot__')
	expect(slot).toHaveAttribute('tabindex', '0')
})

test('Applies the provided tabindex', () => {
	const color = '#ff0'
	setup(PaletteSlot, { color, tabindex: -1 })
	const slot = screen.getByTestId('__palette-slot__')
	expect(slot).toHaveAttribute('tabindex', '-1')
})

test('Applies a presentation role when provided', () => {
	const color = '#ff0'
	setup(PaletteSlot, { color, ['role']: 'presentation' })
	const slot = screen.getByTestId('__palette-slot__')
	expect(slot).toHaveAttribute('role', 'presentation')
})
