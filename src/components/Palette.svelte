<script>
	import { afterUpdate, createEventDispatcher } from 'svelte'
	import { resolveClassName } from '@untemps/utils/dom/resolveClassName'
	import { extractByIndices } from '@untemps/utils/array/extractByIndices'

	import { SELECT } from '../enums/PaletteEvent'
	import { NONE, TOOLTIP } from '../enums/PaletteDeletionMode'

	import PaletteInput from './PaletteInput.svelte'
	import PaletteSlot from './PaletteSlot.svelte'

	import useDeletion from './useDeletion'

	export let colors = []
	export let selectedColor = null
	export let allowDuplicates = false
	export let allowDeletion = false
	export let deletionMode = NONE
	export let tooltipClassName = null
	export let tooltipContentSelector = null
	export let showTransparentSlot = false
	export let maxColors = 30
	export let inputType = 'text'
	export let compactColors = []

	let _colors = []
	let isCompact = false

	$: deletionMode = allowDeletion && deletionMode === NONE ? TOOLTIP : deletionMode

	const dispatch = createEventDispatcher()

	afterUpdate(() => {
		if (!allowDuplicates) {
			colors = colors.filter((item, index) => colors.indexOf(item) === index)
		}
	})

	const _selectColor = (color) => {
		selectedColor = color
		dispatch(SELECT, { color })
	}

	const _addColor = (color) =>
		(colors =
			allowDuplicates || !colors.includes(color)
				? [
						...colors.slice(
							0,
							colors.length < maxColors || maxColors === -1 ? colors.length : maxColors - 1
						),
						color,
				  ]
				: colors)

	const _removeColor = (index) => (colors = colors.filter((c, i) => i !== index))

	const _onSlotSelect = ({ detail: { color } }) => _selectColor(color)

	const _onInputAdd = ({ detail: { color } }) => _addColor(color)

	const _onDelete = (index) => _removeColor(index)

	const _onCompactClick = () => {
		if (isCompact) {
			isCompact = false
			colors = _colors
			_colors = []
		} else {
			isCompact = true
			_colors = [...colors]
			colors = extractByIndices(colors, compactColors)
		}
	}
</script>

<style>
	* {
		box-sizing: border-box;
	}

	.palette__root {
		display: flex;
		flex-direction: column;
		row-gap: 1rem;
		align-items: center;
		min-width: 10rem;
		padding: 2rem;
		background-color: #fafafa;
	}

	.palette__root.palette__root-compact {
		padding: .5rem;
	}

	.palette__list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(5, 32px);
		grid-auto-rows: minmax(32px, auto);
		align-items: center;
		justify-items: center;
	}

    .palette__slot {
        margin-top: 5px;
    }

	.palette__divider {
		border: none;
		background-color: #ccc;
		width: calc(100% + 4rem);
		height: 1px;
		margin-left: -2rem;
	}

	.tooltip__button {
		cursor: pointer;
		margin: 0;
		padding: 0;
		background: none;
		border: none;
	}

	.tooltip__button svg {
		width: 1.5rem;
	}

	.tooltip__button svg path {
		fill: white;
	}

	.tooltip__button:active {
		background: none;
	}

	.tooltip__button:active svg path {
		fill: #aaaaaa;
	}

	:global(button.icon) {
		position: relative;
		width: 2rem;
		height: 2rem;
		margin: 0;
		background: none;
		border-color: rgba(0, 0, 0, 0);
		border-radius: 0.3rem;
		cursor: pointer;
	}

	:global(button.icon:disabled) {
		opacity: 0.5;
	}

	:global(button.icon:focus) {
		border-color: rgba(0, 0, 0, 0.3);
	}

	:global(button.icon svg) {
		position: absolute;
		top: calc(50% - 8px);
		left: calc(50% - 8px);
		width: 16px;
		height: 16px;
	}

	:global(button.icon svg path) {
		fill: rgba(0, 0, 0, 0.6);
	}
</style>

<section
	class={resolveClassName([
		[!!$$props.class, $$props.class, 'palette__root'],
		[isCompact, 'palette__root-compact'],
	])}>
	{#if $$slots.header}
		<slot name="header" />
		<slot name="header-divider">
			<hr class="palette__divider" />
		</slot>
	{/if}
	<ul class="palette__list">
		{#if !!compactColors?.length}
			<li>
				<button
					data-testid="__palette-compact-root__"
					type="button"
					class="icon"
					aria-label="Compact"
					on:click={_onCompactClick}>
					{#if isCompact}
						<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
							<path
								d="M14.5 9.5L21 3M21 3H15M21 3V9M3 21L9.5 14.5M3 21V15M3 21H9"
								stroke="rgba(0, 0, 0, 0.6)"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round" />
						</svg>
					{:else}
						<svg width="16" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
							<path
								d="M14 10L21 3M14 10H20M14 10V4M3 21L10 14M10 14V20M10 14H4"
								stroke="rgba(0, 0, 0, 0.6)"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round" />
						</svg>
					{/if}
				</button>
			</li>
		{/if}
		{#if showTransparentSlot && !isCompact}
			<li data-testid="__palette-row__" class="palette__slot">
				<slot name="transparent-slot">
					<PaletteSlot
						emptyAriaLabel="transparent"
						selected={selectedColor === null}
						on:click={_onSlotSelect} />
				</slot>
			</li>
		{/if}
		{#each colors.slice(0, colors.length < maxColors || maxColors === -1 ? colors.length : maxColors) as color, index (`${color}_${index}`)}
			<li
				data-testid="__palette-row__"
                class="palette__slot"
				use:useDeletion={{
					deletionMode,
					onDelete: () => _onDelete(index),
					tooltipContentSelector,
					tooltipClassName,
				}}>
				<slot name="slot" color={color}>
					<PaletteSlot
						data-testid="__palette-slot__"
						color={color}
						selected={color === selectedColor}
						on:click={_onSlotSelect} />
				</slot>
			</li>
		{/each}
	</ul>
	{#if !isCompact}
		<slot name="footer-divider">
			<hr class="palette__divider" />
		</slot>
		<slot name="footer">
			<slot name="input">
				<PaletteInput color={selectedColor} inputType={inputType} on:add={_onInputAdd} />
			</slot>
		</slot>
	{/if}
</section>

<template id="tooltip-template">
	<div role="button" data-testid="__palette-tooltip__" class="tooltip__button">
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -256 1792 1792">
			<g transform="matrix(1,0,0,-1,197.42373,1255.0508)">
				<path
					d="M 512,800 V 224 q 0,-14 -9,-23 -9,-9 -23,-9 h -64 q -14,0 -23,9 -9,9 -9,23 v 576 q 0,14 9,23 9,9 23,9 h 64 q 14,0 23,-9 9,-9 9,-23 z m 256,0 V 224 q 0,-14 -9,-23 -9,-9 -23,-9 h -64 q -14,0 -23,9 -9,9 -9,23 v 576 q 0,14 9,23 9,9 23,9 h 64 q 14,0 23,-9 9,-9 9,-23 z m 256,0 V 224 q 0,-14 -9,-23 -9,-9 -23,-9 h -64 q -14,0 -23,9 -9,9 -9,23 v 576 q 0,14 9,23 9,9 23,9 h 64 q 14,0 23,-9 9,-9 9,-23 z M 1152,76 v 948 H 256 V 76 Q 256,54 263,35.5 270,17 277.5,8.5 285,0 288,0 h 832 q 3,0 10.5,8.5 7.5,8.5 14.5,27 7,18.5 7,40.5 z M 480,1152 h 448 l -48,117 q -7,9 -17,11 H 546 q -10,-2 -17,-11 z m 928,-32 v -64 q 0,-14 -9,-23 -9,-9 -23,-9 h -96 V 76 q 0,-83 -47,-143.5 -47,-60.5 -113,-60.5 H 288 q -66,0 -113,58.5 Q 128,-11 128,72 v 952 H 32 q -14,0 -23,9 -9,9 -9,23 v 64 q 0,14 9,23 9,9 23,9 h 309 l 70,167 q 15,37 54,63 39,26 79,26 h 320 q 40,0 79,-26 39,-26 54,-63 l 70,-167 h 309 q 14,0 23,-9 9,-9 9,-23 z" />
			</g>
		</svg>
	</div>
</template>
