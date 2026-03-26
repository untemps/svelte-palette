import { afterEach, expect, test, vi } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/svelte/svelte5'
import userEvent from '@testing-library/user-event'
import { standby } from '@untemps/utils/async/standby'
import { createRawSnippet } from 'svelte'

import Palette from '../Palette.svelte'

// TODO: Fix "Error: Not implemented: HTMLFormElement.prototype.requestSubmit"
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
	waitFor(() => expect(cells).toHaveLength(3))
})

test('Triggers select with color', async () => {
	let cells,
		cell = null
	const onSelect = vi.fn(() => 0)
	const colors = ['#ff0', '#0ff', '#f0f']

	const { user } = setup(Palette, {
		props: { colors, onselect: onSelect },
	})

	cells = await screen.findAllByTestId('__palette-cell__')
	cell = cells[0]
	await user.click(cell.firstChild)

	expect(onSelect).toHaveBeenCalledWith({ color: colors[0] })
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

	const { user } = setup(Palette, {
		props: { colors, showTransparentSlot: true, onselect: onSelect },
	})
	cells = await screen.findAllByTestId('__palette-cell__')
	expect(cells).toHaveLength(colors.length + 1)

	cell = cells[0]
	await user.click(cell.firstChild)

	expect(onSelect).toHaveBeenCalledWith({ color: null })
})

test.each([
	[['#ff0', '#0ff', '#f0f'], 99, 4, '#0f0'],
	[['#ff0', '#0ff', '#f0f'], -1, 4, '#0f0'],
	[['#ff0', '#0ff', '#f0f'], 3, 3, '#f0f'],
	[['#ff0', '#0ff', '#f0f'], 1, 1, '#ff0'],
])('Adds or replaces color regarding maxColors value', async (colors, maxColors, expected, expectedColor) => {
	let input,
		submit,
		slots = null
	const newColor = '0f0'
	const onSelect = vi.fn(() => 0)

	const { user } = setup(Palette, {
		props: { colors, maxColors, showInput: true, onselect: onSelect },
	})

	input = await screen.findByTestId('__palette-input-input__')
	await user.type(input, newColor)

	submit = await screen.findByTestId('__palette-input-submit__')
	await user.click(submit)

	slots = await screen.findAllByTestId('__palette-slot__')
	expect(slots).toHaveLength(expected)

	await user.click(slots[slots.length - 1])

	expect(onSelect).toHaveBeenCalledWith({ color: expectedColor })
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

	const { user } = setup(Palette, {
		props: { colors, allowDuplicates, showInput: true, onselect: onSelect },
	})

	input = await screen.findByTestId('__palette-input-input__')
	await user.type(input, newColor)

	submit = await screen.findByTestId('__palette-input-submit__')
	await user.click(submit)

	slots = await screen.findAllByTestId('__palette-slot__')
	expect(slots).toHaveLength(expected)

	await user.click(slots[slots.length - 1])

	expect(onSelect).toHaveBeenCalledWith({ color: '#f0f' })
})

test('Expands palette when compact toggle button is clicked', async () => {
	const colors = ['#ff0', '#0ff', '#f0f']
	const compactColorIndices = [0, 1]

	const { user } = setup(Palette, {
		props: { colors, compactColorIndices, isCompact: true },
	})

	const toggleButton = await screen.findByTestId('__palette-compact-toggle-button__')
	expect(toggleButton).toBeInTheDocument()

	await user.click(toggleButton)

	const content = document.querySelector('.palette__content')
	await waitFor(() => expect(content).not.toHaveClass('palette__content--compact'))
})

test('Closes settings panel when onClose is called', async () => {
	const colors = ['#ff0', '#0ff', '#f0f']
	const compactColorIndices = [0, 1]

	const settingsSnippet = createRawSnippet((getProps) => ({
		render: () => `<button data-testid="__settings-close-button__">Close</button>`,
		setup: (element) => {
			element.addEventListener('click', () => getProps().onClose())
		},
	}))

	const { user } = setup(Palette, {
		props: {
			colors,
			compactColorIndices,
			settings: settingsSnippet,
		},
	})

	const settingsButton = await screen.findByTestId('__palette-settings-button__')
	await user.click(settingsButton)

	const panel = document.querySelector('.palette__settings__panel')
	await waitFor(() => expect(panel).toHaveClass('palette__settings__panel--visible'))

	const closeButton = screen.getByTestId('__settings-close-button__')
	await user.click(closeButton)

	await waitFor(() => expect(panel).not.toHaveClass('palette__settings__panel--visible'))
})

test('Displays groups with their names and color slots', async () => {
	const colors = [
		{ name: 'Reds', colors: ['#f00', '#f11', '#f22'] },
		{ name: 'Blues', colors: ['#00f', '#11f'] },
	]

	setup(Palette, { props: { colors } })

	const groups = await screen.findAllByTestId('__palette-group__')
	expect(groups).toHaveLength(2)

	const names = await screen.findAllByTestId('__palette-group-name__')
	expect(names[0]).toHaveTextContent('Reds')
	expect(names[1]).toHaveTextContent('Blues')

	const cells = await screen.findAllByTestId('__palette-cell__')
	expect(cells).toHaveLength(5)
})

test('Does not display group name when group has no name', async () => {
	const colors = [{ colors: ['#f00', '#0f0'] }]

	setup(Palette, { props: { colors } })

	await screen.findAllByTestId('__palette-group__')
	expect(screen.queryByTestId('__palette-group-name__')).toBeNull()
})

test('Triggers select with color in group mode', async () => {
	const onSelect = vi.fn()
	const colors = [
		{ name: 'Reds', colors: ['#f00', '#f11'] },
		{ name: 'Blues', colors: ['#00f'] },
	]

	const { user } = setup(Palette, { props: { colors, onselect: onSelect } })

	const cells = await screen.findAllByTestId('__palette-cell__')
	await user.click(cells[0].firstChild)

	expect(onSelect).toHaveBeenCalledWith({ color: '#f00' })
})

test('Deletes color slot in group mode when deletionMode is tooltip', async () => {
	const colors = [
		{ name: 'Reds', colors: ['#f00', '#f11', '#f22'] },
		{ name: 'Blues', colors: ['#00f'] },
	]

	const { user } = setup(Palette, { props: { colors, deletionMode: TOOLTIP } })

	let cells = await screen.findAllByTestId('__palette-cell__')
	await user.hover(cells[0])

	const trash = await screen.findByTestId('__trash-icon__')
	await user.click(trash)

	cells = await screen.findAllByTestId('__palette-cell__')
	expect(cells).toHaveLength(3)
})

test.each([
	[0, 8, 8],
	[0, 30, 25],
	[0, 0, 25],
	[5, 3, 5],
])('Sets num-columns according to numColumns and maxColumns values', async (numColumns, maxColumns, expected) => {
	const colors = Array.from({ length: 25 }, (_, i) => `#${String(i).padStart(6, '0')}`)

	setup(Palette, {
		props: { colors, numColumns, maxColumns },
	})

	const content = await screen.findByRole('main')
	const section = content.querySelector('.palette__content')
	await waitFor(() => expect(section.getAttribute('style')).toContain(`--num-columns: ${expected}`))
})

test('Updates num-columns when numColumns changes to 0', async () => {
	const colors = Array.from({ length: 25 }, (_, i) => `#${String(i).padStart(6, '0')}`)

	const { rerender } = setup(Palette, {
		props: { colors, numColumns: 5 },
	})

	const content = await screen.findByRole('main')
	const section = content.querySelector('.palette__content')
	await waitFor(() => expect(section.getAttribute('style')).toContain('--num-columns: 5'))

	rerender({ colors, numColumns: 0 })

	await waitFor(() => expect(section.getAttribute('style')).toContain('--num-columns: 25'))
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

	await standby(1000)

	slots = await screen.findAllByTestId('__palette-slot__')
	expect(slots).toHaveLength(3)
})
