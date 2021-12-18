<script>
	import { createEventDispatcher } from 'svelte'
	import { scale } from 'svelte/transition'
	import { elasticOut } from 'svelte/easing'

	import { resolveClass } from './utils'

	export let color = null
	export let selected = false
	export let disabled = false
	export let emptyAriaLabel = 'No color'

	const dispatch = createEventDispatcher()

	const _onClick = () =>
		!disabled &&
		dispatch('click', {
			color,
		})
</script>

<button
	data-testid="__palette-slot-root__"
	{...$$restProps}
	aria-label={color || emptyAriaLabel}
	style="--color:{color}; --outerBorderColor:{color || '#aaa'};"
	class={resolveClass([
		[!color, 'empty'],
		[selected, 'selected'],
		[!disabled, 'clickable'],
	])}
	{disabled}
	in:scale={{ duration: 500, easing: elasticOut }}
	on:click|preventDefault={_onClick}
/>

<style>
	button {
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

	button.selected {
		outline: 2px solid var(--outerBorderColor);
		outline-offset: 2px;
	}

	button.clickable {
		cursor: pointer;
	}

	button.empty {
		border: #aaa solid 1px;
		background: linear-gradient(to top left, #00000000 calc(50% - 1px), #aaa 50% 50%, #00000000 calc(50% + 1px));
	}
</style>
