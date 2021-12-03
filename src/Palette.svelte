<script>
	import { createEventDispatcher } from 'svelte'

	import PaletteInput from './PaletteInput.svelte'
	import PaletteSlot from './PaletteSlot.svelte'

	import useTooltip from './useTooltip'
	import useConditional from './useConditional'

	export let colors = []
	export let selectedColor = null
	export let allowDuplicates = false
	export let allowDeletion = false
	export let showTransparentSlot = false

	const dispatch = createEventDispatcher()

	let tooltip = null

	const _selectColor = (color) => {
		selectedColor = color
		dispatch('select', { color })
	}

	const _addColor = (color) => (colors = allowDuplicates || !colors.includes(color) ? [...colors, color] : colors)

	const _removeColor = (_, index) => (colors = colors.filter((c, i) => i !== index))

	const _onSlotSelect = ({ detail: { color } }) => _selectColor(color)

	const _onSlotDelete = ({ detail: { color, index } }) => _removeColor(color, index)

	const _onInputAdd = ({ detail: { color } }) => _addColor(color)
</script>

<section>
	<slot name="header" />
	<ul>
		{#if showTransparentSlot}
			<li data-testid="__palette-row__">
				<slot name="transparent-slot">
					<PaletteSlot emptyAriaLabel='transparent' on:click={_onSlotSelect} />
				</slot>
			</li>
		{/if}
		{#each colors as color, index}
			<li
				data-testid="__palette-row__"
				use:useConditional={{
					action: useTooltip,
					options: { template: tooltip, callback: () => _onSlotDelete({ detail: { color, index } }) },
					condition: allowDeletion,
				}}
			>
				<slot name="slot" {color}>
					<PaletteSlot {color} on:click={_onSlotSelect} />
				</slot>
			</li>
		{/each}
	</ul>
	<slot name="footer">
		<slot name="input">
			<PaletteInput color={selectedColor} on:add={_onInputAdd} />
		</slot>
	</slot>
</section>
{#if allowDeletion}
	<button data-testid="__palette-tooltip__" class="tooltip__button" bind:this={tooltip}>
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -256 1792 1792">
			<g transform="matrix(1,0,0,-1,197.42373,1255.0508)">
				<path
					d="M 512,800 V 224 q 0,-14 -9,-23 -9,-9 -23,-9 h -64 q -14,0 -23,9 -9,9 -9,23 v 576 q 0,14 9,23 9,9 23,9 h 64 q 14,0 23,-9 9,-9 9,-23 z m 256,0 V 224 q 0,-14 -9,-23 -9,-9 -23,-9 h -64 q -14,0 -23,9 -9,9 -9,23 v 576 q 0,14 9,23 9,9 23,9 h 64 q 14,0 23,-9 9,-9 9,-23 z m 256,0 V 224 q 0,-14 -9,-23 -9,-9 -23,-9 h -64 q -14,0 -23,9 -9,9 -9,23 v 576 q 0,14 9,23 9,9 23,9 h 64 q 14,0 23,-9 9,-9 9,-23 z M 1152,76 v 948 H 256 V 76 Q 256,54 263,35.5 270,17 277.5,8.5 285,0 288,0 h 832 q 3,0 10.5,8.5 7.5,8.5 14.5,27 7,18.5 7,40.5 z M 480,1152 h 448 l -48,117 q -7,9 -17,11 H 546 q -10,-2 -17,-11 z m 928,-32 v -64 q 0,-14 -9,-23 -9,-9 -23,-9 h -96 V 76 q 0,-83 -47,-143.5 -47,-60.5 -113,-60.5 H 288 q -66,0 -113,58.5 Q 128,-11 128,72 v 952 H 32 q -14,0 -23,9 -9,9 -9,23 v 64 q 0,14 9,23 9,9 23,9 h 309 l 70,167 q 15,37 54,63 39,26 79,26 h 320 q 40,0 79,-26 39,-26 54,-63 l 70,-167 h 309 q 14,0 23,-9 9,-9 9,-23 z"
				/>
			</g>
		</svg>
	</button>
{/if}

<style>
	section {
		display: flex;
		flex-direction: column;
		row-gap: 1rem;
		align-items: center;
		min-width: 10rem;
		padding: 2rem;
		background-color: #fafafa;
	}

	ul {
		--numCols: 4;
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(var(--numCols), 1fr);
		grid-gap: 1rem;
		align-items: center;
		justify-items: center;
	}

	.tooltip__button {
		cursor: pointer;
		margin: 0;
		padding: 0;
		background: none;
		border: none;
	}

	.tooltip__button svg {
		width: 1.5rem;
	}

	.tooltip__button svg path {
		fill: white;
	}

	.tooltip__button:active {
		background: none;
	}

	.tooltip__button:active svg path {
		fill: #aaaaaa;
	}

	@media (min-width: 320px) {
		ul {
			--numCols: 5;
		}
	}
</style>
