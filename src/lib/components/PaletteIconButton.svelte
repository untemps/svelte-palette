<script>
	import { COMPACT, ENLARGE, EYE_DROPPER, PLUS, SETTINGS, TRASH } from '../enums/PaletteIcon'

	import CompactIcon from './icons/CompactIcon.svelte'
	import EnlargeIcon from './icons/EnlargeIcon.svelte'
	import EyeDropperIcon from './icons/EyeDropperIcon.svelte'
	import PlusIcon from './icons/PlusIcon.svelte'
	import TrashIcon from './icons/TrashIcon.svelte'
	import SettingsIcon from './icons/SettingsIcon.svelte'

	/**
	 * @typedef {import('../types').PaletteIconName} PaletteIconName
	 */

	/**
	 * @typedef {Object} Props
	 * @property {PaletteIconName | null} [icon] Icon to render.
	 * @property {boolean} [isActive] Whether the button is in its active state.
	 * @property {string} [class] Class name applied to the button.
	 * @property {(event: MouseEvent) => void} [onclick] Called when the button is clicked.
	 */

	/** @type {Props & Omit<import('svelte/elements').HTMLButtonAttributes, keyof Props>} */
	let { icon = null, isActive = false, class: className = '', onclick, ...restProps } = $props()

	const ICONS = {
		[COMPACT]: CompactIcon,
		[ENLARGE]: EnlargeIcon,
		[EYE_DROPPER]: EyeDropperIcon,
		[PLUS]: PlusIcon,
		[TRASH]: TrashIcon,
		[SETTINGS]: SettingsIcon,
	}
</script>

<button
	data-testid="__palette-icon-button__"
	type="button"
	{...restProps}
	class="icon_button__button {className}"
	class:icon_button__button--active={isActive}
	{onclick}
>
	{#if ICONS[icon]}
		{@const IconComponent = ICONS[icon]}
		<IconComponent />
	{/if}
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
