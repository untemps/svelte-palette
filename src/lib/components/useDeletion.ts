import { useTooltip } from '@untemps/svelte-use-tooltip'
import { useDropOutside } from '@untemps/svelte-use-drop-outside'

import { TOOLTIP, DROP } from '../enums/PaletteDeletionMode'
import type { PaletteDeletionMode } from '../enums/PaletteDeletionMode'

type UseDeletionOptions = {
	deletionMode: PaletteDeletionMode
	onDelete: () => void
	tooltipContentSelector?: string | null
	tooltipClassName?: string | null
}

type ActionReturn = { destroy?: () => void; update?: (params: unknown) => void } | null

const createAction = (
	node: Element,
	deletionMode: PaletteDeletionMode,
	options: Omit<UseDeletionOptions, 'deletionMode'>
): ActionReturn => {
	switch (deletionMode) {
		case TOOLTIP: {
			return useTooltip(node, {
				contentSelector: options.tooltipContentSelector || '#tooltip-template',
				contentActions: {
					'*': {
						eventType: 'click',
						callback: options.onDelete,
						closeOnCallback: true,
					},
				},
				containerClassName: options.tooltipClassName,
			})
		}
		case DROP: {
			const slotButton = node.querySelector('[data-testid="__palette-slot__"]')
			const dragImage = slotButton ? slotButton.cloneNode(true) : undefined
			if (dragImage) {
				;(dragImage as Element).removeAttribute('data-testid')
			}
			return useDropOutside(node, {
				areaSelector: '.palette',
				animate: true,
				dragImage,
				dragHandleCentered: true,
				onDropOutside: options.onDelete,
			})
		}
		default:
			return null
	}
}

const useDeletion = (node: Element, { deletionMode, ...options }: UseDeletionOptions) => {
	let action = createAction(node, deletionMode, options)

	return {
		update: ({ deletionMode: newDeletionMode, ...newOptions }: UseDeletionOptions) => {
			action?.destroy?.()
			action = createAction(node, newDeletionMode || deletionMode, { ...options, ...newOptions })
		},
		destroy: () => action?.destroy?.(),
	}
}

export default useDeletion
