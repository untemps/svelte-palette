<script>
	import { createEventDispatcher } from 'svelte'
	import { scale } from 'svelte/transition'
	import { elasticOut } from 'svelte/easing'

	export let color

	const dispatch = createEventDispatcher()

	const _onClick = () =>
		dispatch('click', {
			color,
		})
</script>

<li
	style="--color:{color}"
	in:scale={{ duration: 500, easing: elasticOut }}
	on:click|preventDefault={_onClick}
/>

<style>
	li {
		cursor: pointer;
		width: 1rem;
		height: 1rem;
		border-radius: 50%;
		background-color: var(--color);
	}
</style>
