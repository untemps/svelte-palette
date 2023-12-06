<script context="module">
	export const usePortal = (node, { target = 'body', visible = false }) => {
		const getTargetEl = (selector) => {
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

<script>
	export let target = 'body'
	export let isVisible = false
</script>

<section
	class="palette__settings__panel"
	class:palette__settings__panel--visible={isVisible}
	use:usePortal={{ target, visible: isVisible }}
>
	<slot />
</section>

<style>
	.palette__settings__panel {
		visibility: hidden;
	}

	.palette__settings__panel--visible {
		visibility: visible;
	}
</style>
