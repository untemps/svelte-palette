<script>
	import { createEventDispatcher } from 'svelte'
	import { resolveClassName } from '@untemps/utils/dom/resolveClassName'
	import { extractByIndices } from '@untemps/utils/array/extractByIndices'

	import { SELECT } from '../enums/PaletteEvent'
	import { NONE, TOOLTIP } from '../enums/PaletteDeletionMode'

	import PaletteCompactToggleButton from './PaletteCompactToggleButton.svelte'
	import PaletteInput from './PaletteInput.svelte'
	import PaletteSlot from './PaletteSlot.svelte'
	import PaletteTrashButton from './PaletteTrashButton.svelte'
	import PaletteLoader from './PaletteLoader.svelte'
	import PaletteTools from './PaletteTools.svelte'

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
	export let numColumns = 5
	export let transition = null
	export let compactColorIndices = []
	export let isCompact = false

	let _isCompact = false

	$: _isCompact = isCompact

	let _colors = []
	let _maxColumns = 0
	let _numColumns = 0

	$: Promise.resolve(colors).then((result) => {
		let c = _isCompact ? extractByIndices(result, compactColorIndices) : result
		c = !allowDuplicates ? c.filter((item, index) => c.indexOf(item) === index) : c
		c = result.slice(0, c.length < maxColors || maxColors === -1 ? c.length : maxColors)
		_colors = c

		_maxColumns = Math.min(result.length, maxColors) + +showTransparentSlot + (compactColorIndices?.length ? 1 : 0)
		_numColumns = numColumns > _maxColumns || numColumns <= 0 ? _maxColumns : numColumns
	})

	let _deletionMode = deletionMode

	$: _deletionMode = allowDeletion && deletionMode === NONE ? TOOLTIP : deletionMode

	const dispatch = createEventDispatcher()

	const _selectColor = (color) => {
		selectedColor = color
		dispatch(SELECT, { color })
	}

	const _addColor = (color) =>
		(_colors =
			allowDuplicates || !_colors.includes(color)
				? [
						..._colors.slice(
							0,
							_colors.length < maxColors || maxColors === -1 ? _colors.length : maxColors - 1
						),
						color,
				  ]
				: _colors)

	const _removeColor = (index) => (_colors = _colors.filter((c, i) => i !== index))

	const _onSlotSelect = ({ detail: { color } }) => _selectColor(color)

	const _onInputAdd = ({ detail: { color } }) => _addColor(color)

	const _onDelete = (index) => _removeColor(index)

	const _onCompact = ({ detail: { isCompact } }) => (_isCompact = !_isCompact)
</script>

<div class={resolveClassName(['palette', $$props.class, [_isCompact, 'palette--compact']])}>
	<section class="palette__content" style="--num-columns: {_numColumns}">
		{#if $$slots.header && !_isCompact}
			<slot name="header" {selectedColor} />
		{/if}
		{#if _colors?.length}
			<ul class="palette__cells">
				{#if showTransparentSlot && !_isCompact}
					<li data-testid="__palette-cell__" class="palette__cells__cell">
						<slot name="transparent-slot">
							<PaletteSlot
								aria-label="Transparent slot"
								selected={selectedColor === null}
								on:click={_onSlotSelect}
							/>
						</slot>
					</li>
				{/if}
				{#each _colors as color, index (`${color}_${index}`)}
					<li
						data-testid="__palette-cell__"
						class="palette__cells__cell"
						use:useDeletion={{
							deletionMode: _deletionMode,
							onDelete: () => _onDelete(index),
							tooltipContentSelector,
							tooltipClassName,
						}}
					>
						<slot name="slot" {color} {selectedColor} {transition} isCompact={_isCompact}>
							<PaletteSlot
								{color}
								selected={color === selectedColor}
								{transition}
								on:click={_onSlotSelect}
							/>
						</slot>
					</li>
				{/each}
			</ul>
		{:else}
			<slot name="loader">
				<div class="palette__content">
					<PaletteLoader />
				</div>
			</slot>
		{/if}
		{#if $$slots.footer && !_isCompact}
			<slot name="footer" {selectedColor} />
		{/if}
	</section>
	<slot name="input" {selectedColor} {inputType}>
		<PaletteInput color={selectedColor} {inputType} on:add={_onInputAdd} />
	</slot>
	<slot name="tools" {compactColorIndices}>
		<PaletteTools hasCompactMode={!!compactColorIndices?.length} />
	</slot>
</div>

<template id="tooltip-template">
	<PaletteTrashButton />
</template>

<style>
	:global(*) {
		box-sizing: border-box;
	}

	.palette {
		width: 100%;
		color: black;
		display: flex;
		flex-direction: column;
		align-items: center;
		background-color: #fafafa;
	}

	.palette.palette--compact {
		padding: 0.3rem;
	}

	.palette__content {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 1rem;
	}

	.palette__content_loading {
		font-size: 0.8rem;
		color: #ccc;
	}

	.palette__cells {
		width: 100%;
		display: grid;
		grid-template-columns: repeat(var(--num-columns), minmax(2rem, 1fr));
		grid-auto-rows: minmax(2rem, 1fr);
		column-gap: 0.3rem;
		align-items: center;
		justify-items: center;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.palette__cells__cell {
		margin-top: 2px;
	}

	.palette__divider {
		border: none;
		background-color: #fff;
		width: 100%;
		height: 1px;
		margin: 0;
	}
</style>
