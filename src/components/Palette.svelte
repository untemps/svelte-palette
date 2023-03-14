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

	let _colors

	$: _colors = _isCompact ? extractByIndices(colors, compactColorIndices) : colors
	$: _colors = !allowDuplicates ? colors.filter((item, index) => colors.indexOf(item) === index) : colors

	let _maxColumns
	let _numColumns

	$: _maxColumns = Math.min(colors.length, maxColors) + +showTransparentSlot + (compactColorIndices?.length ? 1 : 0)
	$: _numColumns = numColumns > _maxColumns || numColumns <= 0 ? _maxColumns : numColumns

	let _deletionMode

	$: _deletionMode = allowDeletion && deletionMode === NONE ? TOOLTIP : deletionMode

	const dispatch = createEventDispatcher()

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

	const _onCompact = ({ detail: { isCompact } }) => _isCompact = !_isCompact
</script>

<style>
	:global(*) {
		box-sizing: border-box;
	}

	.palette {
		min-width: 10rem;
		background-color: #fafafa;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.palette__content {
		width: 100%;
		padding: 2rem;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

    .palette.palette--compact .palette__content {
        padding: 0.3rem;
    }

	.palette__cells {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(var(--num-columns), 2rem);
		grid-auto-rows: minmax(2rem, auto);
		align-items: center;
		justify-items: center;
	}

	.palette__cells__cell {
		margin-top: 2px;
	}

	.palette__divider {
		border: none;
		background-color: #ccc;
		width: 100%;
		height: 1px;
		margin: 0;
	}
</style>

<section
	class={resolveClassName([
		'palette',
		$$props.class,
		[_isCompact, 'palette--compact'],
	])}
	style="--num-columns: {_numColumns}">
	{#if $$slots.header}
		<slot name="header" {selectedColor}/>
		<slot name="header-divider">
			<hr class="palette__divider" />
		</slot>
	{/if}
	<div class="palette__content">
		<ul class="palette__cells">
			{#if !!compactColorIndices?.length}
				<li>
                    <slot name="compact-control" isCompact={_isCompact}>
					    <PaletteCompactToggleButton isCompact={_isCompact} on:click={_onCompact} />
                    </slot>
				</li>
			{/if}
			{#if showTransparentSlot && !_isCompact}
				<li data-testid="__palette-cell__" class="palette__cells__cell">
					<slot name="transparent-slot">
						<PaletteSlot
							aria-label="Transparent slot"
							selected={selectedColor === null}
							on:click={_onSlotSelect} />
					</slot>
				</li>
			{/if}
			{#each _colors.slice(0, _colors.length < maxColors || maxColors === -1 ? _colors.length : maxColors) as color, index (`${color}_${index}`)}
				<li
					data-testid="__palette-cell__"
					class="palette__cells__cell"
					use:useDeletion={{
						deletionMode: _deletionMode,
						onDelete: () => _onDelete(index),
						tooltipContentSelector,
						tooltipClassName,
					}}>
					<slot name="slot" {color} {selectedColor} {transition} isCompact={_isCompact}>
						<PaletteSlot color={color} selected={color === selectedColor} {transition} on:click={_onSlotSelect} />
					</slot>
				</li>
			{/each}
		</ul>
	</div>
	{#if !_isCompact}
		<slot name="footer-divider">
			<hr class="palette__divider" />
		</slot>
		<slot name="footer" {selectedColor}>
			<slot name="input" {selectedColor} {inputType}>
				<div class="palette__content">
					<PaletteInput color={selectedColor} inputType={inputType} on:add={_onInputAdd} />
				</div>
			</slot>
		</slot>
	{/if}
</section>

<template id="tooltip-template">
	<PaletteTrashButton />
</template>
