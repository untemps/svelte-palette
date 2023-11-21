import { afterEach, expect, test, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'

import Palette from '../Palette.svelte'

import { TOOLTIP, DROP } from '../../enums/PaletteDeletionMode'

const setup = (component, options) => {
	return {
		user: userEvent.setup(),
		...render(component, options),
	}
}

afterEach(() => cleanup())

test('Displays as many color slots as set', async () => {
	let cells = null
	const colors = ['#ff0', '#0ff', '#f0f']
	setup(Palette, {
		colors,
	})

	cells = await screen.findAllByTestId('__palette-cell__')
	expect(cells).toHaveLength(colors.length)
})

test('Displays as many color slots as set in async mode', async () => {
	let cells = null
	const colors = Promise.resolve(['#ff0', '#0ff', '#f0f'])
	setup(Palette, {
		colors,
	})

	cells = await screen.findAllByTestId('__palette-cell__')
	waitFor(() => expect(cells).toHaveLength(colors.length))
})

test('Triggers select with color', async () => {
	let cells,
		cell = null
	const onSelect = vi.fn(() => 0)
	const colors = ['#ff0', '#0ff', '#f0f']

	const { component, user } = setup(Palette, {
		colors,
	})

	component.$on('select', onSelect)

	cells = await screen.findAllByTestId('__palette-cell__')
	cell = cells[0]
	await user.click(cell.firstChild)

	expect(onSelect).toHaveBeenCalledWith(new CustomEvent({ detail: { color: colors[0] } }))
})

test('Deletes slots if deletionMode is set to "tooltip"', async () => {
	let cells,
		cell,
		trash = null
	const colors = ['#ff0', '#0ff', '#f0f']

	const { user } = setup(Palette, {
		colors,
		deletionMode: TOOLTIP,
	})

	cells = await screen.findAllByTestId('__palette-cell__')
	cell = cells[0]

	await user.hover(cell)

	trash = await screen.findByTestId('__trash-icon__')
	expect(trash).toBeInTheDocument()

	await user.click(trash)

	expect(cell).not.toBeInTheDocument()
})

test('Deletes slot if deletionMode is set to "drop"', async () => {
	let cells,
		cell = null
	const colors = ['#ff0', '#0ff', '#f0f']

	const { user } = setup(Palette, {
		accessors: true,
		props: {
			colors,
			deletionMode: DROP,
		},
	})

	cells = await screen.findAllByTestId('__palette-cell__')

	cell = cells[0]

	await user.pointer({ keys: '[MouseLeft>]', target: cell })

	const drag = document.querySelector('#drag')
	drag.getBoundingClientRect = () => ({
		width: 20,
		height: 20,
		top: 2000,
		left: 2000,
		right: 2020,
		bottom: 2020,
	})
	await user.pointer('[/MouseLeft]')

	expect(cell).not.toBeInTheDocument()
})

test('Displays transparent slot if showTransparentSlot is truthy', async () => {
	let cells,
		cell = null
	const onSelect = vi.fn(() => 0)
	const colors = ['#ff0', '#0ff', '#f0f']

	const { component, user } = setup(Palette, {
		colors,
		showTransparentSlot: true,
	})

	component.$on('select', onSelect)
	cells = await screen.findAllByTestId('__palette-cell__')
	expect(cells).toHaveLength(colors.length + 1)

	cell = cells[0]
	await user.click(cell.firstChild)

	expect(onSelect).toHaveBeenCalledWith(new CustomEvent({ detail: { color: null } }))
})

test.each([
	[['#ff0', '#0ff', '#f0f'], 99, 4],
	[['#ff0', '#0ff', '#f0f'], -1, 4],
	[['#ff0', '#0ff', '#f0f'], 3, 3],
	[['#ff0', '#0ff', '#f0f'], 1, 1],
])('Adds or replaces color regarding maxColors value', async (colors, maxColors, expected) => {
	let input,
		submit,
		slots = null
	const newColor = '0f0'
	const onSelect = vi.fn(() => 0)

	const { component, user } = setup(Palette, {
		colors,
		maxColors,
	})

	component.$on('select', onSelect)

	input = await screen.findByTestId('__palette-input-input__')
	await user.type(input, newColor)

	submit = await screen.findByTestId('__palette-input-submit__')
	await user.click(submit)

	slots = await screen.findAllByTestId('__palette-slot__')
	expect(slots).toHaveLength(expected)

	await user.click(slots[slots.length - 1])

	expect(onSelect).toHaveBeenCalledWith(new CustomEvent({ detail: { color: '#000' } }))
})

test.each([
	[['#ff0', '#0ff', '#f0f'], false, 3],
	[['#ff0', '#0ff', '#f0f', '#f0f'], false, 3],
	[['#ff0', '#0ff', '#f0f'], true, 4],
])('Adds or not color regarding allowDuplicates value', async (colors, allowDuplicates, expected) => {
	let input,
		submit,
		slots = null
	const newColor = 'f0f'
	const onSelect = vi.fn(() => 0)

	const { component, user } = setup(Palette, {
		colors,
		allowDuplicates,
	})
	component.$on('select', onSelect)

	input = await screen.findByTestId('__palette-input-input__')
	await user.type(input, newColor)

	submit = await screen.findByTestId('__palette-input-submit__')
	await user.click(submit)

	slots = await screen.findAllByTestId('__palette-slot__')
	expect(slots).toHaveLength(expected)

	await user.click(slots[slots.length - 1])

	expect(onSelect).toHaveBeenCalledWith(new CustomEvent({ detail: { color: '#f0f' } }))
})

test('Removes duplicates when updating allowDuplicates value', async () => {
	let slots = null
	const colors = ['#ff0', '#0ff', '#f0f', '#f0f', '#f0f']

	const { rerender } = setup(Palette, {
		colors,
		allowDuplicates: true,
	})

	slots = await screen.findAllByTestId('__palette-slot__')
	expect(slots).toHaveLength(colors.length)

	rerender({
		colors,
		allowDuplicates: false,
	})

	slots = await screen.findAllByTestId('__palette-slot__')
	expect(slots).toHaveLength(3)
})
