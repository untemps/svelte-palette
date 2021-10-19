<script>
	import PaletteInput from './PaletteInput.svelte'
	import PaletteSlots from './PaletteSlots.svelte'
	import { createEventDispatcher } from 'svelte'

	export let colors = []
	export let selectedColor = null

	const dispatch = createEventDispatcher()

	const _selectColor = (color) => {
		selectedColor = color
		dispatch('select', { color })
	}
	const _addColor = (color) => (colors = [...colors, color])

	const _onSlotSelect = (e) => _selectColor(e.detail.color)

	const _onInputChange = (e) => _addColor(e.detail.color)
</script>

<section>
	<PaletteSlots {colors} numCols={5} on:select={_onSlotSelect} />
	<PaletteInput color={selectedColor} on:change={_onInputChange} />
</section>

<style>
	section {
		background-color: #fafafa;
		display: grid;
		grid-template-rows: auto auto;
		grid-gap: 1rem;
		align-items: center;
		justify-items: center;
		max-width: 10rem;
		padding: 1rem;
	}
</style>
