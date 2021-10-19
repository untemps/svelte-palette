<script>
	import { createEventDispatcher } from 'svelte'

	import PaletteSlot from './PaletteSlot.svelte'

	export let colors = []
	export let numCols = 5

	const dispatch = createEventDispatcher()

	const _onSlotClick = ({ detail: { color } }) => {
		dispatch('select', {
			color,
		})
	}
</script>

<ul style="--numCols:{numCols}">
	{#each colors as color}
		<PaletteSlot {color} on:click={_onSlotClick} />
	{/each}
</ul>

<style>
	ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(var(--numCols), 1fr);
		grid-gap: 1rem;
		align-items: center;
		justify-items: center;
	}
</style>
