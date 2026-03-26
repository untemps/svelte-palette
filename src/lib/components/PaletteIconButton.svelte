<script lang="ts">
	import type { Component } from 'svelte'
	import { COMPACT, ENLARGE, EYE_DROPPER, PLUS, SETTINGS, TRASH } from '../enums/PaletteIcon'
	import type { PaletteIcon } from '../enums/PaletteIcon'

	import CompactIcon from './icons/CompactIcon.svelte'
	import EnlargeIcon from './icons/EnlargeIcon.svelte'
	import EyeDropperIcon from './icons/EyeDropperIcon.svelte'
	import PlusIcon from './icons/PlusIcon.svelte'
	import TrashIcon from './icons/TrashIcon.svelte'
	import SettingsIcon from './icons/SettingsIcon.svelte'

	let {
		icon = null,
		isActive = false,
		class: className = '',
		onclick,
		...restProps
	}: {
		icon?: PaletteIcon | null
		isActive?: boolean
		class?: string
		onclick?: () => void
		[key: string]: unknown
	} = $props()

	const ICONS: Record<PaletteIcon, Component> = {
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
