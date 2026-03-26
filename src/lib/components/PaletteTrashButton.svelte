<script lang="ts">
	import TrashIcon from './icons/TrashIcon.svelte'

	let {
		isActive = false,
		class: className = '',
		onclick = undefined,
		...restProps
	}: {
		isActive?: boolean
		class?: string
		onclick?: () => void
		[key: string]: unknown
	} = $props()
</script>

<button
	data-testid="__palette-trash-button__"
	type="button"
	{...restProps}
	class="trash_button__button {className}"
	class:icon_button__button--active={isActive}
	{onclick}
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
