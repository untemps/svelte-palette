<script>
	import { createEventDispatcher } from 'svelte'

	export let color = null
	export let onChange = null

	const dispatch = createEventDispatcher()

	const _onChange = (e) =>
		dispatch('change', {
			color: e.target.value,
		})
</script>

<input type="color" value={color} on:change|preventDefault={_onChange} />

<style>
	input {
		margin: 0;
		padding: 0;
	}
</style>
