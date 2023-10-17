import { afterEach, expect, test, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/svelte'

import { SELECT } from '../../enums/PaletteEvent.js'

import PaletteSlot from '../PaletteSlot.svelte'

afterEach(() => cleanup())

test('Sets color as aria-label if color is set', () => {
	const color = '#ff0'
	render(PaletteSlot, { color })
	const slot = screen.getByLabelText(color)
	expect(slot).toBeInTheDocument()
})

test('Sets empty aria-label if color is not set', () => {
	render(PaletteSlot, { ['aria-label']: 'foo' })
	const slot = screen.getByLabelText('foo')
	expect(slot).toBeInTheDocument()
})

test('Triggers click event', async () => {
	const color = '#ff0'
	const onClick = vi.fn(() => 0)
	const { component } = render(PaletteSlot, { color })
	component.$on(SELECT, onClick)
	const slot = screen.getByTestId('__palette-slot__')
	await fireEvent.click(slot)
	expect(onClick).toHaveBeenCalledWith(new CustomEvent({ detail: { color } }))
})

test('Attaches empty class if color is not set', () => {
	render(PaletteSlot)
	const slot = screen.getByTestId('__palette-slot__')
	expect(slot).toHaveClass('empty')
})

test('Does not attach empty class if color is set', () => {
	const color = '#ff0'
	render(PaletteSlot, { color })
	const slot = screen.getByTestId('__palette-slot__')
	expect(slot).not.toHaveClass('empty')
})

test('Attaches clickable class if slot is enabled', () => {
	const color = '#ff0'
	render(PaletteSlot, { color })
	const slot = screen.getByTestId('__palette-slot__')
	expect(slot).toHaveClass('clickable')
})

test('Does not attach clickable class if slot is disabled', () => {
	const color = '#ff0'
	render(PaletteSlot, { color, disabled: true })
	const slot = screen.getByTestId('__palette-slot__')
	expect(slot).not.toHaveClass('clickable')
})

test('Disables slot', () => {
	const color = '#ff0'
	render(PaletteSlot, { color, disabled: true })
	const slot = screen.getByTestId('__palette-slot__')
	expect(slot).toBeDisabled()
})

test('Selects slot', () => {
	const color = '#ff0'
	render(PaletteSlot, { color, selected: true })
	const slot = screen.getByTestId('__palette-slot__')
	expect(slot).toHaveClass('selected')
})
