import { afterEach, expect, test, vi } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/svelte/svelte5'
import userEvent from '@testing-library/user-event'
import type { Component } from 'svelte'

import PaletteSlot from '../PaletteSlot.svelte'

const setup = (component: Component, options?: Record<string, unknown>) => {
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

test('Updates style when color changes', async () => {
	const { rerender } = setup(PaletteSlot, { props: { color: '#ff0' } })
	const slot = screen.getByTestId('__palette-slot__')
	expect(slot).toHaveAttribute('style', expect.stringContaining('--color: #ff0'))

	rerender({ color: '#00f' })
	await waitFor(() => expect(slot).toHaveAttribute('style', expect.stringContaining('--color: #00f')))
})
