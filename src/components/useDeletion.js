import { useTooltip } from '@untemps/svelte-use-tooltip'
import { useDropOutside } from '@untemps/svelte-use-drop-outside'

import { NONE, TOOLTIP, DROP } from '../enums/PaletteDeletionMode'

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
			return useDropOutside(node, {
				areaSelector: '.palette__root',
				animate: true,
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
		update: ({ deletionMode: newDeletionMode }) => {
			if (newDeletionMode !== mode) {
				node.setAttribute('style', 'position: null') // TODO: Remove when useTooltip will be upgraded
				mode = newDeletionMode
				action?.destroy()
				action = createAction(node, newDeletionMode, options)
			}
		},
		destroy: () => action?.destroy(),
	}
}

export default useDeletion
