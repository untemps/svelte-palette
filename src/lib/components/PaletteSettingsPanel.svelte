<script module lang="ts">
	import type { Action } from 'svelte/action'

	export const usePortal: Action<HTMLElement, { target?: string; visible?: boolean }> = (
		node,
		{ target = 'body', visible = false }
	) => {
		const getTargetEl = (selector: string): Element | null => {
			if (!!selector) {
				return document.querySelector(selector)
			}
			return null
		}

		const show = () => {
			if (!!targetEl) {
				targetEl.appendChild(node)
			}
		}

		const hide = () => {
			node.parentNode?.removeChild(node)
		}

		let targetEl = getTargetEl(target)
		visible ? show() : hide()

		return {
			update: ({ target: newTarget = target, visible: newVisible = visible }) => {
				if (newTarget !== target) {
					targetEl = getTargetEl(newTarget)
				}
				if (newVisible !== visible) {
					newVisible ? show() : hide()
				}
			},
			destroy: () => {
				hide()
			},
		}
	}
</script>

<script lang="ts">
	import type { Snippet } from 'svelte'

	interface Props {
		/** Selector or element the panel is portalled into. */
		target?: string
		/** Whether the panel is visible. */
		isVisible?: boolean
		/** Panel content. */
		children?: Snippet
	}

	let { target = 'body', isVisible = false, children }: Props = $props()
</script>

<section
	class="palette__settings__panel"
	class:palette__settings__panel--visible={isVisible}
	use:usePortal={{ target, visible: isVisible }}
>
	{@render children?.()}
</section>

<style>
	.palette__settings__panel {
		visibility: hidden;
	}

	.palette__settings__panel--visible {
		visibility: visible;
	}
</style>
