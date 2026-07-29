<script lang="ts">
	import { COMPACT, SETTINGS } from '../enums/PaletteTool.js'

	import PaletteCompactToggleButton from './PaletteCompactToggleButton.svelte'
	import PaletteSettingsButton from './PaletteSettingsButton.svelte'

	import type { PaletteToolName, ToolSelectEventArgs } from '../types'

	interface Props {
		/** Tools to display. */
		tools?: PaletteToolName[]
		/** Accessible name of the tools panel section. */
		label?: string
		/** Accessible name of the compact button (forwarded to the compact toggle). */
		compactLabel?: string
		/** Accessible name of the enlarge button (forwarded to the compact toggle). */
		enlargeLabel?: string
		/** Accessible name of the settings button. */
		settingsLabel?: string
		/** Called when a tool is selected. */
		onselect?: (args: ToolSelectEventArgs) => void
	}

	let {
		tools = [],
		label = 'Palette tools',
		compactLabel = 'Compact the palette',
		enlargeLabel = 'Enlarge the palette',
		settingsLabel = 'Go to settings',
		onselect = undefined,
	}: Props = $props()

	const _selectTool = (index: number) => {
		onselect?.({ tool: tools[index] })
	}
</script>

<hr class="palette__divider" />
<section data-testid="__palette-tools__" aria-label={label} class="palette__tools">
	{#each tools as tool, i (tool)}
		{#if tool === COMPACT}
			<PaletteCompactToggleButton {compactLabel} {enlargeLabel} onclick={() => _selectTool(i)} />
		{:else if tool === SETTINGS}
			<PaletteSettingsButton aria-label={settingsLabel} onclick={() => _selectTool(i)} />
		{/if}
	{/each}
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
