<script lang="ts">
	import { untrack } from 'svelte'
	import type { Snippet } from 'svelte'

	import { calculateColorGroups, calculateColors, calculateNumColumns, isColorGroups } from '../utils/utils'

	import { NONE } from '../enums/PaletteDeletionMode'
	import type { PaletteDeletionMode } from '../enums/PaletteDeletionMode'
	import { COMPACT, SETTINGS } from '$lib/enums/PaletteTool'
	import type { PaletteTool } from '$lib/enums/PaletteTool'

	import type { ColorItem, ColorsInput, NormalizedColorGroup, TransitionConfig } from '../types'

	import PaletteInput from './PaletteInput.svelte'
	import PaletteSlot from './PaletteSlot.svelte'
	import PaletteTrashButton from './PaletteTrashButton.svelte'
	import PaletteLoader from './PaletteLoader.svelte'
	import PaletteTools from './PaletteTools.svelte'
	import PaletteSettingsPanel from './PaletteSettingsPanel.svelte'
	import PaletteCompactToggleButton from './PaletteCompactToggleButton.svelte'

	import useDeletion from './useDeletion'

	type SlotSnippetProps = {
		color: string
		colorName?: string
		groupName?: string
		selectedColor: string | null
		transition: TransitionConfig | null
		isCompact: boolean
		index: number
	}

	type ToolSelectArg = { tool: PaletteTool } | PaletteTool

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
		maxColumns = 0,
		transition = null,
		onselect = undefined,
		class: className = '',
		header = undefined,
		beforeSlot = undefined,
		transparentSlot = undefined,
		slot: colorSlot = undefined,
		afterSlot = undefined,
		loader = undefined,
		footer = undefined,
		input = undefined,
		tools = undefined,
		settings = undefined,
	}: {
		colors?: ColorsInput | Promise<ColorsInput> | null
		selectedColor?: string | null
		isCompact?: boolean
		compactColorIndices?: number[]
		allowDuplicates?: boolean
		deletionMode?: PaletteDeletionMode
		tooltipClassName?: string | null
		tooltipContentSelector?: string | null
		showTransparentSlot?: boolean
		maxColors?: number
		showInput?: boolean
		inputType?: string
		numColumns?: number
		maxColumns?: number
		transition?: TransitionConfig | null
		onselect?: (event: { color: string | null }) => void
		class?: string
		header?: Snippet<[{ selectedColor: string | null }]>
		beforeSlot?: Snippet<
			[{ selectedColor: string | null; transition: TransitionConfig | null; isCompact: boolean }]
		>
		transparentSlot?: Snippet
		slot?: Snippet<[SlotSnippetProps]>
		afterSlot?: Snippet<[{ selectedColor: string | null; transition: TransitionConfig | null; isCompact: boolean }]>
		loader?: Snippet
		footer?: Snippet<[{ selectedColor: string | null }]>
		input?: Snippet<[{ selectedColor: string | null; inputType: string }]>
		tools?: Snippet<
			[{ compactColorIndices: number[]; isCompact: boolean; onSelect: (args: ToolSelectArg) => void }]
		>
		settings?: Snippet<[{ onClose: () => void }]>
	} = $props()

	let _colors = $state<ColorItem[] | null>(null)
	let _colorGroups = $state<NormalizedColorGroup[] | null>(null)
	let _numColumns = $state(untrack(() => numColumns))
	let _isSettingsOn = $state(false)
	let _isCompact = $state(untrack(() => isCompact))

	$effect(() => {
		_isCompact = isCompact
	})

	$effect(() => {
		if (numColumns > 0) {
			_numColumns = numColumns
		}
	})

	$effect(() => {
		const _numCols = numColumns
		const _maxCols = maxColumns
		Promise.resolve(colors).then((results) => {
			if (!!results) {
				if (isColorGroups(results)) {
					const newColorGroups = calculateColorGroups(results, {
						allowDuplicates,
						maxColors,
					})
					_colorGroups = newColorGroups
					_colors = null
					const maxGroupLength = newColorGroups.reduce((max, g) => Math.max(max, g.colors.length), 0)
					_numColumns = calculateNumColumns(maxGroupLength, { numColumns: _numCols })
				} else {
					const newColors = calculateColors(results, {
						isCompact: _isCompact,
						compactColorIndices,
						allowDuplicates,
						maxColors,
					})
					_colors = newColors
					_colorGroups = null
					_numColumns = calculateNumColumns(newColors.length, {
						isCompact: _isCompact,
						compactColorIndices,
						showTransparentSlot,
						numColumns: _numCols,
						maxColumns: _maxCols,
					})
				}
			}
		})
	})

	let _tools = $derived<PaletteTool[]>([
		...(_colorGroups == null && compactColorIndices?.length ? [COMPACT] : []),
		...(settings ? [SETTINGS] : []),
	])

	const _selectColor = (color: string | null) => {
		selectedColor = color
		onselect?.({ color })
	}

	const _addColor = (color: string) => {
		_colors = calculateColors([...(_colors ?? []), color], {
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
			maxColumns,
		})
	}

	const _removeColor = (index: number) => (_colors = (_colors ?? []).filter((_, i) => i !== index))

	const _removeGroupColor = (groupIndex: number, colorIndex: number) => {
		_colorGroups = (_colorGroups ?? []).map((group, gi) =>
			gi === groupIndex ? { ...group, colors: group.colors.filter((_, ci) => ci !== colorIndex) } : group
		)
	}

	const _onSlotSelect = ({ color }: { color: string | null }) => _selectColor(color)

	const _onInputAdd = ({ color }: { color: string }) => _addColor(color)

	const _onDelete = (index: number) => _removeColor(index)

	const _onToolSelect = (args: ToolSelectArg) => {
		const tool = (args as { tool: PaletteTool })?.tool ?? (args as PaletteTool)
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
		{#if !!_colorGroups}
			<div class="palette__groups">
				{#each _colorGroups as group, groupIndex}
					<div class="palette__groups__group" data-testid="__palette-group__">
						{#if group.name}
							<p class="palette__groups__group__name" data-testid="__palette-group-name__">
								{group.name}
							</p>
						{/if}
						<ul class="palette__cells">
							{#each group.colors as color, colorIndex (`${color.value}_${colorIndex}`)}
								<li
									data-testid="__palette-cell__"
									class="palette__cells__cell"
									use:useDeletion={{
										deletionMode,
										onDelete: () => _removeGroupColor(groupIndex, colorIndex),
										tooltipContentSelector,
										tooltipClassName,
									}}
								>
									{#if colorSlot}
										{@render colorSlot({
											color: color.value,
											colorName: color.name,
											groupName: group.name,
											selectedColor,
											transition,
											isCompact: false,
											index: colorIndex,
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
						</ul>
					</div>
				{/each}
			</div>
		{:else if !!_colors}
			<ul class="palette__cells">
				{#if beforeSlot}
					{@render beforeSlot({ selectedColor, transition, isCompact: _isCompact })}
				{/if}
				{#if showTransparentSlot}
					<li data-testid="__palette-cell__" class="palette__cells__cell">
						{#if transparentSlot}
							{@render transparentSlot()}
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
				{#if afterSlot}
					{@render afterSlot({ selectedColor, transition, isCompact: _isCompact })}
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

	.palette__groups {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.palette__groups__group {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.palette__groups__group__name {
		font-size: 0.75rem;
		font-weight: 600;
		margin: 0;
	}
</style>
