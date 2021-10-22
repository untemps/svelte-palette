<script>
	import { createEventDispatcher } from 'svelte'

	import PaletteInput from './PaletteInput.svelte'
	import PaletteSlot from './PaletteSlot.svelte'

	export let colors = []
	export let selectedColor = null
	export let allowDuplicates = false

	const dispatch = createEventDispatcher()

	const _selectColor = (color) => {
		selectedColor = color
		dispatch('select', { color })
	}
	const _addColor = (color) => (colors = allowDuplicates || !colors.includes(color) ? [...colors, color] : colors)

	const _onSlotSelect = (e) => _selectColor(e.detail.color)

	const _onInputAdd = (e) => _addColor(e.detail.color)
</script>

<section>
	<slot name="header" />
	<ul>
		{#each colors as color}
			<li>
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

	@media (min-width: 320px) {
		ul {
			--numCols: 5;
		}
	}
</style>
