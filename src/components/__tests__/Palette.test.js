import { jest } from '@jest/globals'
import { fireEvent, render, screen, waitFor } from '@testing-library/svelte'

import Palette from '../Palette.svelte'

import { TOOLTIP, DROP } from '../../enums/PaletteDeletionMode'

describe('Palette', () => {
	it('Displays as many color slots as set', async () => {
		let cells = null
		const colors = ['#ff0', '#0ff', '#f0f']
		render(Palette, {
			colors,
		})

		cells = await screen.findAllByTestId('__palette-cell__')
		expect(cells).toHaveLength(colors.length)
	})

	it('Displays as many color slots as set in async mode', async () => {
		let cells = null
		const colors = Promise.resolve(['#ff0', '#0ff', '#f0f'])
		render(Palette, {
			colors,
		})

		cells = await screen.findAllByTestId('__palette-cell__')
		waitFor(() => expect(cells).toHaveLength(colors.length))
	})

	it('Triggers select with color', async () => {
		let cells,
			cell = null
		const onSelect = jest.fn()
		const colors = ['#ff0', '#0ff', '#f0f']

		const { component } = render(Palette, {
			colors,
		})

		component.$on('select', onSelect)

		cells = await screen.findAllByTestId('__palette-cell__')
		cell = cells[0]
		await fireEvent.click(cell.firstChild)

		expect(onSelect).toHaveBeenCalledWith(new CustomEvent({ detail: { color: colors[0] } }))
	})

	it('Deletes slots if deletionMode is set to "tooltip"', async () => {
		let cells,
			cell,
			trash = null
		const colors = ['#ff0', '#0ff', '#f0f']

		render(Palette, {
			colors,
			deletionMode: TOOLTIP,
		})

		cells = await screen.findAllByTestId('__palette-cell__')
		cell = cells[0]

		await fireEvent.mouseOver(cell) // fireEvent.mouseEnter only works if mouseOver is triggered before
		await fireEvent.mouseEnter(cell)

		trash = await screen.findByTestId('__trash-icon__')
		expect(trash).toBeInTheDocument()

		await fireEvent.click(trash)

		expect(cell).not.toBeInTheDocument()
	})

	it('Deletes slot if deletionMode is set to "drop"', async () => {
		let cells,
			cell = null
		const colors = ['#ff0', '#0ff', '#f0f']

		const { component } = render(Palette, {
			accessors: true,
			props: {
				colors,
			},
		})

		cells = await screen.findAllByTestId('__palette-cell__')

		component.deletionMode = DROP

		cell = cells[0]

		await fireEvent.mouseDown(cell)
		await fireEvent.mouseMove(document)

		const drag = document.querySelector('#drag')
		drag.getBoundingClientRect = () => ({
			width: 20,
			height: 20,
			top: 2000,
			left: 2000,
			right: 2020,
			bottom: 2020,
		})
		await fireEvent.mouseUp(document)

		expect(cell).not.toBeInTheDocument()
	})

	it('Displays transparent slot if showTransparentSlot is truthy', async () => {
		let cells,
			cell = null
		const onSelect = jest.fn()
		const colors = ['#ff0', '#0ff', '#f0f']

		const { component } = render(Palette, {
			colors,
			showTransparentSlot: true,
		})

		component.$on('select', onSelect)
		cells = await screen.findAllByTestId('__palette-cell__')
		expect(cells).toHaveLength(colors.length + 1)

		cell = cells[0]
		await fireEvent.click(cell.firstChild)

		expect(onSelect).toHaveBeenCalledWith(new CustomEvent({ detail: { color: null } }))
	})

	describe('Compact mode', () => {
		it('Displays compact control if compactColorIndices is set', async () => {
			let compact = null
			const colors = ['#ff0', '#0ff', '#f0f']
			const compactColorIndices = [0, 1]

			render(Palette, {
				colors,
				compactColorIndices,
			})

			compact = await screen.findByTestId('__palette-compact-toggle-button__')
			expect(compact).toBeInTheDocument()
		})

		it('Displays as many slots as within the compactColorIndices array', async () => {
			let slots,
				compact = null
			const colors = ['#000', '#0ff', '#f0f']
			const compactColorIndices = [0, 1]

			render(Palette, {
				colors,
				compactColorIndices,
			})

			slots = await screen.findAllByTestId('__palette-slot__')
			expect(slots).toHaveLength(colors.length)

			compact = await screen.findByTestId('__palette-compact-toggle-button__')
			await fireEvent.click(compact)

			await waitFor(async () => {
				slots = await screen.findAllByTestId('__palette-slot__')
				expect(slots).toHaveLength(colors.length)
			})

			compact = await screen.findByTestId('__palette-compact-toggle-button__')
			await fireEvent.click(compact)

			await waitFor(async () => {
				slots = await screen.findAllByTestId('__palette-slot__')
				expect(slots).toHaveLength(colors.length)
			})
		})
	})

	it.each([
		[['#ff0', '#0ff', '#f0f'], 99, 4],
		[['#ff0', '#0ff', '#f0f'], -1, 4],
		[['#ff0', '#0ff', '#f0f'], 3, 3],
		[['#ff0', '#0ff', '#f0f'], 1, 1],
	])('Adds or replaces color regarding maxColors value', async (colors, maxColors, expected) => {
		let input,
			submit,
			slots = null
		const newColor = '0f0'
		const onSelect = jest.fn()

		const { component } = render(Palette, {
			colors,
			maxColors,
		})

		component.$on('select', onSelect)

		input = await screen.findByTestId('__palette-input-input__')
		await fireEvent.input(input, { target: { value: newColor } })

		submit = await screen.findByTestId('__palette-input-submit__')
		await fireEvent.click(submit)

		slots = await screen.findAllByTestId('__palette-slot__')
		expect(slots).toHaveLength(expected)

		await fireEvent.click(slots[slots.length - 1])

		expect(onSelect).toHaveBeenCalledWith(new CustomEvent({ detail: { color: '#000' } }))
	})

	it.each([
		[['#ff0', '#0ff', '#f0f'], false, 3],
		[['#ff0', '#0ff', '#f0f', '#f0f'], false, 3],
		[['#ff0', '#0ff', '#f0f'], true, 4],
	])('Adds or not color regarding allowDuplicates value', async (colors, allowDuplicates, expected) => {
		let input,
			submit,
			slots = null
		const newColor = 'f0f'
		const onSelect = jest.fn()

		const { component } = render(Palette, {
			colors,
			allowDuplicates,
		})
		component.$on('select', onSelect)

		input = await screen.findByTestId('__palette-input-input__')
		await fireEvent.input(input, { target: { value: newColor } })

		submit = await screen.findByTestId('__palette-input-submit__')
		await fireEvent.click(submit)

		slots = await screen.findAllByTestId('__palette-slot__')
		expect(slots).toHaveLength(expected)

		await fireEvent.click(slots[slots.length - 1])

		expect(onSelect).toHaveBeenCalledWith(new CustomEvent({ detail: { color: '#f0f' } }))
	})

	it('Removes duplicates when updating allowDuplicates value', async () => {
		let slots = null
		const colors = ['#ff0', '#0ff', '#f0f', '#f0f', '#f0f']

		const { rerender } = render(Palette, {
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
})
