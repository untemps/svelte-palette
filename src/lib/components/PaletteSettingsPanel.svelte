<script module lang="ts">
	export const usePortal = (
		node: HTMLElement,
		{ target = 'body', visible = false }: { target?: string; visible?: boolean }
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
			update: ({
				target: newTarget = target,
				visible: newVisible = visible,
			}: {
				target?: string
				visible?: boolean
			}) => {
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

	let {
		target = 'body',
		isVisible = false,
		children,
	}: {
		target?: string
		isVisible?: boolean
		children?: Snippet
	} = $props()
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
