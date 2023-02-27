<script>
	import { afterUpdate, createEventDispatcher } from 'svelte'
	import { resolveClassName } from '@untemps/utils/dom/resolveClassName'
	import { extractByIndices } from '@untemps/utils/array/extractByIndices'

	import { SELECT } from '../enums/PaletteEvent'
	import { NONE, TOOLTIP } from '../enums/PaletteDeletionMode'

	import PaletteCompactToggleButton from './PaletteCompactToggleButton.svelte'
	import PaletteInput from './PaletteInput.svelte'
	import PaletteSlot from './PaletteSlot.svelte'
	import PaletteTrashButton from './PaletteTrashButton.svelte'

	import useDeletion from './useDeletion'

	export let colors = []
	export let compactColorIndices = []
	export let selectedColor = null
	export let allowDuplicates = false
	export let allowDeletion = false
	export let deletionMode = NONE
	export let tooltipClassName = null
	export let tooltipContentSelector = null
	export let showTransparentSlot = false
	export let maxColors = 30
	export let inputType = 'text'

	let _colors = []
	let _isCompact = false

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
		if (_isCompact) {
			colors = _colors
			_colors = []
		} else {
			_colors = [...colors]
			colors = extractByIndices(colors, compactColorIndices)
		}
		_isCompact = !_isCompact
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
		padding: 0.5rem;
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
</style>

<section
	class={resolveClassName([
		[!!$$props.class, $$props.class, 'palette__root'],
		[_isCompact, 'palette__root-compact'],
	])}>
	{#if $$slots.header}
		<slot name="header" />
		<slot name="header-divider">
			<hr class="palette__divider" />
		</slot>
	{/if}
	<ul class="palette__list">
		{#if !!compactColorIndices?.length}
			<li>
				<PaletteCompactToggleButton isCompact={_isCompact} on:click={_onCompactClick} />
			</li>
		{/if}
		{#if showTransparentSlot && !_isCompact}
			<li data-testid="__palette-row__" class="palette__slot">
				<slot name="transparent-slot">
					<PaletteSlot
						aria-label="Transparent slot"
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
						color={color}
						selected={color === selectedColor}
						on:click={_onSlotSelect} />
				</slot>
			</li>
		{/each}
	</ul>
	{#if !_isCompact}
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
	<PaletteTrashButton />
</template>
