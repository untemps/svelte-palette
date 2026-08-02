import type { Action } from 'svelte/action'

import { useTooltip } from '@untemps/svelte-use-tooltip'
import { useDropOutside } from '@untemps/svelte-use-drop-outside'

import { TOOLTIP, DROP } from '../enums/PaletteDeletionMode'

import type { DeletionMode } from '../types'

export interface UseDeletionOptions {
	onDelete?: () => void
	tooltipContentSelector?: string | null
	tooltipClassName?: string | null
	areaSelector?: string | null
}

export interface UseDeletionParameter extends UseDeletionOptions {
	deletionMode?: DeletionMode
}

type DeletionAction = { update?: (options: unknown) => void; destroy?: () => void } | null

const buildTooltipOptions = (options: UseDeletionOptions) => ({
	contentSelector: options.tooltipContentSelector || '#tooltip-template',
	contentActions: {
		'*': {
			eventType: 'click',
			callback: options.onDelete ?? (() => {}),
			closeOnCallback: true,
		},
	},
	containerClassName: options.tooltipClassName,
	portal: false,
	showOn: ['mouseenter'],
	hideOn: ['mouseleave'],
})

const buildDropOptions = (node: HTMLElement, options: UseDeletionOptions) => {
	const slotButton = node.querySelector('[data-testid="__palette-slot__"]')
	const dragImage = slotButton ? (slotButton.cloneNode(true) as HTMLElement) : undefined
	if (dragImage) {
		dragImage.removeAttribute('data-testid')
	}
	return {
		areaSelector: options.areaSelector || '.palette',
		animate: true,
		dragImage,
		dragHandleCentered: true,
		onDropOutside: options.onDelete,
	}
}

const createAction = (
	node: HTMLElement,
	deletionMode: DeletionMode | undefined,
	options: UseDeletionOptions
): DeletionAction => {
	switch (deletionMode) {
		case TOOLTIP:
			return useTooltip(node, buildTooltipOptions(options)) as unknown as DeletionAction
		case DROP:
			return useDropOutside(node, buildDropOptions(node, options)) as DeletionAction
		default:
			return null
	}
}

const useDeletion: Action<HTMLElement, UseDeletionParameter> = (node, parameter) => {
	let { deletionMode, ...options } = parameter ?? {}
	let action = createAction(node, deletionMode, options)

	return {
		update: (newParameter) => {
			const { deletionMode: newDeletionMode, ...newOptions } = newParameter ?? {}
			const nextOptions = { ...options, ...newOptions }
			if (action && newDeletionMode === deletionMode && newDeletionMode === TOOLTIP) {
				action.update?.(buildTooltipOptions(nextOptions))
			} else {
				action?.destroy?.()
				action = createAction(node, newDeletionMode, nextOptions)
			}
			deletionMode = newDeletionMode
			options = nextOptions
		},
		destroy: () => action?.destroy?.(),
	}
}

export default useDeletion
