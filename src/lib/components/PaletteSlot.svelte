<script>
	import { createEventDispatcher } from 'svelte'
	import { resolveClassName } from '@untemps/utils/dom/resolveClassName'

	import { CLICK } from '../enums/PaletteEvent'

	export let color = null
	export let selected = false
	export let disabled = false
	export let transition = null

	const dispatch = createEventDispatcher()

	const enter = (node) => transition?.fn(node, transition?.args)

	const _onClick = () =>
		!disabled &&
		dispatch(CLICK, {
			color,
		})
</script>

<button
	data-testid="__palette-slot__"
	aria-label={color}
	{...$$restProps}
	style="--color:{color}; --outerBorderColor:{color || '#aaa'};"
	class={resolveClassName([
		[!color, 'empty'],
		[selected, 'selected'],
		[!disabled, 'clickable'],
	])}
	{disabled}
	in:enter
	on:click|preventDefault={_onClick}
/>

<style>
	button {
		width: 1rem;
		height: 1rem;
		margin: 0;
		padding: 0;
		border: 1px solid rgba(0, 0, 0, 0.2);
		border-radius: 50%;
		background-color: var(--color);
	}

	button:active {
		background-color: var(--color);
	}

	button:focus {
		outline: 2px solid #bdbdbd;
		outline-offset: 2px;
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
