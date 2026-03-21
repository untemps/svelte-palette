import { useTooltip } from '@untemps/svelte-use-tooltip'
import { useDropOutside } from '@untemps/svelte-use-drop-outside'

import { TOOLTIP, DROP } from '../enums/PaletteDeletionMode'

const createAction = (node, deletionMode, options) => {
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
				dragImage.removeAttribute('data-testid')
			}
			return useDropOutside(node, {
				areaSelector: '.palette',
				animate: true,
				dragImage,
				onDropOutside: options.onDelete,
			})
		}
		default:
			return null
	}
}

const useDeletion = (node, { deletionMode, ...options }) => {
	let mode = deletionMode
	let action = createAction(node, deletionMode, options)

	return {
		update: ({ deletionMode: newDeletionMode, ...newOptions }) => {
			mode = newDeletionMode
			action?.destroy()
			action = createAction(node, newDeletionMode || deletionMode, { ...options, ...newOptions })
		},
		destroy: () => action?.destroy(),
	}
}

export default useDeletion
