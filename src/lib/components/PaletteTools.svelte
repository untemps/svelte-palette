<script>
	import { createEventDispatcher } from 'svelte'
	import { COMPACT, SETTINGS } from '../enums/PaletteTool.js'
	import { CLICK } from '../enums/PaletteEvent.js'
	import PaletteCompactToggleButton from './PaletteCompactToggleButton.svelte'
	import PaletteSettingsButton from './PaletteSettingsButton.svelte'

	export let hasCompactMode = false
	export let isCompact = false

	const dispatch = createEventDispatcher()

	const _onCompactClick = () => {
		dispatch(CLICK, {
			tool: COMPACT,
		})
	}

	const _onSettingsClick = () => {
		dispatch(CLICK, {
			tool: SETTINGS,
		})
	}
</script>

<hr class="palette__divider" />
<section data-testid="__palette-tools__" aria-label="Palette tools" class="palette__tools">
	{#if hasCompactMode}
		<PaletteCompactToggleButton {isCompact} on:click={_onCompactClick} />
	{/if}
	<PaletteSettingsButton on:click={_onSettingsClick} />
</section>

<style>
	.palette__tools {
		width: 100%;
		max-width: 14rem;
		display: grid;
		grid-template-columns: repeat(5, minmax(2rem, 1fr));
		column-gap: 0.3rem;
		justify-items: center;
		align-items: center;
		padding: 0.5rem 1rem;
	}

	:global(.palette__tools > button:first-child) {
		grid-column: 4 / 5;
		grid-row: 1 / 2;
	}

	:global(.palette__tools > button:last-child) {
		grid-column: 5 / 6;
		grid-row: 1 / 2;
	}

	.palette__divider {
		border: none;
		background-color: #e9e9e9;
		width: 100%;
		height: 1px;
		margin: 0;
	}
</style>
