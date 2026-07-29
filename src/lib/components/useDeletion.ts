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

const LEAKED_ARIA_ATTRIBUTES = ['aria-haspopup', 'aria-expanded', 'aria-describedby'] as const

/**
 * The tooltip library stamps disclosure semantics onto the presentational cell wrapper the
 * deletion tooltip is bound to. When its content is interactive (the default template holds a
 * focusable trash button) it sets `aria-haspopup="dialog"` and toggles `aria-expanded`; when it
 * is non-interactive (a custom `tooltipContentSelector` whose content has no focusable element)
 * it sets `aria-describedby` on open. The tooltip is pointer-only (`showOn: ['mouseenter']`), so
 * on a `role="presentation"` cell these all announce an interaction that keyboard and
 * assistive-technology users can never perform there — the keyboard path is the listbox-level
 * Delete/Backspace shortcut instead. Strip them, and keep stripping: the library re-applies them
 * on every open. Returns a disposer that stops the observer.
 */
const suppressAriaLeaks = (node: HTMLElement): (() => void) => {
	const strip = () => LEAKED_ARIA_ATTRIBUTES.forEach((attribute) => node.removeAttribute(attribute))
	strip()
	const observer = new MutationObserver(strip)
	observer.observe(node, { attributes: true, attributeFilter: [...LEAKED_ARIA_ATTRIBUTES] })
	return () => observer.disconnect()
}

const createAction = (node: HTMLElement, deletionMode: DeletionMode | undefined, options: UseDeletionOptions) => {
	switch (deletionMode) {
		case TOOLTIP: {
			const action = useTooltip(node, {
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
			const disposeAriaSuppression = suppressAriaLeaks(node)
			return {
				destroy: () => {
					disposeAriaSuppression()
					action?.destroy?.()
				},
			}
		}
		case DROP: {
			const slotButton = node.querySelector('[data-testid="__palette-slot__"]')
			const dragImage = slotButton ? (slotButton.cloneNode(true) as HTMLElement) : undefined
			if (dragImage) {
				dragImage.removeAttribute('data-testid')
			}
			return useDropOutside(node, {
				areaSelector: options.areaSelector || '.palette',
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
