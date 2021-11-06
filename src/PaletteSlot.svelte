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

<button
	{...$$restProps}
	data-testid='__palette-slot-root__'
	aria-label={color}
	style="--color:{color}"
	in:scale={{ duration: 500, easing: elasticOut }}
	on:click|preventDefault={_onClick}
/>

<style>
	button {
		cursor: pointer;
		width: 1rem;
		height: 1rem;
		margin: 0;
		padding: 0;
		border: none;
		border-radius: 50%;
		background-color: var(--color);
	}

	button:active {
		background-color: var(--color);
	}

	button:focus {
		box-shadow: 0 0 0 2px #fff, 0 0 0 4px var(--color);
	}
</style>
