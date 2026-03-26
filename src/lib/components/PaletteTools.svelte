<script lang="ts">
	import type { Component } from 'svelte'
	import { COMPACT, SETTINGS } from '../enums/PaletteTool'
	import type { PaletteTool } from '../enums/PaletteTool'

	import PaletteCompactToggleButton from './PaletteCompactToggleButton.svelte'
	import PaletteSettingsButton from './PaletteSettingsButton.svelte'

	let {
		tools = [],
		onselect = undefined,
	}: {
		tools?: PaletteTool[]
		onselect?: (event: { tool: PaletteTool }) => void
	} = $props()

	const TOOL_BUTTONS: Record<PaletteTool, Component> = {
		[COMPACT]: PaletteCompactToggleButton,
		[SETTINGS]: PaletteSettingsButton,
	}

	const _selectTool = (index: number): void => {
		onselect?.({ tool: tools[index] })
	}
</script>

<hr class="palette__divider" />
<section data-testid="__palette-tools__" aria-label="Palette tools" class="palette__tools">
	{#each tools as tool, i (tool)}
		{@const ToolComponent = TOOL_BUTTONS[tool]}
		{#if ToolComponent}
			<ToolComponent onclick={() => _selectTool(i)} />
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
