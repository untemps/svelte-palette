<script>
	import { createEventDispatcher } from 'svelte'

	import { CLICK } from '../enums/PaletteEvent'

	export let isCompact = false
	export let ariaLabel = 'Compact the palette'

	const dispatch = createEventDispatcher()

	const _onClick = () => dispatch(CLICK, { isCompact })
</script>

<button
	data-testid="__palette-compact__"
	type="button"
	class="icon"
	aria-label={ariaLabel}
	on:click|preventDefault={_onClick}>
	{#if isCompact}
		<svg
			data-testid="__palette-compact-enlarge__"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg">
			<path
				d="M14.5 9.5L21 3M21 3H15M21 3V9M3 21L9.5 14.5M3 21V15M3 21H9"
				stroke="rgba(0, 0, 0, 0.6)"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round" />
		</svg>
	{:else}
		<svg
			data-testid="__palette-compact-compact__"
			width="16"
			height="24"
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg">
			<path
				d="M14 10L21 3M14 10H20M14 10V4M3 21L10 14M10 14V20M10 14H4"
				stroke="rgba(0, 0, 0, 0.6)"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round" />
		</svg>
	{/if}
</button>
