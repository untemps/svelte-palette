<script>
	// TODO: Manage maxNumColumns
	import { createEventDispatcher } from 'svelte'

	import { calculateColors, calculateNumColumns } from '../utils/utils.js'

	import { SELECT } from '../enums/PaletteEvent'
	import { NONE } from '../enums/PaletteDeletionMode'
	import { COMPACT, SETTINGS } from '$lib/enums/PaletteTool.js'

	import PaletteInput from './PaletteInput.svelte'
	import PaletteSlot from './PaletteSlot.svelte'
	import PaletteTrashButton from './PaletteTrashButton.svelte'
	import PaletteLoader from './PaletteLoader.svelte'
	import PaletteTools from './PaletteTools.svelte'
	import PaletteSettingsPanel from './PaletteSettingsPanel.svelte'
	import PaletteCompactToggleButton from './PaletteCompactToggleButton.svelte'

	import useDeletion from './useDeletion'

	export let colors = null
	export let selectedColor = null
	export let isCompact = false
	export let compactColorIndices = []
	export let allowDuplicates = false
	export let deletionMode = NONE
	export let tooltipClassName = null
	export let tooltipContentSelector = null
	export let showTransparentSlot = false
	export let maxColors = 30
	export let inputType = 'text'
	export let numColumns = 5
	export let transition = null

	let _colors = null
	let _numColumns = numColumns
	let _isSettingsOn = false

	$: _isCompact = isCompact

	$: Promise.resolve(colors).then((results) => {
		if (!!results) {
			const newColors = calculateColors(results, {
				isCompact: _isCompact,
				compactColorIndices,
				allowDuplicates,
				maxColors,
			})
			_colors = newColors
			_numColumns = calculateNumColumns(newColors.length, {
				isCompact: _isCompact,
				compactColorIndices,
				showTransparentSlot,
				numColumns,
			})
		}
	})

	$: _tools = [...(compactColorIndices?.length ? [COMPACT] : []), ...($$slots.settings ? [SETTINGS] : [])]

	const dispatch = createEventDispatcher()

	const _selectColor = (color) => {
		selectedColor = color
		dispatch(SELECT, { color })
	}

	const _addColor = (color) => {
		_colors = calculateColors([..._colors, color], {
			isCompact: _isCompact,
			compactColorIndices,
			allowDuplicates,
			maxColors,
		})
		_numColumns = calculateNumColumns(_colors.length, {
			isCompact: _isCompact,
			compactColorIndices,
			showTransparentSlot,
			numColumns,
		})
	}

	const _removeColor = (index) => (_colors = _colors.filter((c, i) => i !== index))

	const _onSlotSelect = ({ detail: { color } }) => _selectColor(color)

	const _onInputAdd = ({ detail: { color } }) => _addColor(color)

	const _onDelete = (index) => _removeColor(index)

	const _onToolSelect = (args) => {
		const tool = args?.detail?.tool ?? args
		switch (tool) {
			case SETTINGS:
				_isSettingsOn = true
				break
			case COMPACT:
				_isCompact = !_isCompact
				_numColumns = _isCompact ? compactColorIndices.length : _numColumns
				break
		}
	}

	const _onExpand = () => {
		_isCompact = !_isCompact
		_numColumns = _isCompact ? compactColorIndices.length : _numColumns
	}

	const _onSettingsClose = () => {
		_isSettingsOn = false
	}
</script>

<div class="palette {$$props.class}" role="main">
	<section class="palette__content" class:palette__content--compact={_isCompact} style="--num-columns: {_numColumns}">
		{#if !_isCompact}
			<slot name="header" {selectedColor} />
		{/if}
		{#if !!_colors}
			<ul class="palette__cells">
				{#if showTransparentSlot}
					<li data-testid="__palette-cell__" class="palette__cells__cell">
						<slot name="transparent-slot">
							<PaletteSlot
								aria-label="Transparent slot"
								selected={selectedColor === null}
								on:select={_onSlotSelect}
							/>
						</slot>
					</li>
				{/if}
				{#each _colors as color, index (`${color}_${index}`)}
					<li
						data-testid="__palette-cell__"
						class="palette__cells__cell"
						use:useDeletion={{
							deletionMode,
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
								on:select={_onSlotSelect}
							/>
						</slot>
					</li>
				{/each}
			</ul>
		{:else}
			<slot name="loader">
				<PaletteLoader />
			</slot>
		{/if}
		{#if !_isCompact}
			<slot name="footer" {selectedColor} />
		{/if}
		{#if _isCompact}
			<PaletteCompactToggleButton isCompact={true} on:click={_onExpand} />
		{/if}
	</section>
	{#if !_isCompact}
		<slot name="input" {selectedColor} {inputType}>
			<PaletteInput color={selectedColor} {inputType} on:add={_onInputAdd} />
		</slot>
	{/if}
	{#if !_isCompact && !!_tools?.length}
		<slot name="tools" {compactColorIndices} isCompact={_isCompact} onSelect={_onToolSelect}>
			<PaletteTools tools={_tools} on:select={_onToolSelect} />
		</slot>
	{/if}
</div>
{#if $$slots.settings}
	<PaletteSettingsPanel isVisible={_isSettingsOn} on:close={_onSettingsClose}>
		<slot name="settings" onClose={_onSettingsClose} />
	</PaletteSettingsPanel>
{/if}

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

	.palette__content {
		width: 100%;
		min-height: 70px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 1rem;
	}

	.palette__content.palette__content--compact {
		min-height: auto;
		padding: 0.3rem 0.6rem;
		flex-direction: row;
		column-gap: 0.7rem;
	}

	.palette__content > .palette__cells {
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

	.palette__content > .palette__cells > .palette__cells__cell {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.palette__content.palette__content--compact > .palette__cells {
		grid-template-columns: repeat(var(--num-columns), minmax(1.5rem, 1fr));
		column-gap: 0;
	}
</style>
