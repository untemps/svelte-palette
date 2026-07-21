import { afterEach, expect, test, vi } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/svelte/svelte5'
import userEvent from '@testing-library/user-event'
import { standby } from '@untemps/utils/async/standby'
import { createRawSnippet } from 'svelte'

import Palette from '../Palette.svelte'

// TODO: Fix "Error: Not implemented: HTMLFormElement.prototype.requestSubmit"
import { TOOLTIP, DROP } from '../../enums/PaletteDeletionMode'

const setup = (component: Parameters<typeof render>[0], options?: Parameters<typeof render>[1]) => {
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

test('Marks the slot matching selectedColor as selected', async () => {
	const colors = ['#ff0', '#0ff', '#f0f']
	setup(Palette, {
		props: { colors, selectedColor: '#0ff' },
	})

	const slots = await screen.findAllByTestId('__palette-slot__')
	expect(slots[0]).not.toHaveClass('selected')
	expect(slots[1]).toHaveClass('selected')
	expect(slots[2]).not.toHaveClass('selected')
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

	const content = await screen.findByTestId('__palette__')
	const section = content.querySelector('.palette__content')
	await waitFor(() => expect(section.getAttribute('style')).toContain(`--num-columns: ${expected}`))
})

test('Updates num-columns when numColumns changes to 0', async () => {
	const colors = Array.from({ length: 25 }, (_, i) => `#${String(i).padStart(6, '0')}`)

	const { rerender } = setup(Palette, {
		props: { colors, numColumns: 5 },
	})

	const content = await screen.findByTestId('__palette__')
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

test('Does not expose a main landmark on the root', async () => {
	const colors = ['#ff0', '#0ff', '#f0f']
	setup(Palette, { colors })

	await screen.findAllByTestId('__palette-slot__')
	expect(screen.queryByRole('main')).toBeNull()

	const root = screen.getByTestId('__palette__')
	expect(root).toHaveAttribute('data-palette')
})

test('Exposes the slot grid as a listbox', async () => {
	const colors = ['#ff0', '#0ff', '#f0f']
	setup(Palette, { colors })

	const listbox = await screen.findByRole('listbox')
	expect(listbox).toHaveAttribute('aria-label', 'Color slots')
})

test('Names the listbox with the label prop', async () => {
	const colors = ['#ff0', '#0ff', '#f0f']
	setup(Palette, { props: { colors, label: 'Brand colors' } })

	const listbox = await screen.findByRole('listbox')
	expect(listbox).toHaveAttribute('aria-label', 'Brand colors')
})

test('Groups slots and associates each group with its name', async () => {
	const colors = [
		{ name: 'Reds', colors: ['#f00', '#f11'] },
		{ name: 'Blues', colors: ['#00f'] },
	]
	setup(Palette, { props: { colors } })

	const listbox = await screen.findByRole('listbox')
	expect(listbox).toBeInTheDocument()

	const groups = await screen.findAllByRole('group')
	expect(groups).toHaveLength(2)

	expect(groups[0]).toHaveAttribute('aria-label', 'Reds')
	expect(groups[1]).toHaveAttribute('aria-label', 'Blues')

	const names = screen.getAllByTestId('__palette-group-name__')
	expect(names[0]).toHaveTextContent('Reds')
	expect(names[1]).toHaveTextContent('Blues')
})

test('Does not set aria-label on a group without a name', async () => {
	const colors = [{ colors: ['#f00', '#0f0'] }]
	setup(Palette, { props: { colors } })

	const group = await screen.findByRole('group')
	expect(group).not.toHaveAttribute('aria-label')
})

test('Makes only the first slot tabbable when nothing is selected', async () => {
	const colors = ['#ff0', '#0ff', '#f0f']
	setup(Palette, { colors })

	const slots = await screen.findAllByTestId('__palette-slot__')
	expect(slots[0]).toHaveAttribute('tabindex', '0')
	expect(slots[1]).toHaveAttribute('tabindex', '-1')
	expect(slots[2]).toHaveAttribute('tabindex', '-1')
})

test('Makes the selected slot the tabbable one', async () => {
	const colors = ['#ff0', '#0ff', '#f0f']
	setup(Palette, { props: { colors, selectedColor: '#f0f' } })

	const slots = await screen.findAllByTestId('__palette-slot__')
	expect(slots[0]).toHaveAttribute('tabindex', '-1')
	expect(slots[1]).toHaveAttribute('tabindex', '-1')
	expect(slots[2]).toHaveAttribute('tabindex', '0')
})

test('Moves focus to the next slot with ArrowRight and rolls the tabindex', async () => {
	const colors = ['#ff0', '#0ff', '#f0f']
	const { user } = setup(Palette, { colors })

	const slots = await screen.findAllByTestId('__palette-slot__')
	slots[0].focus()
	await user.keyboard('{ArrowRight}')

	expect(slots[1]).toHaveFocus()
	await waitFor(() => expect(slots[1]).toHaveAttribute('tabindex', '0'))
	expect(slots[0]).toHaveAttribute('tabindex', '-1')
})

test('Moves focus to the previous slot with ArrowLeft and clamps at the start', async () => {
	const colors = ['#ff0', '#0ff', '#f0f']
	const { user } = setup(Palette, { colors })

	const slots = await screen.findAllByTestId('__palette-slot__')
	slots[1].focus()
	await user.keyboard('{ArrowLeft}')
	expect(slots[0]).toHaveFocus()

	await user.keyboard('{ArrowLeft}')
	expect(slots[0]).toHaveFocus()
})

test('Moves focus by a full row with ArrowDown and ArrowUp', async () => {
	const colors = ['#100', '#200', '#300', '#400', '#500', '#600']
	const { user } = setup(Palette, { props: { colors, numColumns: 3 } })

	const slots = await screen.findAllByTestId('__palette-slot__')
	slots[0].focus()
	await user.keyboard('{ArrowDown}')
	expect(slots[3]).toHaveFocus()

	await user.keyboard('{ArrowUp}')
	expect(slots[0]).toHaveFocus()
})

test('Jumps to the first and last slot with Home and End', async () => {
	const colors = ['#ff0', '#0ff', '#f0f', '#fff']
	const { user } = setup(Palette, { colors })

	const slots = await screen.findAllByTestId('__palette-slot__')
	slots[1].focus()
	await user.keyboard('{End}')
	expect(slots[slots.length - 1]).toHaveFocus()

	await user.keyboard('{Home}')
	expect(slots[0]).toHaveFocus()
})

test('Does not select a color while navigating with arrow keys', async () => {
	const onSelect = vi.fn()
	const colors = ['#ff0', '#0ff', '#f0f']
	const { user } = setup(Palette, { props: { colors, onselect: onSelect } })

	const slots = await screen.findAllByTestId('__palette-slot__')
	slots[0].focus()
	await user.keyboard('{ArrowRight}{ArrowRight}')

	expect(onSelect).not.toHaveBeenCalled()
})

test('Includes the transparent slot as the first navigable option', async () => {
	const colors = ['#ff0', '#0ff']
	const { user } = setup(Palette, { props: { colors, showTransparentSlot: true } })

	const slots = await screen.findAllByTestId('__palette-slot__')
	expect(slots).toHaveLength(3)
	expect(slots[0]).toHaveAttribute('aria-label', 'Transparent slot')
	expect(slots[0]).toHaveAttribute('tabindex', '0')

	slots[0].focus()
	await user.keyboard('{ArrowRight}')
	expect(slots[1]).toHaveFocus()
})

test('Navigates across group boundaries with arrow keys', async () => {
	const colors = [
		{ name: 'Reds', colors: ['#f00', '#f11'] },
		{ name: 'Blues', colors: ['#00f', '#11f'] },
	]
	const { user } = setup(Palette, { props: { colors } })

	const slots = await screen.findAllByTestId('__palette-slot__')
	expect(slots).toHaveLength(4)

	slots[1].focus()
	await user.keyboard('{ArrowRight}')
	expect(slots[2]).toHaveFocus()
})

test('Moves between groups by row with ArrowDown and ArrowUp, clamping to the group length', async () => {
	const colors = [
		{ name: 'A', colors: ['#a00', '#a11', '#a22', '#a33'] },
		{ name: 'B', colors: ['#b00', '#b11'] },
		{ name: 'C', colors: ['#c00', '#c11', '#c22'] },
	]
	const { user } = setup(Palette, { props: { colors } })

	const slots = await screen.findAllByTestId('__palette-slot__')

	slots[0].focus()
	await user.keyboard('{ArrowDown}')
	expect(slots[4]).toHaveFocus()
	await user.keyboard('{ArrowDown}')
	expect(slots[6]).toHaveFocus()

	await user.keyboard('{ArrowUp}')
	expect(slots[4]).toHaveFocus()

	slots[3].focus()
	await user.keyboard('{ArrowDown}')
	expect(slots[5]).toHaveFocus()
})

test('Selects the focused slot with Enter and Space', async () => {
	const onSelect = vi.fn()
	const colors = ['#ff0', '#0ff', '#f0f']
	const { user } = setup(Palette, { props: { colors, onselect: onSelect } })

	const slots = await screen.findAllByTestId('__palette-slot__')
	slots[1].focus()
	await user.keyboard('{Enter}')
	expect(onSelect).toHaveBeenLastCalledWith({ color: '#0ff' })

	slots[2].focus()
	await user.keyboard('{ }')
	expect(onSelect).toHaveBeenLastCalledWith({ color: '#f0f' })
})

test('Reflects the selection through aria-selected on the grid options', async () => {
	const colors = ['#ff0', '#0ff', '#f0f']
	setup(Palette, { props: { colors, selectedColor: '#0ff' } })

	const slots = await screen.findAllByTestId('__palette-slot__')
	expect(slots[0]).toHaveAttribute('aria-selected', 'false')
	expect(slots[1]).toHaveAttribute('aria-selected', 'true')
	expect(slots[2]).toHaveAttribute('aria-selected', 'false')
})

test('Reflects the selection through aria-selected in group mode', async () => {
	const colors = [
		{ name: 'Reds', colors: ['#f00', '#f11'] },
		{ name: 'Blues', colors: ['#00f'] },
	]
	setup(Palette, { props: { colors, selectedColor: '#f11' } })

	const slots = await screen.findAllByTestId('__palette-slot__')
	expect(slots[0]).toHaveAttribute('aria-selected', 'false')
	expect(slots[1]).toHaveAttribute('aria-selected', 'true')
	expect(slots[2]).toHaveAttribute('aria-selected', 'false')
})

test('Forwards the roving tabindex to custom slot snippets', async () => {
	const slotSnippet = createRawSnippet((getProps) => ({
		render: () => `<span data-testid="__custom-slot__" data-tabindex="${getProps().tabindex}"></span>`,
	}))
	const colors = ['#ff0', '#0ff', '#f0f']
	setup(Palette, { props: { colors, slot: slotSnippet } })

	const custom = await screen.findAllByTestId('__custom-slot__')
	expect(custom).toHaveLength(3)
	expect(custom[0]).toHaveAttribute('data-tabindex', '0')
	expect(custom[1]).toHaveAttribute('data-tabindex', '-1')
	expect(custom[2]).toHaveAttribute('data-tabindex', '-1')
})

test('Forwards a computed selected flag to custom slot snippets, marking only the first duplicate', async () => {
	const slotSnippet = createRawSnippet((getProps) => ({
		render: () => `<span data-testid="__sel-slot__" data-selected="${getProps().selected}"></span>`,
	}))
	const colors = ['#ff0', '#f0f', '#f0f']
	setup(Palette, { props: { colors, allowDuplicates: true, selectedColor: '#f0f', slot: slotSnippet } })

	const custom = await screen.findAllByTestId('__sel-slot__')
	expect(custom).toHaveLength(3)
	expect(custom[0]).toHaveAttribute('data-selected', 'false')
	expect(custom[1]).toHaveAttribute('data-selected', 'true')
	expect(custom[2]).toHaveAttribute('data-selected', 'false')
})

test('Forwards the computed selected flag to custom slots in group mode', async () => {
	const slotSnippet = createRawSnippet((getProps) => ({
		render: () => `<span data-testid="__grp-sel-slot__" data-selected="${getProps().selected}"></span>`,
	}))
	const colors = [
		{ name: 'Reds', colors: ['#f00', '#f11'] },
		{ name: 'Blues', colors: ['#00f', '#11f'] },
	]
	setup(Palette, { props: { colors, selectedColor: '#11f', slot: slotSnippet } })

	const custom = await screen.findAllByTestId('__grp-sel-slot__')
	expect(custom).toHaveLength(4)
	expect(custom.filter((el) => el.getAttribute('data-selected') === 'true')).toHaveLength(1)
	expect(custom[3]).toHaveAttribute('data-selected', 'true')
})

test('Does not make the cell wrappers focusable', async () => {
	const colors = ['#ff0', '#0ff', '#f0f']
	setup(Palette, { props: { colors, showTransparentSlot: true } })

	const cells = await screen.findAllByTestId('__palette-cell__')
	expect(cells.length).toBeGreaterThan(0)
	cells.forEach((cell) => expect(cell).not.toHaveAttribute('tabindex'))
})

test('Keeps exactly one tabbable slot after the colors change', async () => {
	const colors = ['#100', '#200', '#300', '#400', '#500', '#600']
	const { rerender } = setup(Palette, { props: { colors, numColumns: 3 } })

	let slots = await screen.findAllByTestId('__palette-slot__')
	slots[4].focus()
	await waitFor(() => expect(slots[4]).toHaveAttribute('tabindex', '0'))

	rerender({ colors: ['#aa0', '#bb0', '#cc0'], numColumns: 3 })

	await waitFor(async () => {
		slots = await screen.findAllByTestId('__palette-slot__')
		expect(slots).toHaveLength(3)
		expect(slots.filter((slot) => slot.getAttribute('tabindex') === '0')).toHaveLength(1)
		expect(slots[0]).toHaveAttribute('tabindex', '0')
	})
})

test('Navigates the remaining slots after the colors shrink', async () => {
	const colors = ['#100', '#200', '#300', '#400']
	const { rerender, user } = setup(Palette, { props: { colors, numColumns: 4 } })

	let slots = await screen.findAllByTestId('__palette-slot__')
	slots[0].focus()
	await user.keyboard('{End}')
	expect(slots[3]).toHaveFocus()

	rerender({ colors: ['#aa0', '#bb0'], numColumns: 4 })
	await waitFor(async () => {
		slots = await screen.findAllByTestId('__palette-slot__')
		expect(slots).toHaveLength(2)
	})

	slots[0].focus()
	await user.keyboard('{End}')
	expect(slots[1]).toHaveFocus()
})

test('Reaches a newly added slot with keyboard navigation after the colors grow', async () => {
	const colors = ['#100', '#200']
	const { rerender, user } = setup(Palette, { props: { colors, numColumns: 5 } })

	let slots = await screen.findAllByTestId('__palette-slot__')
	expect(slots).toHaveLength(2)

	rerender({ colors: ['#100', '#200', '#300', '#400'], numColumns: 5 })
	await waitFor(async () => {
		slots = await screen.findAllByTestId('__palette-slot__')
		expect(slots).toHaveLength(4)
	})

	slots[0].focus()
	await user.keyboard('{End}')
	expect(slots[3]).toHaveFocus()
})

test('Renders the edge slots outside the listbox', async () => {
	const beforeSlot = createRawSnippet(() => ({
		render: () => `<div data-testid="__before__"><button>Before</button></div>`,
	}))
	const afterSlot = createRawSnippet(() => ({
		render: () => `<div data-testid="__after__"><button>After</button></div>`,
	}))
	const colors = ['#ff0', '#0ff', '#f0f']
	setup(Palette, { props: { colors, beforeSlot, afterSlot } })

	const listbox = await screen.findByRole('listbox')
	const before = screen.getByTestId('__before__')
	const after = screen.getByTestId('__after__')

	expect(before).toBeInTheDocument()
	expect(after).toBeInTheDocument()
	expect(listbox).not.toContainElement(before)
	expect(listbox).not.toContainElement(after)
	expect(screen.getAllByRole('option')).toHaveLength(3)
})

test('Keeps arrow-key navigation confined to the slots when edge slots are present', async () => {
	const afterSlot = createRawSnippet(() => ({
		render: () => `<div data-testid="__after__"><button>After</button></div>`,
	}))
	const colors = ['#ff0', '#0ff', '#f0f']
	const { user } = setup(Palette, { props: { colors, afterSlot } })

	const slots = await screen.findAllByTestId('__palette-slot__')
	expect(slots).toHaveLength(3)

	slots[2].focus()
	await user.keyboard('{ArrowRight}')

	expect(slots[2]).toHaveFocus()
})

test('Forwards the roving tabindex to a custom transparent slot', async () => {
	const transparentSlot = createRawSnippet((getProps) => ({
		render: () =>
			`<span data-testid="__custom-transparent__" data-tabindex="${getProps().tabindex}" data-selected="${getProps().selected}"></span>`,
	}))
	const colors = ['#ff0', '#0ff']
	setup(Palette, { props: { colors, showTransparentSlot: true, transparentSlot } })

	const custom = await screen.findByTestId('__custom-transparent__')
	expect(custom).toHaveAttribute('data-tabindex', '0')
	expect(custom).toHaveAttribute('data-selected', 'true')
})

test('Marks only the first slot as selected when the selected color is duplicated', async () => {
	const colors = ['#ff0', '#f0f', '#f0f']
	setup(Palette, { props: { colors, allowDuplicates: true, selectedColor: '#f0f' } })

	const slots = await screen.findAllByTestId('__palette-slot__')
	expect(slots.filter((s) => s.getAttribute('aria-selected') === 'true')).toHaveLength(1)
	expect(slots[1]).toHaveAttribute('aria-selected', 'true')
	expect(slots[2]).toHaveAttribute('aria-selected', 'false')
})

test('Keeps ArrowUp and ArrowDown as no-ops on a single visual row', async () => {
	const colors = ['#ff0', '#0ff', '#f0f', '#fff']
	const { user } = setup(Palette, { props: { colors, numColumns: 0 } })

	const slots = await screen.findAllByTestId('__palette-slot__')
	slots[1].focus()
	await user.keyboard('{ArrowDown}')
	expect(slots[1]).toHaveFocus()

	await user.keyboard('{ArrowUp}')
	expect(slots[1]).toHaveFocus()
})

test('Navigates a custom slot that forwards tabindex without role="option"', async () => {
	const slotSnippet = createRawSnippet((getProps) => ({
		render: () => `<button data-testid="__nav-slot__" tabindex="${getProps().tabindex}"></button>`,
	}))
	const colors = ['#ff0', '#0ff', '#f0f']
	const { user } = setup(Palette, { props: { colors, slot: slotSnippet } })

	const custom = await screen.findAllByTestId('__nav-slot__')
	expect(custom).toHaveLength(3)
	expect(custom.some((el) => el.getAttribute('role') === 'option')).toBe(false)
	expect(custom[0]).toHaveAttribute('tabindex', '0')
	expect(custom[1]).toHaveAttribute('tabindex', '-1')
	expect(custom[2]).toHaveAttribute('tabindex', '-1')

	custom[0].focus()
	await user.keyboard('{ArrowRight}')
	expect(custom[1]).toHaveFocus()

	await user.keyboard('{End}')
	expect(custom[2]).toHaveFocus()

	await user.keyboard('{Home}')
	expect(custom[0]).toHaveFocus()
})

test('Navigates custom-slot slots without role="option" across group boundaries', async () => {
	const slotSnippet = createRawSnippet((getProps) => ({
		render: () => `<button data-testid="__nav-slot__" tabindex="${getProps().tabindex}"></button>`,
	}))
	const colors = [
		{ name: 'Reds', colors: ['#f00', '#f11'] },
		{ name: 'Blues', colors: ['#00f', '#11f'] },
	]
	const { user } = setup(Palette, { props: { colors, slot: slotSnippet } })

	const custom = await screen.findAllByTestId('__nav-slot__')
	expect(custom).toHaveLength(4)

	custom[1].focus()
	await user.keyboard('{ArrowRight}')
	expect(custom[2]).toHaveFocus()
})

test('Drops the listbox and option roles in presentational mode', async () => {
	const colors = ['#ff0', '#0ff', '#f0f']
	setup(Palette, { props: { colors, presentational: true } })

	await screen.findAllByTestId('__palette-slot__')
	expect(screen.queryByRole('listbox')).toBeNull()
	expect(screen.queryAllByRole('option')).toHaveLength(0)
})

test('Does not expose aria-selected on the slots in presentational mode', async () => {
	const colors = ['#ff0', '#0ff', '#f0f']
	setup(Palette, { props: { colors, selectedColor: '#0ff', presentational: true } })

	const slots = await screen.findAllByTestId('__palette-slot__')
	slots.forEach((slot) => expect(slot).not.toHaveAttribute('aria-selected'))
})

test('Removes the slots from the tab order in presentational mode', async () => {
	const colors = ['#ff0', '#0ff', '#f0f']
	setup(Palette, { props: { colors, presentational: true } })

	const slots = await screen.findAllByTestId('__palette-slot__')
	slots.forEach((slot) => expect(slot).toHaveAttribute('tabindex', '-1'))
})

test('Disables arrow-key navigation in presentational mode', async () => {
	const colors = ['#ff0', '#0ff', '#f0f']
	const { user } = setup(Palette, { props: { colors, presentational: true } })

	const slots = await screen.findAllByTestId('__palette-slot__')
	slots[0].focus()
	await user.keyboard('{ArrowRight}')

	expect(slots[0]).toHaveFocus()
})

test('Forwards a non-tabbable tabindex to custom slots in presentational mode', async () => {
	const slotSnippet = createRawSnippet((getProps) => ({
		render: () => `<span data-testid="__custom-slot__" data-tabindex="${getProps().tabindex}"></span>`,
	}))
	const colors = ['#ff0', '#0ff', '#f0f']
	setup(Palette, { props: { colors, presentational: true, slot: slotSnippet } })

	const custom = await screen.findAllByTestId('__custom-slot__')
	custom.forEach((el) => expect(el).toHaveAttribute('data-tabindex', '-1'))
})

test('Drops the group roles and reveals the group name in presentational mode', async () => {
	const colors = [
		{ name: 'Reds', colors: ['#f00', '#f11'] },
		{ name: 'Blues', colors: ['#00f'] },
	]
	setup(Palette, { props: { colors, presentational: true } })

	await screen.findAllByTestId('__palette-slot__')
	expect(screen.queryByRole('listbox')).toBeNull()
	expect(screen.queryAllByRole('group')).toHaveLength(0)

	const name = screen.getAllByTestId('__palette-group-name__')[0]
	expect(name).not.toHaveAttribute('aria-hidden')
})

test('Propagates focusColor to the color slots and the transparent slot', async () => {
	const colors = ['#ff0', '#0ff', '#f0f']
	setup(Palette, { props: { colors, showTransparentSlot: true, focusColor: 'red' } })

	const slots = await screen.findAllByTestId('__palette-slot__')
	expect(slots).toHaveLength(colors.length + 1)
	slots.forEach((slot) => expect(slot.getAttribute('style')).toMatch(/--focusColor:\s*red/))
})

test('Propagates focusColor to grouped slots', async () => {
	const colors = [
		{ name: 'Reds', colors: ['#f00', '#f11'] },
		{ name: 'Blues', colors: ['#00f'] },
	]
	setup(Palette, { props: { colors, focusColor: 'red' } })

	const slots = await screen.findAllByTestId('__palette-slot__')
	expect(slots).toHaveLength(3)
	slots.forEach((slot) => expect(slot.getAttribute('style')).toMatch(/--focusColor:\s*red/))
})

test('Leaves the slot focus color to its default when focusColor is unset', async () => {
	const colors = ['#ff0', '#0ff']
	setup(Palette, { props: { colors } })

	const slots = await screen.findAllByTestId('__palette-slot__')
	slots.forEach((slot) => expect(slot.getAttribute('style') ?? '').not.toContain('--focusColor'))
})

test('Sets the --focusColor variable on the root so it cascades to custom slots', async () => {
	const slotSnippet = createRawSnippet(() => ({
		render: () => `<div data-testid="__custom-slot__" class="slot"></div>`,
	}))
	const colors = ['#ff0', '#0ff', '#f0f']
	setup(Palette, { props: { colors, focusColor: 'red', slot: slotSnippet } })

	await screen.findAllByTestId('__custom-slot__')
	const root = screen.getByTestId('__palette__')
	expect(root.getAttribute('style')).toMatch(/--focusColor:\s*red/)
})

test('Does not set the --focusColor variable on the root when focusColor is unset', async () => {
	const colors = ['#ff0', '#0ff']
	setup(Palette, { props: { colors } })

	await screen.findAllByTestId('__palette-slot__')
	const root = screen.getByTestId('__palette__')
	expect(root.getAttribute('style') ?? '').not.toContain('--focusColor')
})

test('Forwards focusColor to custom slot snippets', async () => {
	const slotSnippet = createRawSnippet((getProps) => ({
		render: () => `<span data-testid="__fc-slot__" data-focuscolor="${getProps().focusColor}"></span>`,
	}))
	const colors = ['#ff0', '#0ff', '#f0f']
	setup(Palette, { props: { colors, focusColor: 'red', slot: slotSnippet } })

	const custom = await screen.findAllByTestId('__fc-slot__')
	expect(custom).toHaveLength(3)
	custom.forEach((el) => expect(el).toHaveAttribute('data-focuscolor', 'red'))
})

test('Forwards focusColor to custom slots in group mode', async () => {
	const slotSnippet = createRawSnippet((getProps) => ({
		render: () => `<span data-testid="__fc-grp-slot__" data-focuscolor="${getProps().focusColor}"></span>`,
	}))
	const colors = [
		{ name: 'Reds', colors: ['#f00', '#f11'] },
		{ name: 'Blues', colors: ['#00f'] },
	]
	setup(Palette, { props: { colors, focusColor: 'red', slot: slotSnippet } })

	const custom = await screen.findAllByTestId('__fc-grp-slot__')
	expect(custom).toHaveLength(3)
	custom.forEach((el) => expect(el).toHaveAttribute('data-focuscolor', 'red'))
})

test('Forwards focusColor to a custom transparent slot', async () => {
	const transparentSlot = createRawSnippet((getProps) => ({
		render: () => `<span data-testid="__fc-transparent__" data-focuscolor="${getProps().focusColor}"></span>`,
	}))
	const colors = ['#ff0', '#0ff']
	setup(Palette, { props: { colors, showTransparentSlot: true, focusColor: 'red', transparentSlot } })

	const custom = await screen.findByTestId('__fc-transparent__')
	expect(custom).toHaveAttribute('data-focuscolor', 'red')
})

test('Leaves the forwarded focusColor undefined on custom slots when unset', async () => {
	const slotSnippet = createRawSnippet((getProps) => ({
		render: () => `<span data-testid="__fc-unset__" data-focuscolor="${getProps().focusColor}"></span>`,
	}))
	const colors = ['#ff0', '#0ff']
	setup(Palette, { props: { colors, slot: slotSnippet } })

	const custom = await screen.findAllByTestId('__fc-unset__')
	custom.forEach((el) => expect(el).toHaveAttribute('data-focuscolor', 'undefined'))
})

test('Removes the focused slot with Delete in tooltip deletion mode', async () => {
	const colors = ['#ff0', '#0ff', '#f0f']
	const { user } = setup(Palette, { props: { colors, deletionMode: TOOLTIP } })

	let slots = await screen.findAllByTestId('__palette-slot__')
	slots[1].focus()
	await user.keyboard('{Delete}')

	await waitFor(async () => {
		slots = await screen.findAllByTestId('__palette-slot__')
		expect(slots).toHaveLength(2)
	})
	expect(slots.map((slot) => slot.getAttribute('aria-label'))).toEqual(['#ff0', '#f0f'])
})

test('Removes the focused slot with Backspace', async () => {
	const colors = ['#ff0', '#0ff', '#f0f']
	const { user } = setup(Palette, { props: { colors, deletionMode: TOOLTIP } })

	let slots = await screen.findAllByTestId('__palette-slot__')
	slots[0].focus()
	await user.keyboard('{Backspace}')

	await waitFor(async () => {
		slots = await screen.findAllByTestId('__palette-slot__')
		expect(slots).toHaveLength(2)
	})
	expect(slots.map((slot) => slot.getAttribute('aria-label'))).toEqual(['#0ff', '#f0f'])
})

test('Moves focus to the neighbouring slot after a keyboard deletion', async () => {
	const colors = ['#ff0', '#0ff', '#f0f']
	const { user } = setup(Palette, { props: { colors, deletionMode: TOOLTIP } })

	let slots = await screen.findAllByTestId('__palette-slot__')
	slots[1].focus()
	await user.keyboard('{Delete}')

	await waitFor(async () => {
		slots = await screen.findAllByTestId('__palette-slot__')
		expect(slots).toHaveLength(2)
	})
	expect(slots[1]).toHaveFocus()
	expect(slots[1]).toHaveAttribute('aria-label', '#f0f')
})

test('Clamps focus to the last slot when the last slot is deleted', async () => {
	const colors = ['#ff0', '#0ff', '#f0f']
	const { user } = setup(Palette, { props: { colors, deletionMode: TOOLTIP } })

	let slots = await screen.findAllByTestId('__palette-slot__')
	slots[2].focus()
	await user.keyboard('{Delete}')

	await waitFor(async () => {
		slots = await screen.findAllByTestId('__palette-slot__')
		expect(slots).toHaveLength(2)
	})
	expect(slots[1]).toHaveFocus()
})

test('Removes the focused slot with Delete in drop deletion mode', async () => {
	const colors = ['#ff0', '#0ff', '#f0f']
	const { user } = setup(Palette, { props: { colors, deletionMode: DROP } })

	let slots = await screen.findAllByTestId('__palette-slot__')
	slots[0].focus()
	await user.keyboard('{Delete}')

	await waitFor(async () => {
		slots = await screen.findAllByTestId('__palette-slot__')
		expect(slots).toHaveLength(2)
	})
	expect(slots.map((slot) => slot.getAttribute('aria-label'))).toEqual(['#0ff', '#f0f'])
})

test('Does not delete slots when the deletion mode is none', async () => {
	const colors = ['#ff0', '#0ff', '#f0f']
	const { user } = setup(Palette, { colors })

	const slots = await screen.findAllByTestId('__palette-slot__')
	slots[1].focus()
	await user.keyboard('{Delete}')
	await user.keyboard('{Backspace}')

	expect(screen.getAllByTestId('__palette-slot__')).toHaveLength(3)
})

test('Does not remove the leading transparent slot with Delete', async () => {
	const colors = ['#ff0', '#0ff']
	const { user } = setup(Palette, { props: { colors, showTransparentSlot: true, deletionMode: TOOLTIP } })

	let slots = await screen.findAllByTestId('__palette-slot__')
	expect(slots).toHaveLength(3)
	slots[0].focus()
	await user.keyboard('{Delete}')

	slots = await screen.findAllByTestId('__palette-slot__')
	expect(slots).toHaveLength(3)
})

test('Removes the correct color when a transparent slot precedes the grid', async () => {
	const colors = ['#ff0', '#0ff']
	const { user } = setup(Palette, { props: { colors, showTransparentSlot: true, deletionMode: TOOLTIP } })

	let slots = await screen.findAllByTestId('__palette-slot__')
	slots[1].focus()
	await user.keyboard('{Delete}')

	await waitFor(async () => {
		slots = await screen.findAllByTestId('__palette-slot__')
		expect(slots).toHaveLength(2)
	})
	expect(slots[1]).toHaveAttribute('aria-label', '#0ff')
})

test('Removes the focused slot with Delete in grouped mode', async () => {
	const colors = [
		{ name: 'Reds', colors: ['#f00', '#f11'] },
		{ name: 'Blues', colors: ['#00f', '#11f'] },
	]
	const { user } = setup(Palette, { props: { colors, deletionMode: TOOLTIP } })

	let slots = await screen.findAllByTestId('__palette-slot__')
	expect(slots).toHaveLength(4)
	slots[2].focus()
	await user.keyboard('{Delete}')

	await waitFor(async () => {
		slots = await screen.findAllByTestId('__palette-slot__')
		expect(slots).toHaveLength(3)
	})
	expect(slots.map((slot) => slot.getAttribute('aria-label'))).toEqual(['#f00', '#f11', '#11f'])
})

test('Does not select a color while deleting with the keyboard', async () => {
	const onSelect = vi.fn()
	const colors = ['#ff0', '#0ff', '#f0f']
	const { user } = setup(Palette, { props: { colors, deletionMode: TOOLTIP, onselect: onSelect } })

	const slots = await screen.findAllByTestId('__palette-slot__')
	slots[1].focus()
	await user.keyboard('{Delete}')

	await waitFor(() => expect(screen.getAllByTestId('__palette-slot__')).toHaveLength(2))
	expect(onSelect).not.toHaveBeenCalled()
})

test('Keeps focus on the listbox after deleting the last remaining slot', async () => {
	const colors = ['#ff0']
	const { user } = setup(Palette, { props: { colors, deletionMode: TOOLTIP } })

	const slots = await screen.findAllByTestId('__palette-slot__')
	expect(slots).toHaveLength(1)
	slots[0].focus()
	await user.keyboard('{Delete}')

	await waitFor(() => expect(screen.queryAllByTestId('__palette-slot__')).toHaveLength(0))
	expect(screen.getByRole('listbox')).toHaveFocus()
})

test('Removes the first color of a group that follows an empty group', async () => {
	const colors = [
		{ name: 'Reds', colors: [] },
		{ name: 'Blues', colors: ['#00f', '#11f'] },
	]
	const { user } = setup(Palette, { props: { colors, deletionMode: TOOLTIP } })

	let slots = await screen.findAllByTestId('__palette-slot__')
	expect(slots).toHaveLength(2)
	slots[0].focus()
	await user.keyboard('{Delete}')

	await waitFor(async () => {
		slots = await screen.findAllByTestId('__palette-slot__')
		expect(slots).toHaveLength(1)
	})
	expect(slots[0]).toHaveAttribute('aria-label', '#11f')
})
