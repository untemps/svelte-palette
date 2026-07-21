import type { Action } from 'svelte/action'

import { useTooltip } from '@untemps/svelte-use-tooltip'
import { useDropOutside } from '@untemps/svelte-use-drop-outside'

import { TOOLTIP, DROP } from '../enums/PaletteDeletionMode'

import type { DeletionMode } from '../types'

export interface UseDeletionOptions {
	onDelete?: () => void
	tooltipContentSelector?: string | null
	tooltipClassName?: string | null
}

export interface UseDeletionParameter extends UseDeletionOptions {
	deletionMode?: DeletionMode
}

const createAction = (node: HTMLElement, deletionMode: DeletionMode | undefined, options: UseDeletionOptions) => {
	switch (deletionMode) {
		case TOOLTIP: {
			return useTooltip(node, {
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
		}
		case DROP: {
			const slotButton = node.querySelector('[data-testid="__palette-slot__"]')
			const dragImage = slotButton ? (slotButton.cloneNode(true) as HTMLElement) : undefined
			if (dragImage) {
				dragImage.removeAttribute('data-testid')
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

const useDeletion: Action<HTMLElement, UseDeletionParameter> = (node, parameter) => {
	const { deletionMode, ...options } = parameter ?? {}
	let action = createAction(node, deletionMode, options)

	return {
		update: (newParameter) => {
			const { deletionMode: newDeletionMode, ...newOptions } = newParameter ?? {}
			action?.destroy?.()
			action = createAction(node, newDeletionMode || deletionMode, { ...options, ...newOptions })
		},
		destroy: () => action?.destroy?.(),
	}
}

export default useDeletion
