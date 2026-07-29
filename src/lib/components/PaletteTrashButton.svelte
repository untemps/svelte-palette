<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements'

	import TrashIcon from './icons/TrashIcon.svelte'

	import { DEFAULT_LABELS } from '../labels'

	interface Props {
		/** Whether the button is in its active state. */
		isActive?: boolean
		/** Accessible name of the delete button. */
		deleteLabel?: string
		/** Class name applied to the button. */
		class?: string
		/** Called when the button is clicked. */
		onclick?: (event: MouseEvent) => void
	}

	let {
		isActive = false,
		deleteLabel = DEFAULT_LABELS.trash,
		class: className = '',
		onclick = undefined,
		...restProps
	}: Props & Omit<HTMLButtonAttributes, keyof Props> = $props()
</script>

<button
	data-testid="__palette-trash-button__"
	type="button"
	aria-label={deleteLabel}
	{...restProps}
	class="trash_button__button {className}"
	class:trash_button__button--active={isActive}
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

	.trash_button__button:focus-visible {
		outline: 2px solid #fff;
		outline-offset: 2px;
	}

	.trash_button__button--active {
		background-color: #e5e5e5;
		outline: none;
	}

	@media (forced-colors: active) {
		.trash_button__button:focus-visible {
			outline-color: Highlight;
		}
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
