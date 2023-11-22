<script>
	import { createEventDispatcher } from 'svelte'

	import { COMPACT, SETTINGS } from '../enums/PaletteTool.js'
	import { SELECT } from '../enums/PaletteEvent.js'

	import PaletteCompactToggleButton from './PaletteCompactToggleButton.svelte'
	import PaletteSettingsButton from './PaletteSettingsButton.svelte'

	export let tools = []

	const TOOL_BUTTONS = {
		[COMPACT]: PaletteCompactToggleButton,
		[SETTINGS]: PaletteSettingsButton,
	}

	const dispatch = createEventDispatcher()

	const _renderTool = (index) => {
		return tools[index] ? TOOL_BUTTONS[tools[index]] : null
	}

	const _selectTool = (index) => {
		dispatch(SELECT, {
			tool: tools[index],
		})
	}
</script>

<hr class="palette__divider" />
<section data-testid="__palette-tools__" aria-label="Palette tools" class="palette__tools">
	<svelte:component this={_renderTool(0)} on:click={() => _selectTool(0)} />
	<svelte:component this={_renderTool(1)} on:click={() => _selectTool(1)} />
	<svelte:component this={_renderTool(2)} on:click={() => _selectTool(2)} />
	<svelte:component this={_renderTool(3)} on:click={() => _selectTool(3)} />
	<svelte:component this={_renderTool(4)} on:click={() => _selectTool(4)} />
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
