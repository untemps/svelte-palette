import { useTooltip } from '@untemps/svelte-use-tooltip'
import { useDropOutside } from '@untemps/svelte-use-drop-outside'

import useDeletion from '../useDeletion'

import { NONE, TOOLTIP, DROP } from '../../enums/PaletteDeletionMode'

import type { DeletionMode } from '../../types'

vi.mock('@untemps/svelte-use-tooltip', () => ({
	useTooltip: vi.fn(() => ({ update: vi.fn(), destroy: vi.fn() })),
}))

vi.mock('@untemps/svelte-use-drop-outside', () => ({
	useDropOutside: vi.fn(() => ({ update: vi.fn(), destroy: vi.fn() })),
}))

const useTooltipMock = vi.mocked(useTooltip)
const useDropOutsideMock = vi.mocked(useDropOutside)

type AnyMock = { mock: { calls: any[][]; results: { value: any }[] } }

const tooltipArgs = (call = 0) => (useTooltipMock as unknown as AnyMock).mock.calls[call]
const dropArgs = (call = 0) => (useDropOutsideMock as unknown as AnyMock).mock.calls[call]
const tooltipInstance = (call = 0) => (useTooltipMock as unknown as AnyMock).mock.results[call].value
const dropInstance = (call = 0) => (useDropOutsideMock as unknown as AnyMock).mock.results[call].value

const mount = (node: HTMLElement, parameter: Parameters<typeof useDeletion>[1]) => {
	return useDeletion(node, parameter) as { update: (p: unknown) => void; destroy: () => void }
}

const withSlotButton = () => {
	const node = document.createElement('div')
	const slotButton = document.createElement('button')
	slotButton.setAttribute('data-testid', '__palette-slot__')
	slotButton.textContent = 'slot'
	node.appendChild(slotButton)
	return { node, slotButton }
}

beforeEach(() => {
	vi.clearAllMocks()
})

describe('creation', () => {
	test('Creates a tooltip action for TOOLTIP with the default content selector', () => {
		const node = document.createElement('div')
		mount(node, { deletionMode: TOOLTIP, tooltipClassName: 'custom-tooltip' })

		expect(useTooltipMock).toHaveBeenCalledTimes(1)
		expect(useDropOutsideMock).not.toHaveBeenCalled()

		const [passedNode, options] = tooltipArgs()
		expect(passedNode).toBe(node)
		expect(options.contentSelector).toBe('#tooltip-template')
		expect(options.containerClassName).toBe('custom-tooltip')
	})

	test('Resolves a custom tooltip content selector', () => {
		const node = document.createElement('div')
		mount(node, { deletionMode: TOOLTIP, tooltipContentSelector: '#my-template' })

		expect(tooltipArgs()[1].contentSelector).toBe('#my-template')
	})

	test('Wires onDelete into the tooltip click action', () => {
		const node = document.createElement('div')
		const onDelete = vi.fn()
		mount(node, { deletionMode: TOOLTIP, onDelete })

		tooltipArgs()[1].contentActions['*'].callback()
		expect(onDelete).toHaveBeenCalledTimes(1)
	})

	test('Falls back to a no-op tooltip callback when onDelete is omitted', () => {
		const node = document.createElement('div')
		mount(node, { deletionMode: TOOLTIP })

		expect(() => tooltipArgs()[1].contentActions['*'].callback()).not.toThrow()
	})

	test('Creates a drop action for DROP with a data-testid-stripped drag image clone', () => {
		const { node, slotButton } = withSlotButton()
		const onDelete = vi.fn()
		mount(node, { deletionMode: DROP, areaSelector: '.my-area', onDelete })

		expect(useDropOutsideMock).toHaveBeenCalledTimes(1)
		expect(useTooltipMock).not.toHaveBeenCalled()

		const [passedNode, options] = dropArgs()
		expect(passedNode).toBe(node)
		expect(options.areaSelector).toBe('.my-area')
		expect(options.onDropOutside).toBe(onDelete)
		expect(options.dragImage).toBeInstanceOf(HTMLElement)
		expect(options.dragImage).not.toBe(slotButton)
		expect(options.dragImage.hasAttribute('data-testid')).toBe(false)
		expect(slotButton.getAttribute('data-testid')).toBe('__palette-slot__')
	})

	test('Defaults the drop area selector to .palette', () => {
		const { node } = withSlotButton()
		mount(node, { deletionMode: DROP })

		expect(dropArgs()[1].areaSelector).toBe('.palette')
	})

	test('Passes an undefined drag image for DROP when no slot button is present', () => {
		const node = document.createElement('div')
		mount(node, { deletionMode: DROP })

		expect(dropArgs()[1].dragImage).toBeUndefined()
	})

	test('Creates no action for NONE', () => {
		const node = document.createElement('div')
		mount(node, { deletionMode: NONE })

		expect(useTooltipMock).not.toHaveBeenCalled()
		expect(useDropOutsideMock).not.toHaveBeenCalled()
	})

	test('Creates no action for an unknown mode', () => {
		const node = document.createElement('div')
		mount(node, { deletionMode: 'bogus' as DeletionMode })

		expect(useTooltipMock).not.toHaveBeenCalled()
		expect(useDropOutsideMock).not.toHaveBeenCalled()
	})
})

describe('update — mode changes', () => {
	test('Destroys the previous action once and creates the new one when the mode changes', () => {
		const { node } = withSlotButton()
		const action = mount(node, { deletionMode: TOOLTIP })
		const tooltip = tooltipInstance()

		action.update({ deletionMode: DROP })

		expect(tooltip.destroy).toHaveBeenCalledTimes(1)
		expect(useTooltipMock).toHaveBeenCalledTimes(1)
		expect(useDropOutsideMock).toHaveBeenCalledTimes(1)
	})

	test('Tears the action down without rebuilding when the mode changes to NONE', () => {
		const node = document.createElement('div')
		const action = mount(node, { deletionMode: TOOLTIP })
		const tooltip = tooltipInstance()

		action.update({ deletionMode: NONE })

		expect(tooltip.destroy).toHaveBeenCalledTimes(1)
		expect(useTooltipMock).toHaveBeenCalledTimes(1)
		expect(useDropOutsideMock).not.toHaveBeenCalled()
	})

	test('Does not resurrect the mount-time mode when update receives a falsy mode', () => {
		const node = document.createElement('div')
		const action = mount(node, { deletionMode: TOOLTIP })
		expect(useTooltipMock).toHaveBeenCalledTimes(1)
		const tooltip = tooltipInstance()

		action.update({ deletionMode: undefined })

		expect(tooltip.destroy).toHaveBeenCalledTimes(1)
		expect(useTooltipMock).toHaveBeenCalledTimes(1)
	})

	test('Builds the new action when the mode turns on from NONE', () => {
		const node = document.createElement('div')
		const action = mount(node, { deletionMode: NONE })

		action.update({ deletionMode: TOOLTIP })

		expect(useTooltipMock).toHaveBeenCalledTimes(1)
	})

	test('Tracks the new mode so a later same-mode update reconciles instead of rebuilding', () => {
		const node = document.createElement('div')
		const action = mount(node, { deletionMode: DROP })
		action.update({ deletionMode: TOOLTIP })
		const tooltip = tooltipInstance()
		expect(useTooltipMock).toHaveBeenCalledTimes(1)

		action.update({ deletionMode: TOOLTIP, onDelete: vi.fn() })

		expect(useTooltipMock).toHaveBeenCalledTimes(1)
		expect(tooltip.destroy).not.toHaveBeenCalled()
		expect(tooltip.update).toHaveBeenCalledTimes(1)
	})

	test('Carries prior options into the action built on a mode change', () => {
		const { node } = withSlotButton()
		const onDelete = vi.fn()
		const action = mount(node, { deletionMode: TOOLTIP, onDelete })

		action.update({ deletionMode: DROP })

		expect(dropArgs()[1].onDropOutside).toBe(onDelete)
	})

	test('Does not create any action when update runs on a NONE action', () => {
		const node = document.createElement('div')
		const action = mount(node, { deletionMode: NONE })

		expect(() => action.update({ deletionMode: NONE })).not.toThrow()
		expect(useTooltipMock).not.toHaveBeenCalled()
		expect(useDropOutsideMock).not.toHaveBeenCalled()
	})
})

describe('update — same mode, TOOLTIP (reconciles in place)', () => {
	test('Reconciles in place through the underlying action instead of rebuilding', () => {
		const node = document.createElement('div')
		const action = mount(node, { deletionMode: TOOLTIP, onDelete: vi.fn() })
		const tooltip = tooltipInstance()

		action.update({ deletionMode: TOOLTIP, onDelete: vi.fn() })

		expect(useTooltipMock).toHaveBeenCalledTimes(1)
		expect(tooltip.destroy).not.toHaveBeenCalled()
		expect(tooltip.update).toHaveBeenCalledTimes(1)
	})

	test('Forwards the new onDelete closure to the underlying tooltip action', () => {
		const node = document.createElement('div')
		const onDelete1 = vi.fn()
		const onDelete2 = vi.fn()
		const action = mount(node, { deletionMode: TOOLTIP, onDelete: onDelete1 })
		const tooltip = tooltipInstance()

		action.update({ deletionMode: TOOLTIP, onDelete: onDelete2 })

		expect(tooltip.update).toHaveBeenCalledTimes(1)
		const forwarded = tooltip.update.mock.calls[0][0]
		forwarded.contentActions['*'].callback()
		expect(onDelete2).toHaveBeenCalledTimes(1)
		expect(onDelete1).not.toHaveBeenCalled()
	})
})

describe('update — same mode, DROP (rebuilt safely)', () => {
	test('Rebuilds the drop action and accumulates options over the previous state', () => {
		const { node } = withSlotButton()
		const onDelete = vi.fn()
		const action = mount(node, { deletionMode: DROP, areaSelector: '.first' })
		const firstDrop = dropInstance(0)

		action.update({ deletionMode: DROP, areaSelector: '.second' })
		const secondDrop = dropInstance(1)
		action.update({ deletionMode: DROP, onDelete })

		expect(useDropOutsideMock).toHaveBeenCalledTimes(3)
		expect(firstDrop.destroy).toHaveBeenCalledTimes(1)
		expect(secondDrop.destroy).toHaveBeenCalledTimes(1)

		const lastArgs = dropArgs(2)[1]
		expect(lastArgs.areaSelector).toBe('.second')
		expect(lastArgs.onDropOutside).toBe(onDelete)
	})
})

describe('defensive parameter handling', () => {
	test('Creates no action and does not throw when mounted without a parameter', () => {
		const node = document.createElement('div')

		expect(() => mount(node, undefined as unknown as Parameters<typeof useDeletion>[1])).not.toThrow()
		expect(useTooltipMock).not.toHaveBeenCalled()
		expect(useDropOutsideMock).not.toHaveBeenCalled()
	})

	test('Does not throw when update runs without a parameter', () => {
		const node = document.createElement('div')
		const action = mount(node, undefined as unknown as Parameters<typeof useDeletion>[1])

		expect(() => action.update(undefined)).not.toThrow()
	})
})

describe('destroy', () => {
	test('Destroys the underlying action', () => {
		const node = document.createElement('div')
		const action = mount(node, { deletionMode: TOOLTIP })
		const tooltip = tooltipInstance()

		action.destroy()

		expect(tooltip.destroy).toHaveBeenCalledTimes(1)
	})

	test('Does not throw when destroying a NONE action', () => {
		const node = document.createElement('div')
		const action = mount(node, { deletionMode: NONE })

		expect(() => action.destroy()).not.toThrow()
	})
})
