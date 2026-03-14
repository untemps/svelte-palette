<script>
	// TODO: Manage maxNumColumns
	import { untrack } from 'svelte'

	import { calculateColors, calculateNumColumns } from '../utils/utils.js'

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

	let {
		colors = null,
		selectedColor = $bindable(null),
		isCompact = false,
		compactColorIndices = [],
		allowDuplicates = false,
		deletionMode = NONE,
		tooltipClassName = null,
		tooltipContentSelector = null,
		showTransparentSlot = false,
		maxColors = 30,
		showInput = false,
		inputType = 'text',
		numColumns = 5,
		transition = null,
		onselect = undefined,
		class: className = '',
		header = undefined,
		before_slot = undefined,
		transparent_slot = undefined,
		slot: colorSlot = undefined,
		after_slot = undefined,
		loader = undefined,
		footer = undefined,
		input = undefined,
		tools = undefined,
		settings = undefined,
	} = $props()

	let _colors = $state(null)
	let _numColumns = $state(untrack(() => numColumns))
	let _isSettingsOn = $state(false)
	let _isCompact = $state(untrack(() => isCompact))

	$effect(() => {
		_isCompact = isCompact
	})

	$effect(() => {
		Promise.resolve(colors).then((results) => {
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
	})

	let _tools = $derived([...(compactColorIndices?.length ? [COMPACT] : []), ...(settings ? [SETTINGS] : [])])

	const _selectColor = (color) => {
		selectedColor = color
		onselect?.({ color })
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

	const _onSlotSelect = ({ color }) => _selectColor(color)

	const _onInputAdd = ({ color }) => _addColor(color)

	const _onDelete = (index) => _removeColor(index)

	const _onToolSelect = (args) => {
		const tool = args?.tool ?? args
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

<div class="palette {className}" role="main">
	<section class="palette__content" class:palette__content--compact={_isCompact} style="--num-columns: {_numColumns}">
		{#if !_isCompact}
			{@render header?.({ selectedColor })}
		{/if}
		{#if !!_colors}
			<ul class="palette__cells">
				{#if before_slot}
					{@render before_slot({ selectedColor, transition, isCompact: _isCompact })}
				{/if}
				{#if showTransparentSlot}
					<li data-testid="__palette-cell__" class="palette__cells__cell">
						{#if transparent_slot}
							{@render transparent_slot()}
						{:else}
							<PaletteSlot
								aria-label="Transparent slot"
								selected={selectedColor === null}
								onselect={_onSlotSelect}
							/>
						{/if}
					</li>
				{/if}
				{#each _colors as color, index (`${color.value}_${index}`)}
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
						{#if colorSlot}
							{@render colorSlot({
								color: color.value,
								colorName: color.name,
								selectedColor,
								transition,
								isCompact: _isCompact,
								index,
							})}
						{:else}
							<PaletteSlot
								color={color.value}
								selected={color === selectedColor}
								{transition}
								onselect={_onSlotSelect}
							/>
						{/if}
					</li>
				{/each}
				{#if after_slot}
					{@render after_slot({ selectedColor, transition, isCompact: _isCompact })}
				{/if}
			</ul>
		{:else if loader}
			{@render loader()}
		{:else}
			<PaletteLoader />
		{/if}
		{#if !_isCompact}
			{@render footer?.({ selectedColor })}
		{/if}
		{#if _isCompact}
			<PaletteCompactToggleButton isCompact={true} onclick={_onExpand} />
		{/if}
	</section>
	{#if !_isCompact && showInput}
		{#if input}
			{@render input({ selectedColor, inputType })}
		{:else}
			<PaletteInput color={selectedColor} {inputType} onadd={_onInputAdd} />
		{/if}
	{/if}
	{#if !_isCompact && !!_tools?.length}
		{#if tools}
			{@render tools({ compactColorIndices, isCompact: _isCompact, onSelect: _onToolSelect })}
		{:else}
			<PaletteTools tools={_tools} onselect={_onToolSelect} />
		{/if}
	{/if}
</div>
{#if settings}
	<PaletteSettingsPanel isVisible={_isSettingsOn}>
		{@render settings({ onClose: _onSettingsClose })}
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
		row-gap: 0.6rem;
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
