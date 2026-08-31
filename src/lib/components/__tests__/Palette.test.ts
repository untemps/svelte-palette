import { render, screen, waitFor } from '@testing-library/svelte/svelte5'
import userEvent from '@testing-library/user-event'
import { createRawSnippet, tick } from 'svelte'

import Palette from '../Palette.svelte'
import PaletteBind from './PaletteBind.test.svelte'
import PaletteReactive from './PaletteReactive.test.svelte'

import { TOOLTIP, DROP } from '../../enums/PaletteDeletionMode'

const setup = (component: Parameters<typeof render>[0], options?: Parameters<typeof render>[1]) => {
	return {
		user: userEvent.setup(),
		...render(component, options),
	}
}

const boundingRect = (left: number, top: number, right: number, bottom: number) =>
	({ left, top, right, bottom, width: right - left, height: bottom - top }) as DOMRect

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

test('Matches selectedColor against slot values case-insensitively', async () => {
	const colors = ['#FF0', '#00FFFF', '#F0F']
	setup(Palette, {
		props: { colors, selectedColor: '#00ffff' },
	})

	const slots = await screen.findAllByTestId('__palette-slot__')
	expect(slots[0]).not.toHaveClass('selected')
	expect(slots[1]).toHaveClass('selected')
	expect(slots[2]).not.toHaveClass('selected')
})

test('Surfaces a named color on the default slot label and title', async () => {
	const colors = [{ name: 'Sunbeam', value: '#ff0' }, { value: '#0ff' }]
	setup(Palette, { props: { colors } })

	const named = await screen.findByLabelText('Sunbeam')
	expect(named).toHaveAttribute('title', 'Sunbeam')

	const bare = screen.getByLabelText('#0ff')
	expect(bare).not.toHaveAttribute('title')
})

test('Displays as many color slots as set in async mode', async () => {
	let cells = null
	const colors = Promise.resolve(['#ff0', '#0ff', '#f0f'])
	setup(Palette, {
		colors,
	})

	cells = await screen.findAllByTestId('__palette-cell__')
	expect(cells).toHaveLength(3)
})

test('Discards a stale async colors promise that settles after a newer one', async () => {
	let resolveStale!: (value: string[]) => void
	let resolveFresh!: (value: string[]) => void
	const stalePromise = new Promise<string[]>((resolve) => (resolveStale = resolve))
	const freshPromise = new Promise<string[]>((resolve) => (resolveFresh = resolve))

	const { component } = setup(PaletteReactive, {
		props: { initialColors: stalePromise },
	})

	// The first (slow) request is in flight; nothing is painted yet.
	await tick()
	expect(screen.queryAllByTestId('__palette-slot__')).toHaveLength(0)

	// A newer request supersedes it before either settles.
	component.setColors(freshPromise)
	await tick()

	// The newer request wins the race and paints its colors.
	resolveFresh(['#111', '#222'])
	await waitFor(() => expect(screen.getAllByTestId('__palette-slot__')).toHaveLength(2))

	// The stale request settles last; it must not clobber the newer result.
	resolveStale(['#aaa', '#bbb', '#ccc'])
	await stalePromise
	await tick()
	await tick()

	const slots = screen.getAllByTestId('__palette-slot__')
	expect(slots).toHaveLength(2)
	expect(slots.map((slot) => slot.getAttribute('aria-label'))).toEqual(['#111', '#222'])
})

test('Renders the default error state when the async colors promise rejects', async () => {
	let rejectColors!: (reason?: unknown) => void
	const colors = new Promise<string[]>((_, reject) => (rejectColors = reject))
	setup(Palette, { props: { colors } })

	expect(await screen.findByRole('status')).toBeInTheDocument()
	expect(screen.queryByRole('alert')).not.toBeInTheDocument()

	rejectColors(new Error('Network down'))

	const alert = await screen.findByRole('alert')
	expect(alert).toHaveTextContent('Colors failed to load')
	expect(alert).toHaveTextContent('Network down')
	expect(screen.queryByRole('status')).not.toBeInTheDocument()
	expect(screen.queryAllByTestId('__palette-slot__')).toHaveLength(0)
})

test('Surfaces an error state even when the rejection reason is falsy', async () => {
	let rejectColors!: (reason?: unknown) => void
	const colors = new Promise<string[]>((_, reject) => (rejectColors = reject))
	setup(Palette, { props: { colors } })

	rejectColors(undefined)

	const alert = await screen.findByRole('alert')
	expect(alert).toHaveTextContent('Colors failed to load')
	expect(screen.queryByRole('status')).not.toBeInTheDocument()
})

test('Invokes onerror with the rejection reason', async () => {
	const onerror = vi.fn()
	let rejectColors!: (reason?: unknown) => void
	const colors = new Promise<string[]>((_, reject) => (rejectColors = reject))
	setup(Palette, { props: { colors, onerror } })

	const reason = new Error('boom')
	rejectColors(reason)

	await waitFor(() => expect(onerror).toHaveBeenCalledTimes(1))
	expect(onerror).toHaveBeenCalledWith({ error: reason })
})

test('Renders a custom error snippet in place of the default error state', async () => {
	const errorSnippet = createRawSnippet((getProps) => ({
		render: () => `<p data-testid="__custom-error__">${(getProps().error as Error).message}</p>`,
	}))
	let rejectColors!: (reason?: unknown) => void
	const colors = new Promise<string[]>((_, reject) => (rejectColors = reject))
	setup(Palette, { props: { colors, error: errorSnippet } })

	rejectColors(new Error('Custom failure'))

	const custom = await screen.findByTestId('__custom-error__')
	expect(custom).toHaveTextContent('Custom failure')
	expect(screen.queryByText('Colors failed to load')).not.toBeInTheDocument()
})

test('Clears the error state when a fresh colors promise resolves', async () => {
	let rejectColors!: (reason?: unknown) => void
	const failing = new Promise<string[]>((_, reject) => (rejectColors = reject))
	const { component } = setup(PaletteReactive, { props: { initialColors: failing } })

	rejectColors(new Error('temporary'))
	await screen.findByRole('alert')

	component.setColors(Promise.resolve(['#111', '#222']))

	await waitFor(() => expect(screen.getAllByTestId('__palette-slot__')).toHaveLength(2))
	expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})

test('Notifies onerror once per failed source, not on later view-param changes', async () => {
	const onerror = vi.fn()
	let rejectColors!: (reason?: unknown) => void
	const failing = new Promise<string[]>((_, reject) => (rejectColors = reject))
	const { component } = setup(PaletteReactive, { props: { initialColors: failing, onerror } })

	rejectColors(new Error('once'))
	await screen.findByRole('alert')
	expect(onerror).toHaveBeenCalledTimes(1)

	component.setIsCompact(true)
	await tick()
	await tick()
	expect(onerror).toHaveBeenCalledTimes(1)
})

test('Notifies onerror when a view param changes while the rejection is still pending', async () => {
	const onerror = vi.fn()
	let rejectColors!: (reason?: unknown) => void
	const failing = new Promise<string[]>((_, reject) => (rejectColors = reject))
	const { component } = setup(PaletteReactive, { props: { initialColors: failing, onerror } })

	await tick()
	component.setIsCompact(true)
	await tick()

	rejectColors(new Error('late'))
	await waitFor(() => expect(onerror).toHaveBeenCalledTimes(1))
	expect(await screen.findByRole('alert')).toBeInTheDocument()
})

test('Replaces a resolved palette with the error state when a new colors promise rejects', async () => {
	let rejectColors!: (reason?: unknown) => void
	const { component } = setup(PaletteReactive, { props: { initialColors: ['#a00', '#0b0', '#00c'] } })

	expect(await screen.findAllByTestId('__palette-slot__')).toHaveLength(3)

	const failing = new Promise<string[]>((_, reject) => (rejectColors = reject))
	component.setColors(failing)
	rejectColors(new Error('refetch failed'))

	await screen.findByRole('alert')
	expect(screen.queryAllByTestId('__palette-slot__')).toHaveLength(0)
})

test('Shows the loader again while a retry promise is pending, clearing the previous error', async () => {
	let rejectColors!: (reason?: unknown) => void
	const failing = new Promise<string[]>((_, reject) => (rejectColors = reject))
	const { component } = setup(PaletteReactive, { props: { initialColors: failing } })

	rejectColors(new Error('first failure'))
	await screen.findByRole('alert')

	let resolveRetry!: (value: string[]) => void
	const retry = new Promise<string[]>((resolve) => (resolveRetry = resolve))
	component.setColors(retry)

	await waitFor(() => expect(screen.getByRole('status')).toBeInTheDocument())
	expect(screen.queryByRole('alert')).not.toBeInTheDocument()

	resolveRetry(['#111', '#222'])
	await waitFor(() => expect(screen.getAllByTestId('__palette-slot__')).toHaveLength(2))
})

test('Discards a stale rejecting colors promise that settles after a newer one', async () => {
	const onerror = vi.fn()
	let rejectStale!: (reason?: unknown) => void
	let resolveFresh!: (value: string[]) => void
	const stalePromise = new Promise<string[]>((_, reject) => (rejectStale = reject))
	const freshPromise = new Promise<string[]>((resolve) => (resolveFresh = resolve))

	const { component } = setup(PaletteReactive, {
		props: { initialColors: stalePromise, onerror },
	})

	await tick()
	expect(screen.queryAllByTestId('__palette-slot__')).toHaveLength(0)

	component.setColors(freshPromise)
	await tick()

	resolveFresh(['#111', '#222'])
	await waitFor(() => expect(screen.getAllByTestId('__palette-slot__')).toHaveLength(2))

	rejectStale(new Error('stale failure'))
	await stalePromise.catch(() => {})
	await tick()
	await tick()

	expect(screen.queryByRole('alert')).not.toBeInTheDocument()
	expect(onerror).not.toHaveBeenCalled()
	const slots = screen.getAllByTestId('__palette-slot__')
	expect(slots).toHaveLength(2)
	expect(slots.map((slot) => slot.getAttribute('aria-label'))).toEqual(['#111', '#222'])
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

test('Scopes the drop deletion area to the owning palette when several are mounted', async () => {
	const colorsA = ['#ff0', '#0ff', '#f0f']
	const colorsB = ['#111', '#222', '#333']

	const { user } = setup(Palette, { props: { colors: colorsA, deletionMode: DROP } })
	const { container: containerB } = render(Palette, { props: { colors: colorsB, deletionMode: DROP } })

	await screen.findAllByTestId('__palette-slot__')

	const [rootA, rootB] = screen.getAllByTestId('__palette__')
	rootA.getBoundingClientRect = () => boundingRect(0, 0, 100, 100)
	rootB.getBoundingClientRect = () => boundingRect(200, 200, 300, 300)

	const cellB = containerB.querySelector('[data-testid="__palette-cell__"]') as HTMLElement

	await user.pointer({ keys: '[MouseLeft>]', target: cellB })
	const drag = document.querySelector('#drag') as HTMLElement
	drag.getBoundingClientRect = () => boundingRect(250, 250, 260, 260)
	await user.pointer('[/MouseLeft]')

	expect(cellB).toBeInTheDocument()
})

test('Deletes a swatch dropped outside its own palette even over another palette', async () => {
	const colorsA = ['#ff0', '#0ff', '#f0f']
	const colorsB = ['#111', '#222', '#333']

	const { user } = setup(Palette, { props: { colors: colorsA, deletionMode: DROP } })
	const { container: containerB } = render(Palette, { props: { colors: colorsB, deletionMode: DROP } })

	await screen.findAllByTestId('__palette-slot__')

	const [rootA, rootB] = screen.getAllByTestId('__palette__')
	rootA.getBoundingClientRect = () => boundingRect(0, 0, 100, 100)
	rootB.getBoundingClientRect = () => boundingRect(200, 200, 300, 300)

	const cellB = containerB.querySelector('[data-testid="__palette-cell__"]') as HTMLElement

	await user.pointer({ keys: '[MouseLeft>]', target: cellB })
	const drag = document.querySelector('#drag') as HTMLElement
	drag.getBoundingClientRect = () => boundingRect(50, 50, 60, 60)
	await user.pointer('[/MouseLeft]')

	expect(cellB).not.toBeInTheDocument()
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

	const cells = await screen.findAllByTestId('__palette-cell__')
	expect(cells).toHaveLength(2)

	const content = document.querySelector('.palette__content')
	await waitFor(() => expect(content.getAttribute('style')).toContain('--num-columns: 2'))

	const toggleButton = await screen.findByTestId('__palette-compact-toggle-button__')
	expect(toggleButton).toBeInTheDocument()

	await user.click(toggleButton)

	await waitFor(() => expect(content).not.toHaveClass('palette__content--compact'))
	await waitFor(() => expect(screen.getAllByTestId('__palette-cell__')).toHaveLength(3))
	await waitFor(() => expect(content.getAttribute('style')).toContain('--num-columns: 5'))
})

test('Extracts the compact subset when the palette is collapsed at runtime', async () => {
	const colors = ['#ff0', '#0ff', '#f0f']
	const compactColorIndices = [0, 1]

	const { user } = setup(Palette, {
		props: { colors, compactColorIndices },
	})

	const cells = await screen.findAllByTestId('__palette-cell__')
	expect(cells).toHaveLength(3)

	const content = document.querySelector('.palette__content')
	await waitFor(() => expect(content.getAttribute('style')).toContain('--num-columns: 5'))

	const toggleButton = await screen.findByTestId('__palette-compact-toggle-button__')
	await user.click(toggleButton)

	await waitFor(() => expect(content).toHaveClass('palette__content--compact'))
	await waitFor(() => expect(screen.getAllByTestId('__palette-cell__')).toHaveLength(2))
	await waitFor(() => expect(content.getAttribute('style')).toContain('--num-columns: 2'))
})

test('Accounts for the transparent slot in the compact column count when collapsed at runtime', async () => {
	const colors = ['#ff0', '#0ff', '#f0f']
	const compactColorIndices = [0, 1]

	const { user } = setup(Palette, {
		props: { colors, compactColorIndices, showTransparentSlot: true },
	})

	await screen.findAllByTestId('__palette-cell__')

	const toggleButton = await screen.findByTestId('__palette-compact-toggle-button__')
	await user.click(toggleButton)

	const content = document.querySelector('.palette__content')
	await waitFor(() => expect(content).toHaveClass('palette__content--compact'))
	await waitFor(() => expect(screen.getAllByTestId('__palette-cell__')).toHaveLength(3))
	await waitFor(() => expect(content.getAttribute('style')).toContain('--num-columns: 3'))
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

test('Surfaces a named color on the default slot inside a group', async () => {
	const colors = [{ name: 'Warm', colors: [{ name: 'Sunbeam', value: '#ff0' }, '#f80'] }]
	setup(Palette, { props: { colors } })

	const named = await screen.findByLabelText('Sunbeam')
	expect(named).toHaveAttribute('title', 'Sunbeam')
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

test('Sets num-columns from the longest group when numColumns is 0 in grouped mode', async () => {
	const colors = [
		{ name: 'A', colors: ['#a00', '#a11'] },
		{ name: 'B', colors: ['#b00', '#b11', '#b22', '#b33', '#b44', '#b55', '#b66'] },
	]

	setup(Palette, { props: { colors, numColumns: 0 } })

	const content = await screen.findByTestId('__palette__')
	const section = content.querySelector('.palette__content')
	await waitFor(() => expect(section.getAttribute('style')).toContain('--num-columns: 7'))
})

test('Keeps the minimum column count when every group is shorter in grouped mode', async () => {
	const colors = [
		{ name: 'A', colors: ['#a00', '#a11'] },
		{ name: 'B', colors: ['#b00', '#b11', '#b22'] },
	]

	setup(Palette, { props: { colors, numColumns: 0 } })

	const content = await screen.findByTestId('__palette__')
	const section = content.querySelector('.palette__content')
	await waitFor(() => expect(section.getAttribute('style')).toContain('--num-columns: 5'))
})

test('Caps num-columns with maxColumns in grouped mode', async () => {
	const colors = [
		{ name: 'A', colors: ['#a00', '#a11'] },
		{ name: 'B', colors: ['#b00', '#b11', '#b22', '#b33', '#b44', '#b55', '#b66'] },
	]

	setup(Palette, { props: { colors, numColumns: 0, maxColumns: 4 } })

	const content = await screen.findByTestId('__palette__')
	const section = content.querySelector('.palette__content')
	await waitFor(() => expect(section.getAttribute('style')).toContain('--num-columns: 4'))
})

test('Recounts num-columns after a slot deletion when numColumns is 0', async () => {
	const colors = ['#100', '#200', '#300', '#400', '#500', '#600', '#700']

	const { user } = setup(Palette, { props: { colors, numColumns: 0, deletionMode: TOOLTIP } })

	const content = await screen.findByTestId('__palette__')
	const section = content.querySelector('.palette__content')
	await waitFor(() => expect(section.getAttribute('style')).toContain('--num-columns: 7'))

	const cells = await screen.findAllByTestId('__palette-cell__')
	await user.hover(cells[0])
	await user.click(await screen.findByTestId('__trash-icon__'))

	await waitFor(() => expect(section.getAttribute('style')).toContain('--num-columns: 6'))
})

test('Recounts num-columns after a slot deletion when numColumns is 0 in grouped mode', async () => {
	const colors = [
		{ name: 'A', colors: ['#a00', '#a11'] },
		{ name: 'B', colors: ['#b00', '#b11', '#b22', '#b33', '#b44', '#b55', '#b66'] },
	]

	const { user } = setup(Palette, { props: { colors, numColumns: 0, deletionMode: TOOLTIP } })

	const content = await screen.findByTestId('__palette__')
	const section = content.querySelector('.palette__content')
	await waitFor(() => expect(section.getAttribute('style')).toContain('--num-columns: 7'))

	const cells = await screen.findAllByTestId('__palette-cell__')
	await user.hover(cells[2])
	await user.click(await screen.findByTestId('__trash-icon__'))

	await waitFor(() => expect(section.getAttribute('style')).toContain('--num-columns: 6'))
})

test('Keeps num-columns at the longest group width when a shorter group shrinks', async () => {
	const colors = [
		{ name: 'A', colors: ['#a00', '#a11'] },
		{ name: 'B', colors: ['#b00', '#b11', '#b22', '#b33', '#b44', '#b55', '#b66'] },
	]

	const { user } = setup(Palette, { props: { colors, numColumns: 0, deletionMode: TOOLTIP } })

	const content = await screen.findByTestId('__palette__')
	const section = content.querySelector('.palette__content')
	await waitFor(() => expect(section.getAttribute('style')).toContain('--num-columns: 7'))

	const cells = await screen.findAllByTestId('__palette-cell__')
	await user.hover(cells[0])
	await user.click(await screen.findByTestId('__trash-icon__'))

	await waitFor(() => expect(screen.queryAllByTestId('__palette-cell__')).toHaveLength(8))
	await waitFor(() => expect(section.getAttribute('style')).toContain('--num-columns: 7'))
})

test('Recounts num-columns after a compact slot deletion when the full list holds case-varying duplicates', async () => {
	const onDelete = vi.fn()
	const colors = ['#AABBCC', '#112233', '#aabbcc', '#445566', '#778899', '#99aabb', '#bbccdd', '#ccddee']

	const { user } = setup(Palette, {
		props: {
			colors,
			numColumns: 0,
			isCompact: true,
			compactColorIndices: [0, 1, 2, 3, 4, 5, 6, 7],
			deletionMode: TOOLTIP,
			ondelete: onDelete,
		},
	})

	const content = await screen.findByTestId('__palette__')
	const section = content.querySelector('.palette__content')
	await waitFor(() => expect(section.getAttribute('style')).toContain('--num-columns: 7'))

	const cells = await screen.findAllByTestId('__palette-cell__')
	expect(cells).toHaveLength(7)

	await user.hover(cells[2])
	await user.click(await screen.findByTestId('__trash-icon__'))

	await waitFor(() => expect(screen.queryAllByTestId('__palette-cell__')).toHaveLength(6))
	await waitFor(() => expect(section.getAttribute('style')).toContain('--num-columns: 6'))
	expect(onDelete).toHaveBeenCalledWith(expect.objectContaining({ color: '#445566', index: 3 }))
})

test('Recounts num-columns from the rendered subset when a compact deletion desyncs', async () => {
	const onDelete = vi.fn()

	const { component, user } = setup(PaletteReactive, {
		props: {
			initialColors: ['#a00', '#0b0', '#00c'],
			initialIsCompact: true,
			initialCompactColorIndices: [0, 1],
			initialNumColumns: 0,
			deletionMode: TOOLTIP,
			ondelete: onDelete,
		},
	})

	const cells = await screen.findAllByTestId('__palette-cell__')
	expect(cells).toHaveLength(2)

	const section = document.querySelector('.palette__content')
	await waitFor(() => expect(section.getAttribute('style')).toContain('--num-columns: 2'))

	component.setColors(new Promise(() => {}))
	component.setCompactColorIndices([])

	await user.hover(cells[0])
	await user.click(await screen.findByTestId('__trash-icon__'))

	await waitFor(() => expect(screen.getAllByTestId('__palette-cell__')).toHaveLength(1))
	await waitFor(() => expect(section.getAttribute('style')).toContain('--num-columns: 1'))
	expect(onDelete).not.toHaveBeenCalled()
})

test('Recounts num-columns from the rendered subset when stale compact indices undercount it', async () => {
	const onDelete = vi.fn()

	const { component, user } = setup(PaletteReactive, {
		props: {
			initialColors: ['#a00', '#0b0', '#00c'],
			initialIsCompact: true,
			initialCompactColorIndices: [0, 1, 2],
			initialNumColumns: 0,
			deletionMode: TOOLTIP,
			ondelete: onDelete,
		},
	})

	const cells = await screen.findAllByTestId('__palette-cell__')
	expect(cells).toHaveLength(3)

	const section = document.querySelector('.palette__content')
	await waitFor(() => expect(section.getAttribute('style')).toContain('--num-columns: 3'))

	component.setColors(new Promise(() => {}))
	component.setCompactColorIndices([2])

	await user.hover(cells[0])
	await user.click(await screen.findByTestId('__trash-icon__'))

	await waitFor(() => expect(screen.getAllByTestId('__palette-cell__')).toHaveLength(2))
	await waitFor(() => expect(section.getAttribute('style')).toContain('--num-columns: 2'))
	expect(onDelete).not.toHaveBeenCalled()
})

test('Keeps num-columns at one column when a compact deletion empties the rendered subset', async () => {
	const colors = ['#a00', '#0b0']

	const { user } = setup(Palette, {
		props: { colors, isCompact: true, compactColorIndices: [0], deletionMode: TOOLTIP },
	})

	const content = await screen.findByTestId('__palette__')
	const section = content.querySelector('.palette__content')

	const cells = await screen.findAllByTestId('__palette-cell__')
	expect(cells).toHaveLength(1)

	await user.hover(cells[0])
	await user.click(await screen.findByTestId('__trash-icon__'))

	await waitFor(() => expect(screen.queryAllByTestId('__palette-cell__')).toHaveLength(0))
	await waitFor(() => expect(section.getAttribute('style')).toContain('--num-columns: 1'))
})

test('Removes duplicates when updating allowDuplicates value', async () => {
	const colors = ['#ff0', '#0ff', '#f0f', '#f0f', '#f0f']

	const { component } = setup(PaletteReactive, {
		props: { initialColors: colors, initialAllowDuplicates: true },
	})

	const slots = await screen.findAllByTestId('__palette-slot__')
	expect(slots).toHaveLength(colors.length)

	component.setAllowDuplicates(false)

	await waitFor(() => expect(screen.getAllByTestId('__palette-slot__')).toHaveLength(3))
})

test('Applies maxColors when it changes from a reactive parent', async () => {
	const colors = ['#ff0', '#0ff', '#f0f', '#00f']

	const { component } = setup(PaletteReactive, {
		props: { initialColors: colors, initialMaxColors: 4 },
	})

	const cells = await screen.findAllByTestId('__palette-cell__')
	expect(cells).toHaveLength(4)

	component.setMaxColors(2)

	await waitFor(() => expect(screen.getAllByTestId('__palette-cell__')).toHaveLength(2))
})

test('Applies the compact subset when isCompact changes from a reactive parent', async () => {
	const colors = ['#ff0', '#0ff', '#f0f']

	const { component } = setup(PaletteReactive, {
		props: { initialColors: colors, initialCompactColorIndices: [0, 1] },
	})

	const cells = await screen.findAllByTestId('__palette-cell__')
	expect(cells).toHaveLength(3)

	component.setIsCompact(true)

	await waitFor(() => expect(screen.getAllByTestId('__palette-cell__')).toHaveLength(2))

	component.setIsCompact(false)

	await waitFor(() => expect(screen.getAllByTestId('__palette-cell__')).toHaveLength(3))
})

test('Re-extracts the compact subset when compactColorIndices change', async () => {
	const colors = ['#ff0', '#0ff', '#f0f']

	const { component } = setup(PaletteReactive, {
		props: { initialColors: colors, initialIsCompact: true, initialCompactColorIndices: [0, 1] },
	})

	const slots = await screen.findAllByTestId('__palette-slot__')
	expect(slots).toHaveLength(2)

	component.setCompactColorIndices([2])

	await waitFor(() => {
		const remaining = screen.getAllByTestId('__palette-slot__')
		expect(remaining).toHaveLength(1)
		expect(remaining[0]).toHaveAttribute('aria-label', '#f0f')
	})
})

test('Re-extracts the compact subset when compactColorIndices are mutated in place', async () => {
	const colors = ['#ff0', '#0ff', '#f0f']

	const { component } = setup(PaletteReactive, {
		props: { initialColors: colors, initialIsCompact: true, initialCompactColorIndices: [0, 1] },
	})

	const slots = await screen.findAllByTestId('__palette-slot__')
	expect(slots).toHaveLength(2)

	component.appendCompactColorIndex(2)

	await waitFor(() => expect(screen.getAllByTestId('__palette-slot__')).toHaveLength(3))
})

test('Recomputes the compact column count when showTransparentSlot changes', async () => {
	const colors = ['#ff0', '#0ff', '#f0f']

	const { component } = setup(PaletteReactive, {
		props: { initialColors: colors, initialIsCompact: true, initialCompactColorIndices: [0, 1] },
	})

	const cells = await screen.findAllByTestId('__palette-cell__')
	expect(cells).toHaveLength(2)

	const content = document.querySelector('.palette__content')
	await waitFor(() => expect(content.getAttribute('style')).toContain('--num-columns: 2'))

	component.setShowTransparentSlot(true)

	await waitFor(() => expect(screen.getAllByTestId('__palette-cell__')).toHaveLength(3))
	await waitFor(() => expect(content.getAttribute('style')).toContain('--num-columns: 3'))
})

test('Falls back to a local removal when the rendered subset drifts from the full list', async () => {
	const onDelete = vi.fn()

	const { component, user } = setup(PaletteReactive, {
		props: {
			initialColors: ['#a00', '#0b0', '#00c'],
			initialIsCompact: true,
			initialCompactColorIndices: [0, 1],
			deletionMode: TOOLTIP,
			ondelete: onDelete,
		},
	})

	const cells = await screen.findAllByTestId('__palette-cell__')
	expect(cells).toHaveLength(2)

	component.setColors(new Promise(() => {}))
	component.setCompactColorIndices([2])

	await user.hover(cells[0])
	const trash = await screen.findByTestId('__trash-icon__')
	await user.click(trash)

	expect(onDelete).not.toHaveBeenCalled()
	await waitFor(() => expect(screen.getAllByTestId('__palette-cell__')).toHaveLength(1))
})

test('Applies an isCompact change made inside ondelete alongside the write-back', async () => {
	const colors = ['#a00', '#0b0', '#00c', '#dd0']

	let palette: { setIsCompact: (value: boolean) => void } | undefined
	const { component, user } = setup(PaletteReactive, {
		props: {
			initialColors: colors,
			initialCompactColorIndices: [0, 1],
			deletionMode: TOOLTIP,
			ondelete: () => palette?.setIsCompact(true),
		},
	})
	palette = component

	const cells = await screen.findAllByTestId('__palette-cell__')
	expect(cells).toHaveLength(4)

	await user.hover(cells[3])
	const trash = await screen.findByTestId('__trash-icon__')
	await user.click(trash)

	const content = document.querySelector('.palette__content')
	await waitFor(() => expect(content).toHaveClass('palette__content--compact'))
	await waitFor(() => expect(screen.getAllByTestId('__palette-cell__')).toHaveLength(2))
	await waitFor(() => expect(content.getAttribute('style')).toContain('--num-columns: 2'))
})

test('Toggles the input when colors switch between grouped and flat', async () => {
	const groups = [
		{ name: 'Reds', colors: ['#f00'] },
		{ name: 'Blues', colors: ['#00f'] },
	]

	const { component } = setup(PaletteReactive, {
		props: { initialColors: groups, initialShowInput: true },
	})

	await screen.findAllByTestId('__palette-group__')
	expect(screen.queryByTestId('__palette-input-input__')).not.toBeInTheDocument()

	component.setColors(['#ff0', '#0ff'])

	await waitFor(() => expect(screen.getByTestId('__palette-input-input__')).toBeInTheDocument())

	component.setColors(groups)

	await waitFor(() => expect(screen.queryByTestId('__palette-input-input__')).not.toBeInTheDocument())
})

test('Does not expose a main landmark on the root', async () => {
	const colors = ['#ff0', '#0ff', '#f0f']
	setup(Palette, { colors })

	await screen.findAllByTestId('__palette-slot__')
	expect(screen.queryByRole('main')).toBeNull()

	const root = screen.getByTestId('__palette__')
	expect(root).toHaveAttribute('data-palette')
})

test('Forwards style and extra attributes to the root element', async () => {
	const colors = ['#ff0', '#0ff', '#f0f']
	setup(Palette, {
		props: { colors, style: '--palette-surface: #123456;', 'data-palette-theme': 'dark' },
	})

	await screen.findAllByTestId('__palette-slot__')

	const root = screen.getByTestId('__palette__')
	expect(root.style.getPropertyValue('--palette-surface')).toBe('#123456')
	expect(root).toHaveAttribute('data-palette-theme', 'dark')
	expect(root).toHaveAttribute('data-palette')
	expect(root).toHaveClass('palette')
})

test('Exposes the slot grid as a listbox', async () => {
	const colors = ['#ff0', '#0ff', '#f0f']
	setup(Palette, { colors })

	const listbox = await screen.findByRole('listbox')
	expect(listbox).toHaveAttribute('aria-label', 'Color slots')
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

test('Clamps the column when the last visual row is shorter', async () => {
	const colors = ['#100', '#200', '#300', '#400', '#500', '#600']
	const { user } = setup(Palette, { props: { colors, numColumns: 4 } })

	const slots = await screen.findAllByTestId('__palette-slot__')
	slots[2].focus()
	await user.keyboard('{ArrowDown}')
	expect(slots[5]).toHaveFocus()

	await user.keyboard('{ArrowUp}')
	expect(slots[1]).toHaveFocus()
})

test('Steps by rendered cell when a custom slot drops out of the option list', async () => {
	const slotSnippet = createRawSnippet((getProps) => ({
		render: () =>
			getProps().color === '#300'
				? `<div data-testid="__inert-slot__"></div>`
				: `<span data-testid="__nav-slot__" role="option" tabindex="${getProps().tabindex}"></span>`,
	}))
	const colors = ['#100', '#200', '#300', '#400', '#500', '#600']
	const { user } = setup(Palette, { props: { colors, numColumns: 4, slot: slotSnippet } })

	const slots = await screen.findAllByTestId('__nav-slot__')
	expect(slots).toHaveLength(5)

	slots[0].focus()
	await user.keyboard('{ArrowDown}')
	expect(slots[3]).toHaveFocus()
})

test('Falls back to the first slot of the target row when no slot reaches the column', async () => {
	const slotSnippet = createRawSnippet((getProps) => ({
		render: () =>
			getProps().color === '#500'
				? `<div data-testid="__inert-slot__"></div>`
				: `<span data-testid="__nav-slot__" role="option" tabindex="${getProps().tabindex}"></span>`,
	}))
	const colors = ['#100', '#200', '#300', '#400', '#500', '#600', '#700', '#800']
	const { user } = setup(Palette, { props: { colors, numColumns: 4, slot: slotSnippet } })

	const slots = await screen.findAllByTestId('__nav-slot__')
	expect(slots).toHaveLength(7)

	slots[0].focus()
	await user.keyboard('{ArrowDown}')
	expect(slots[4]).toHaveFocus()
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

test('Moves by visual row inside a group holding more colors than numColumns', async () => {
	const colors = [
		{ name: 'A', colors: ['#a00', '#a11', '#a22', '#a33', '#a44', '#a55', '#a66'] },
		{ name: 'B', colors: ['#b00', '#b11', '#b22'] },
	]
	const { user } = setup(Palette, { props: { colors, numColumns: 4 } })

	const slots = await screen.findAllByTestId('__palette-slot__')

	slots[0].focus()
	await user.keyboard('{ArrowDown}')
	expect(slots[4]).toHaveFocus()

	await user.keyboard('{ArrowDown}')
	expect(slots[7]).toHaveFocus()

	await user.keyboard('{ArrowUp}')
	expect(slots[4]).toHaveFocus()

	await user.keyboard('{ArrowUp}')
	expect(slots[0]).toHaveFocus()
})

test('Clamps the column when the next visual row of a group is shorter', async () => {
	const colors = [
		{ name: 'A', colors: ['#a00', '#a11', '#a22', '#a33', '#a44', '#a55'] },
		{ name: 'B', colors: ['#b00', '#b11', '#b22', '#b33'] },
	]
	const { user } = setup(Palette, { props: { colors, numColumns: 4 } })

	const slots = await screen.findAllByTestId('__palette-slot__')

	slots[3].focus()
	await user.keyboard('{ArrowDown}')
	expect(slots[5]).toHaveFocus()

	await user.keyboard('{ArrowDown}')
	expect(slots[7]).toHaveFocus()
})

test('Keeps ArrowUp and ArrowDown as no-ops on the outer edges of a grouped palette', async () => {
	const colors = [
		{ name: 'A', colors: ['#a00', '#a11', '#a22', '#a33', '#a44'] },
		{ name: 'B', colors: ['#b00', '#b11'] },
	]
	const { user } = setup(Palette, { props: { colors, numColumns: 4 } })

	const slots = await screen.findAllByTestId('__palette-slot__')

	slots[0].focus()
	await user.keyboard('{ArrowUp}')
	expect(slots[0]).toHaveFocus()

	slots[6].focus()
	await user.keyboard('{ArrowDown}')
	expect(slots[6]).toHaveFocus()
})

test('Steps by rendered cell inside a group when a custom slot drops out of the option list', async () => {
	const slotSnippet = createRawSnippet((getProps) => ({
		render: () =>
			getProps().color === '#a11'
				? `<div data-testid="__inert-slot__"></div>`
				: `<span data-testid="__nav-slot__" role="option" tabindex="${getProps().tabindex}"></span>`,
	}))
	const colors = [{ name: 'A', colors: ['#a00', '#a11', '#a22', '#a33', '#a44', '#a55'] }]
	const { user } = setup(Palette, { props: { colors, numColumns: 4, slot: slotSnippet } })

	const slots = await screen.findAllByTestId('__nav-slot__')
	expect(slots).toHaveLength(5)

	slots[0].focus()
	await user.keyboard('{ArrowDown}')
	expect(slots[3]).toHaveFocus()
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

test('Keeps deletion cells out of the tab order', async () => {
	const colors = ['#ff0', '#0ff', '#f0f']
	setup(Palette, { props: { colors, deletionMode: TOOLTIP } })

	const cells = await screen.findAllByTestId('__palette-cell__')
	expect(cells.length).toBeGreaterThan(0)
	// The deletion tooltip would otherwise mark each cell tabindex="0"; the explicit
	// tabindex="-1" keeps the listbox a single tab stop and blocks that.
	cells.forEach((cell) => {
		expect(cell).toHaveAttribute('tabindex', '-1')
		expect(cell).not.toHaveAttribute('tabindex', '0')
	})
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

test('Announces the Delete shortcut on the slots when a deletionMode is set', async () => {
	const colors = ['#ff0', '#0ff', '#f0f']
	setup(Palette, { props: { colors, deletionMode: TOOLTIP } })

	const slots = await screen.findAllByTestId('__palette-slot__')
	slots.forEach((slot) => expect(slot).toHaveAttribute('aria-keyshortcuts', 'Delete Backspace'))
})

test('Announces the Delete shortcut on the slots in drop deletion mode', async () => {
	const colors = ['#ff0', '#0ff', '#f0f']
	setup(Palette, { props: { colors, deletionMode: DROP } })

	const slots = await screen.findAllByTestId('__palette-slot__')
	slots.forEach((slot) => expect(slot).toHaveAttribute('aria-keyshortcuts', 'Delete Backspace'))
})

test('Does not announce the Delete shortcut when the deletion mode is none', async () => {
	const colors = ['#ff0', '#0ff', '#f0f']
	setup(Palette, { colors })

	const slots = await screen.findAllByTestId('__palette-slot__')
	slots.forEach((slot) => expect(slot).not.toHaveAttribute('aria-keyshortcuts'))
})

test('Does not announce the Delete shortcut on the non-deletable transparent slot', async () => {
	const colors = ['#ff0', '#0ff']
	setup(Palette, { props: { colors, showTransparentSlot: true, deletionMode: TOOLTIP } })

	const slots = await screen.findAllByTestId('__palette-slot__')
	expect(slots).toHaveLength(3)
	expect(slots[0]).toHaveAttribute('aria-label', 'Transparent slot')
	expect(slots[0]).not.toHaveAttribute('aria-keyshortcuts')
	expect(slots[1]).toHaveAttribute('aria-keyshortcuts', 'Delete Backspace')
	expect(slots[2]).toHaveAttribute('aria-keyshortcuts', 'Delete Backspace')
})

test('Announces the Delete shortcut on grouped slots', async () => {
	const colors = [
		{ name: 'Reds', colors: ['#f00', '#f11'] },
		{ name: 'Blues', colors: ['#00f'] },
	]
	setup(Palette, { props: { colors, deletionMode: TOOLTIP } })

	const slots = await screen.findAllByTestId('__palette-slot__')
	expect(slots).toHaveLength(3)
	slots.forEach((slot) => expect(slot).toHaveAttribute('aria-keyshortcuts', 'Delete Backspace'))
})

test('Does not announce the Delete shortcut in presentational mode', async () => {
	const colors = ['#ff0', '#0ff', '#f0f']
	setup(Palette, { props: { colors, deletionMode: TOOLTIP, presentational: true } })

	const slots = await screen.findAllByTestId('__palette-slot__')
	slots.forEach((slot) => expect(slot).not.toHaveAttribute('aria-keyshortcuts'))
})

test('Forwards the Delete shortcut to custom slot snippets when a deletionMode is set', async () => {
	const slotSnippet = createRawSnippet((getProps) => ({
		render: () => `<span data-testid="__ks-slot__" data-shortcut="${getProps().ariaKeyShortcuts}"></span>`,
	}))
	const colors = ['#ff0', '#0ff', '#f0f']
	setup(Palette, { props: { colors, deletionMode: TOOLTIP, slot: slotSnippet } })

	const custom = await screen.findAllByTestId('__ks-slot__')
	expect(custom).toHaveLength(3)
	custom.forEach((el) => expect(el).toHaveAttribute('data-shortcut', 'Delete Backspace'))
})

test('Forwards the Delete shortcut to custom slots in group mode', async () => {
	const slotSnippet = createRawSnippet((getProps) => ({
		render: () => `<span data-testid="__ks-grp-slot__" data-shortcut="${getProps().ariaKeyShortcuts}"></span>`,
	}))
	const colors = [
		{ name: 'Reds', colors: ['#f00', '#f11'] },
		{ name: 'Blues', colors: ['#00f'] },
	]
	setup(Palette, { props: { colors, deletionMode: TOOLTIP, slot: slotSnippet } })

	const custom = await screen.findAllByTestId('__ks-grp-slot__')
	expect(custom).toHaveLength(3)
	custom.forEach((el) => expect(el).toHaveAttribute('data-shortcut', 'Delete Backspace'))
})

test('Leaves the forwarded Delete shortcut undefined on custom slots when deletion is off', async () => {
	const slotSnippet = createRawSnippet((getProps) => ({
		render: () => `<span data-testid="__ks-unset__" data-shortcut="${getProps().ariaKeyShortcuts}"></span>`,
	}))
	const colors = ['#ff0', '#0ff']
	setup(Palette, { props: { colors, slot: slotSnippet } })

	const custom = await screen.findAllByTestId('__ks-unset__')
	custom.forEach((el) => expect(el).toHaveAttribute('data-shortcut', 'undefined'))
})

test('Triggers onadd with the added color and the resulting list', async () => {
	const onAdd = vi.fn()
	const colors = ['#ff0', '#0ff', '#f0f']

	const { user } = setup(Palette, {
		props: { colors, showInput: true, onadd: onAdd },
	})

	const input = await screen.findByTestId('__palette-input-input__')
	await user.type(input, '0f0')

	const submit = await screen.findByTestId('__palette-input-submit__')
	await user.click(submit)

	expect(onAdd).toHaveBeenCalledWith({
		color: '#0f0',
		colors: [{ value: '#ff0' }, { value: '#0ff' }, { value: '#f0f' }, { value: '#0f0' }],
	})
})

test('Triggers ondelete with the removed color and the resulting list in flat mode', async () => {
	const onDelete = vi.fn()
	const colors = ['#ff0', '#0ff', '#f0f']

	const { user } = setup(Palette, {
		props: { colors, deletionMode: TOOLTIP, ondelete: onDelete },
	})

	const cells = await screen.findAllByTestId('__palette-cell__')
	await user.hover(cells[0])

	const trash = await screen.findByTestId('__trash-icon__')
	await user.click(trash)

	expect(onDelete).toHaveBeenCalledWith({
		color: '#ff0',
		index: 0,
		colors: [{ value: '#0ff' }, { value: '#f0f' }],
	})
})

test('Triggers ondelete with the group identity in group mode', async () => {
	const onDelete = vi.fn()
	const colors = [
		{ name: 'Reds', colors: ['#f00', '#f11', '#f22'] },
		{ name: 'Blues', colors: ['#00f', '#11f'] },
	]

	const { user } = setup(Palette, {
		props: { colors, deletionMode: TOOLTIP, ondelete: onDelete },
	})

	const cells = await screen.findAllByTestId('__palette-cell__')
	await user.hover(cells[4])

	const trash = await screen.findByTestId('__trash-icon__')
	await user.click(trash)

	expect(onDelete).toHaveBeenCalledWith({
		color: '#11f',
		index: 1,
		groupIndex: 1,
		groupName: 'Blues',
		colors: [
			{ name: 'Reds', colors: [{ value: '#f00' }, { value: '#f11' }, { value: '#f22' }] },
			{ name: 'Blues', colors: [{ value: '#00f' }] },
		],
	})
})

test('Omits groupName in ondelete when the group has no name', async () => {
	const onDelete = vi.fn()
	const colors = [{ colors: ['#f00', '#0f0'] }]

	const { user } = setup(Palette, {
		props: { colors, deletionMode: TOOLTIP, ondelete: onDelete },
	})

	const cells = await screen.findAllByTestId('__palette-cell__')
	await user.hover(cells[0])

	const trash = await screen.findByTestId('__trash-icon__')
	await user.click(trash)

	expect(onDelete).toHaveBeenCalledWith(expect.objectContaining({ color: '#f00', index: 0, groupIndex: 0 }))
	expect(onDelete).toHaveBeenCalledWith(expect.not.objectContaining({ groupName: expect.anything() }))
})

test('Does not fire onadd when the color is a rejected duplicate', async () => {
	const onAdd = vi.fn()
	const colors = ['#ff0', '#0ff', '#f0f']

	const { user } = setup(Palette, {
		props: { colors, showInput: true, onadd: onAdd },
	})

	const input = await screen.findByTestId('__palette-input-input__')
	await user.type(input, 'f0f')

	const submit = await screen.findByTestId('__palette-input-submit__')
	await user.click(submit)

	expect(onAdd).not.toHaveBeenCalled()
})

test('Does not render the input in grouped mode', async () => {
	const colors = [
		{ name: 'Reds', colors: ['#f00'] },
		{ name: 'Blues', colors: ['#00f'] },
	]

	setup(Palette, {
		props: { colors, showInput: true },
	})

	const groups = await screen.findAllByTestId('__palette-group__')
	expect(groups).toHaveLength(2)
	expect(screen.queryByTestId('__palette-input-input__')).not.toBeInTheDocument()
})

test('Does not render the input once async colors resolve to groups', async () => {
	const colors = Promise.resolve([
		{ name: 'Reds', colors: ['#f00'] },
		{ name: 'Blues', colors: ['#00f'] },
	])

	setup(Palette, {
		props: { colors, showInput: true },
	})

	const groups = await screen.findAllByTestId('__palette-group__')
	expect(groups).toHaveLength(2)
	expect(screen.queryByTestId('__palette-input-input__')).not.toBeInTheDocument()
})

test('Does not render a custom input snippet in grouped mode', async () => {
	const input = createRawSnippet(() => ({
		render: () => `<div data-testid="__custom-input__"></div>`,
	}))
	const colors = [
		{ name: 'Reds', colors: ['#f00'] },
		{ name: 'Blues', colors: ['#00f'] },
	]

	setup(Palette, {
		props: { colors, showInput: true, input },
	})

	const groups = await screen.findAllByTestId('__palette-group__')
	expect(groups).toHaveLength(2)
	expect(screen.queryByTestId('__custom-input__')).not.toBeInTheDocument()
})

test('Renders the input only once a pending colors source resolves', async () => {
	let resolveColors: (value: string[]) => void = () => {}
	const colors = new Promise<string[]>((resolve) => (resolveColors = resolve))

	setup(Palette, {
		props: { colors, showInput: true },
	})

	await screen.findByTestId('__palette__')
	expect(screen.queryByTestId('__palette-input-input__')).not.toBeInTheDocument()

	resolveColors(['#ff0', '#0ff'])

	await waitFor(() => expect(screen.getByTestId('__palette-input-input__')).toBeInTheDocument())
})

test('Renders the compact tool only once a pending colors source resolves', async () => {
	let resolveColors: (value: string[]) => void = () => {}
	const colors = new Promise<string[]>((resolve) => (resolveColors = resolve))

	setup(Palette, {
		props: { colors, compactColorIndices: [0, 1] },
	})

	await screen.findByTestId('__palette__')
	expect(screen.queryByTestId('__palette-compact-toggle-button__')).not.toBeInTheDocument()

	resolveColors(['#ff0', '#0ff', '#f0f'])

	await waitFor(() => expect(screen.getByTestId('__palette-compact-toggle-button__')).toBeInTheDocument())
})

test('Does not render the input when colors is null', async () => {
	setup(Palette, {
		props: { colors: null, showInput: true },
	})

	await screen.findByTestId('__palette__')
	expect(screen.queryByTestId('__palette-input-input__')).not.toBeInTheDocument()
})

test('Renders the expand button only once a pending colors source resolves in compact mode', async () => {
	let resolveColors: (value: string[]) => void = () => {}
	const colors = new Promise<string[]>((resolve) => (resolveColors = resolve))

	setup(Palette, {
		props: { colors, isCompact: true, compactColorIndices: [0, 1] },
	})

	await screen.findByTestId('__palette__')
	expect(screen.queryByTestId('__palette-compact-toggle-button__')).not.toBeInTheDocument()

	resolveColors(['#ff0', '#0ff', '#f0f'])

	await waitFor(() => expect(screen.getByTestId('__palette-compact-toggle-button__')).toBeInTheDocument())
})

test('Does not render the expand button in grouped mode when isCompact is set', async () => {
	const colors = [
		{ name: 'Reds', colors: ['#f00'] },
		{ name: 'Blues', colors: ['#00f'] },
	]

	setup(Palette, {
		props: { colors, isCompact: true },
	})

	const groups = await screen.findAllByTestId('__palette-group__')
	expect(groups).toHaveLength(2)
	expect(screen.queryByTestId('__palette-compact-toggle-button__')).not.toBeInTheDocument()
})

test('Ignores a compact tool selection from a custom tools snippet while colors are unresolved', async () => {
	let resolveColors: (value: string[]) => void = () => {}
	const colors = new Promise<string[]>((resolve) => (resolveColors = resolve))

	const toolsSnippet = createRawSnippet((getProps) => ({
		render: () => `<button data-testid="__custom-compact-tool__">Compact</button>`,
		setup: (element) => {
			element.addEventListener('click', () => getProps().onSelect('compact'))
		},
	}))
	const settingsSnippet = createRawSnippet(() => ({
		render: () => `<div data-testid="__custom-settings__"></div>`,
	}))

	const { user } = setup(Palette, {
		props: { colors, tools: toolsSnippet, settings: settingsSnippet },
	})

	const content = document.querySelector('.palette__content')
	const tool = await screen.findByTestId('__custom-compact-tool__')

	await user.click(tool)
	expect(content).not.toHaveClass('palette__content--compact')

	resolveColors(['#ff0', '#0ff'])
	await waitFor(() => expect(screen.getAllByTestId('__palette-slot__')).toHaveLength(2))

	await user.click(tool)
	await waitFor(() => expect(content).toHaveClass('palette__content--compact'))
})

test('Keeps the previous list and its affordances while a replacement source is pending', async () => {
	const { component } = setup(PaletteReactive, {
		props: { initialColors: ['#ff0', '#0ff'], initialShowInput: true },
	})

	await screen.findAllByTestId('__palette-slot__')
	await screen.findByTestId('__palette-input-input__')

	component.setColors(new Promise<string[]>(() => {}))
	await new Promise((resolve) => setTimeout(resolve, 0))

	expect(screen.getAllByTestId('__palette-slot__')).toHaveLength(2)
	expect(screen.getByTestId('__palette-input-input__')).toBeInTheDocument()
})

test('Fires ondelete and propagates a compact-mode deletion to the full list', async () => {
	const onDelete = vi.fn()
	const colors = Array.from({ length: 10 }, (_, i) => `#${i.toString(16).padStart(6, '0')}`)

	const { user } = setup(Palette, {
		props: {
			colors,
			isCompact: true,
			compactColorIndices: [0, 1, 2],
			deletionMode: TOOLTIP,
			ondelete: onDelete,
		},
	})

	let cells = await screen.findAllByTestId('__palette-cell__')
	expect(cells).toHaveLength(3)

	await user.hover(cells[0])
	const trash = await screen.findByTestId('__trash-icon__')
	await user.click(trash)

	expect(onDelete).toHaveBeenCalledTimes(1)
	expect(onDelete).toHaveBeenCalledWith({
		color: '#000000',
		index: 0,
		colors: colors.slice(1).map((value) => ({ value })),
	})

	cells = await screen.findAllByTestId('__palette-cell__')
	expect(cells).toHaveLength(2)
})

test('Deletes the mapped color when compactColorIndices are unsorted', async () => {
	const onDelete = vi.fn()
	const colors = ['#a00', '#0b0', '#00c', '#dd0', '#0ee']

	const { user } = setup(Palette, {
		props: {
			colors,
			isCompact: true,
			compactColorIndices: [3, 0],
			deletionMode: TOOLTIP,
			ondelete: onDelete,
		},
	})

	let cells = await screen.findAllByTestId('__palette-cell__')
	expect(cells).toHaveLength(2)

	await user.hover(cells[1])
	const trash = await screen.findByTestId('__trash-icon__')
	await user.click(trash)

	expect(onDelete).toHaveBeenCalledWith({
		color: '#dd0',
		index: 3,
		colors: [{ value: '#a00' }, { value: '#0b0' }, { value: '#00c' }, { value: '#0ee' }],
	})

	cells = await screen.findAllByTestId('__palette-cell__')
	expect(cells).toHaveLength(1)
})

test('Propagates a compact deletion to the full list when compact is toggled at runtime', async () => {
	const onDelete = vi.fn()
	const colors = ['#a00', '#0b0', '#00c', '#dd0', '#0ee']

	const { user } = setup(Palette, {
		props: {
			colors,
			compactColorIndices: [1, 3],
			deletionMode: TOOLTIP,
			ondelete: onDelete,
		},
	})

	let cells = await screen.findAllByTestId('__palette-cell__')
	expect(cells).toHaveLength(5)

	const toggle = await screen.findByTestId('__palette-compact-toggle-button__')
	await user.click(toggle)

	await waitFor(() => expect(screen.getAllByTestId('__palette-cell__')).toHaveLength(2))

	cells = screen.getAllByTestId('__palette-cell__')
	await user.hover(cells[0])
	const trash = await screen.findByTestId('__trash-icon__')
	await user.click(trash)

	expect(onDelete).toHaveBeenCalledWith({
		color: '#0b0',
		index: 1,
		colors: [{ value: '#a00' }, { value: '#00c' }, { value: '#dd0' }, { value: '#0ee' }],
	})

	cells = await screen.findAllByTestId('__palette-cell__')
	expect(cells).toHaveLength(1)
})

test('Reflects an add and a delete back through bind:colors', async () => {
	const { user } = setup(PaletteBind, {
		props: { initialColors: ['#ff0', '#0ff'] },
	})

	const bound = await screen.findByTestId('__bound-colors__')

	const input = await screen.findByTestId('__palette-input-input__')
	await user.type(input, '0f0')

	const submit = await screen.findByTestId('__palette-input-submit__')
	await user.click(submit)

	await waitFor(() =>
		expect(JSON.parse(bound.textContent ?? '')).toEqual([{ value: '#ff0' }, { value: '#0ff' }, { value: '#0f0' }])
	)

	const cells = await screen.findAllByTestId('__palette-cell__')
	await user.hover(cells[0])

	const trash = await screen.findByTestId('__trash-icon__')
	await user.click(trash)

	await waitFor(() => expect(JSON.parse(bound.textContent ?? '')).toEqual([{ value: '#0ff' }, { value: '#0f0' }]))
})

test('Reflects a compact-mode deletion back through bind:colors and re-indexes compactColorIndices', async () => {
	const { user } = setup(PaletteBind, {
		props: { initialColors: ['#ff0', '#0ff', '#f0f', '#00f'], isCompact: true, initialCompactColorIndices: [1, 2] },
	})

	const bound = await screen.findByTestId('__bound-colors__')
	const boundIndices = await screen.findByTestId('__bound-indices__')

	let cells = await screen.findAllByTestId('__palette-cell__')
	expect(cells).toHaveLength(2)

	await user.hover(cells[0])
	const trash = await screen.findByTestId('__trash-icon__')
	await user.click(trash)

	await waitFor(() =>
		expect(JSON.parse(bound.textContent ?? '')).toEqual([{ value: '#ff0' }, { value: '#f0f' }, { value: '#00f' }])
	)
	await waitFor(() => expect(JSON.parse(boundIndices.textContent ?? '')).toEqual([1]))

	cells = await screen.findAllByTestId('__palette-cell__')
	expect(cells).toHaveLength(1)
})

test('Does not resurrect a flat-deleted color through a compact deletion after a runtime toggle', async () => {
	const { user } = setup(PaletteBind, {
		props: { initialColors: ['#a00', '#0b0'], initialCompactColorIndices: [0] },
	})

	const bound = await screen.findByTestId('__bound-colors__')

	let cells = await screen.findAllByTestId('__palette-cell__')
	expect(cells).toHaveLength(2)

	await user.hover(cells[1])
	let trash = await screen.findByTestId('__trash-icon__')
	await user.click(trash)

	await waitFor(() => expect(JSON.parse(bound.textContent ?? '')).toEqual([{ value: '#a00' }]))

	const toggle = await screen.findByTestId('__palette-compact-toggle-button__')
	await user.click(toggle)

	cells = await screen.findAllByTestId('__palette-cell__')
	expect(cells).toHaveLength(1)

	await user.hover(cells[0])
	trash = await screen.findByTestId('__trash-icon__')
	await user.click(trash)

	await waitFor(() => expect(JSON.parse(bound.textContent ?? '')).toEqual([]))
})

test('Keeps a flat-added color in the bound list through a compact deletion after a runtime toggle', async () => {
	const { user } = setup(PaletteBind, {
		props: { initialColors: ['#a00', '#0b0'], initialCompactColorIndices: [0, 1] },
	})

	const bound = await screen.findByTestId('__bound-colors__')

	const input = await screen.findByTestId('__palette-input-input__')
	await user.type(input, '00c')

	const submit = await screen.findByTestId('__palette-input-submit__')
	await user.click(submit)

	await waitFor(() =>
		expect(JSON.parse(bound.textContent ?? '')).toEqual([{ value: '#a00' }, { value: '#0b0' }, { value: '#00c' }])
	)

	const toggle = await screen.findByTestId('__palette-compact-toggle-button__')
	await user.click(toggle)

	const cells = await screen.findAllByTestId('__palette-cell__')
	await user.hover(cells[0])
	const trash = await screen.findByTestId('__trash-icon__')
	await user.click(trash)

	await waitFor(() => expect(JSON.parse(bound.textContent ?? '')).toEqual([{ value: '#0b0' }, { value: '#00c' }]))
})

describe('Built-in label overrides', () => {
	test('Keeps every default string when labels is omitted', async () => {
		const colors = ['#ff0', '#0ff']
		setup(Palette, { props: { colors } })
		const listbox = await screen.findByRole('listbox')
		expect(listbox).toHaveAttribute('aria-label', 'Color slots')
	})

	test('Overrides the listbox name through labels.slots', async () => {
		const colors = ['#ff0', '#0ff']
		setup(Palette, { props: { colors, labels: { slots: 'Palette de marque' } } })
		const listbox = await screen.findByRole('listbox')
		expect(listbox).toHaveAttribute('aria-label', 'Palette de marque')
	})

	test('Overrides the loader label without a loader snippet', async () => {
		setup(Palette, { props: { colors: null, labels: { loader: 'Chargement des couleurs' } } })
		expect(await screen.findByRole('status')).toHaveTextContent('Chargement des couleurs')
	})

	test('Overrides the error headline without an error snippet', async () => {
		let rejectColors!: (reason?: unknown) => void
		const colors = new Promise<string[]>((_, reject) => (rejectColors = reject))
		setup(Palette, { props: { colors, labels: { error: 'Échec du chargement des couleurs' } } })

		rejectColors(new Error('Network down'))

		const alert = await screen.findByRole('alert')
		expect(alert).toHaveTextContent('Échec du chargement des couleurs')
	})

	test('Overrides the transparent slot name', async () => {
		const colors = ['#ff0', '#0ff']
		setup(Palette, {
			props: { colors, showTransparentSlot: true, labels: { transparentSlot: 'Emplacement transparent' } },
		})
		const slots = await screen.findAllByTestId('__palette-slot__')
		expect(slots[0]).toHaveAttribute('aria-label', 'Emplacement transparent')
	})

	test('Overrides the enlarge button name in compact mode', async () => {
		const colors = ['#ff0', '#0ff', '#f0f']
		setup(Palette, {
			props: { colors, compactColorIndices: [0, 1], isCompact: true, labels: { enlarge: 'Agrandir la palette' } },
		})
		const toggle = await screen.findByTestId('__palette-compact-toggle-button__')
		expect(toggle).toHaveAttribute('aria-label', 'Agrandir la palette')
	})

	test('Overrides the compact tool and tools section names', async () => {
		const colors = ['#ff0', '#0ff', '#f0f']
		setup(Palette, {
			props: {
				colors,
				compactColorIndices: [0, 1],
				labels: { compact: 'Réduire la palette', tools: 'Outils de la palette' },
			},
		})
		expect(await screen.findByRole('region', { name: 'Outils de la palette' })).toBeInTheDocument()
		expect(screen.getByLabelText('Réduire la palette')).toBeInTheDocument()
	})

	test('Overrides the input, title and submit names', async () => {
		const colors = ['#ff0', '#0ff']
		setup(Palette, {
			props: {
				colors,
				showInput: true,
				labels: {
					inputColor: 'Saisir une couleur',
					inputColorError: 'Couleur invalide',
					submitColor: 'Ajouter',
				},
			},
		})
		const input = await screen.findByTestId('__palette-input-input__')
		expect(input).toHaveAttribute('aria-label', 'Saisir une couleur')
		expect(input).toHaveAttribute('title', 'Couleur invalide')
		expect(screen.getByTestId('__palette-input-submit__')).toHaveAttribute('aria-label', 'Ajouter')
	})

	test('Overrides the eyedropper name', async () => {
		vi.stubGlobal(
			'EyeDropper',
			class {
				open = () => Promise.resolve({ sRGBHex: '#fff' })
			}
		)
		const colors = ['#ff0', '#0ff']
		setup(Palette, { props: { colors, showInput: true, labels: { eyeDropper: "Prélever une couleur à l'écran" } } })
		expect(await screen.findByRole('button', { name: "Prélever une couleur à l'écran" })).toBeInTheDocument()
	})

	test('Overrides the settings button name', async () => {
		const colors = ['#ff0', '#0ff']
		const settingsSnippet = createRawSnippet(() => ({
			render: () => `<span data-testid="__settings-content__"></span>`,
		}))
		setup(Palette, { props: { colors, settings: settingsSnippet, labels: { settings: 'Aller aux paramètres' } } })
		expect(await screen.findByLabelText('Aller aux paramètres')).toBeInTheDocument()
	})

	test('Overrides the deletion button name in the tooltip template', async () => {
		const colors = ['#ff0', '#0ff']
		setup(Palette, { props: { colors, deletionMode: TOOLTIP, labels: { trash: 'Supprimer la couleur' } } })
		await screen.findAllByTestId('__palette-cell__')

		const template = document.getElementById('tooltip-template') as HTMLTemplateElement
		const trash = template.content.querySelector('[data-testid="__palette-trash-button__"]')
		expect(trash?.getAttribute('aria-label')).toBe('Supprimer la couleur')
	})
})
