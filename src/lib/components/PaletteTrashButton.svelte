<script>
	import TrashIcon from './icons/TrashIcon.svelte'

	export let isActive = false
</script>

<button
	data-testid="__palette-trash-button__"
	type="button"
	{...$$restProps}
	class="trash_button__button {$$props.class ?? ''}"
	class:icon_button__button--active={isActive}
	on:click
>
	<TrashIcon />
</button>

<style>
	.trash_button__button {
		position: relative;
		min-width: 1.6rem;
		height: 1.6rem;
		margin: 0;
		padding: 0;
		background: none;
		border: none;
		cursor: pointer;
	}

	.trash_button__button:disabled {
		opacity: 0.5;
	}

	.trash_button__button:focus {
		border-color: #bdbdbd;
		outline: none;
	}

	.trash_button__button--active {
		background-color: #e5e5e5;
		outline: none;
	}

	:global(.trash_button__button > svg) {
		position: absolute;
		top: calc(50% - 12px);
		left: calc(50% - 12px);
		width: 24px;
		height: 24px;
	}

	:global(
			.trash_button__button > svg path,
			.trash_button__button > svg circle,
			.trash_button__button > svg line,
			.trash_button__button > svg polyline
		) {
		stroke: #fff;
	}
</style>
