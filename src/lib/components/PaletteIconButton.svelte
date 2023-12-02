<script>
	import { COMPACT, ENLARGE, EYE_DROPPER, PLUS, SETTINGS, TRASH } from '../enums/PaletteIcon'

	import CompactIcon from './icons/CompactIcon.svelte'
	import EnlargeIcon from './icons/EnlargeIcon.svelte'
	import EyeDropperIcon from './icons/EyeDropperIcon.svelte'
	import PlusIcon from './icons/PlusIcon.svelte'
	import TrashIcon from './icons/TrashIcon.svelte'
	import SettingsIcon from './icons/SettingsIcon.svelte'

	export let icon = null
	export let isActive = false

	const ICONS = {
		[COMPACT]: CompactIcon,
		[ENLARGE]: EnlargeIcon,
		[EYE_DROPPER]: EyeDropperIcon,
		[PLUS]: PlusIcon,
		[TRASH]: TrashIcon,
		[SETTINGS]: SettingsIcon,
	}

	const _renderIcon = (name) => {
		return ICONS[name]
	}
</script>

<button
	data-testid="__palette-icon-button__"
	type="button"
	{...$$restProps}
	class="icon_button__button {$$props.class ?? ''}"
	class:icon_button__button--active={isActive}
	on:click
>
	<svelte:component this={_renderIcon(icon)} />
</button>

<style>
	.icon_button__button {
		position: relative;
		min-width: 2rem;
		height: 2rem;
		margin: 0;
		padding: 0;
		background-color: #fafafa;
		border-width: 1px;
		border-color: #e5e5e5;
		border-style: solid;
		border-radius: 0.3rem;
		cursor: pointer;
	}

	.icon_button__button:disabled {
		cursor: auto;
	}

	.icon_button__button:focus {
		border-color: #bdbdbd;
		outline: none;
	}

	.icon_button__button--active {
		background-color: #e5e5e5;
		outline: none;
	}

	:global(.icon_button__button > svg) {
		position: absolute;
		top: calc(50% - 8px);
		left: calc(50% - 8px);
		width: 16px;
		height: 16px;
	}

	:global(
			.icon_button__button > svg path,
			.icon_button__button > svg circle,
			.icon_button__button > svg line,
			.icon_button__button > svg polyline
		) {
		stroke: #646464;
	}

	:global(
			.icon_button__button:disabled > svg path,
			.icon_button__button:disabled > svg circle,
			.icon_button__button:disabled > svg line,
			.icon_button__button:disabled > svg polyline
		) {
		stroke: #bdbdbd;
	}
</style>
