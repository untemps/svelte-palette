<script>
	import { createEventDispatcher } from 'svelte'
	import { resolveClassName } from '@untemps/utils/dom/resolveClassName'
	
	import { CLICK } from '../enums/PaletteEvent'

	import { COMPACT, ENLARGE, EYE_DROPPER, PLUS, TRASH } from '../enums/PaletteIcon'

	import CompactIcon from './icons/CompactIcon.svelte'
	import EnlargeIcon from './icons/EnlargeIcon.svelte'
	import EyeDropperIcon from './icons/EyeDropperIcon.svelte'
	import PlusIcon from './icons/PlusIcon.svelte'
	import TrashIcon from './icons/TrashIcon.svelte'

	const dispatch = createEventDispatcher()

	export let icon = null

	const _resolveIcon = (name) => {
		switch (name) {
			case COMPACT:
				return CompactIcon
			case ENLARGE:
				return EnlargeIcon
			case EYE_DROPPER:
				return EyeDropperIcon
			case PLUS:
				return PlusIcon
			case TRASH:
				return TrashIcon
			default:
				return null
		}
	}

	const _onClick = (e) => dispatch(CLICK, { event: e })
</script>

<style>
	.icon_button__button {
		position: relative;
		width: 2rem;
		height: 2rem;
		margin: 0;
		background: none;
		border-width: 1px;
		border-color: rgba(0, 0, 0, 0.1);
		border-radius: 0.3rem;
		cursor: pointer;
	}

	.icon_button__button:disabled {
		opacity: 0.5;
	}

	.icon_button__button:focus {
		border-color: rgba(0, 0, 0, 0.3);
	}

	:global(.icon_button__button > svg) {
		position: absolute;
		top: calc(50% - 8px);
		left: calc(50% - 8px);
		width: 16px;
		height: 16px;
	}

	:global(.icon_button__button > svg path) {
		fill: rgba(0, 0, 0, 0.6);
	}
</style>

<button
	data-testid="__palette-icon-button__"
	type="button"
	{...$$restProps}
	class={resolveClassName(['icon_button__button', $$props.class])}
	on:click|preventDefault={_onClick}>
	<svelte:component this={_resolveIcon(icon)} />
</button>
