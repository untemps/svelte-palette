<script lang="ts">
	import { untrack } from 'svelte'

	import { calculateColorGroups, calculateColors, calculateNumColumns, isColorGroups } from '../utils/utils.js'

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

	import type { Snippet } from 'svelte'

	import type { NormalizedColor, NormalizedColorGroup } from '../utils/utils.js'

	import type {
		AddEventArgs,
		ColorValue,
		ColorsProp,
		DeletionMode,
		EdgeSlotSnippetProps,
		HeaderSnippetProps,
		InputSnippetProps,
		InputType,
		PaletteToolName,
		SelectEventArgs,
		SettingsSnippetProps,
		SlotSnippetProps,
		ToolSelectEventArgs,
		ToolsSnippetProps,
		Transition,
	} from '../types'

	interface Props {
		/** Colors to display, or a promise resolving to them. Accepts color strings, color objects or color groups. */
		colors?: ColorsProp | null
		/** Selected color. Supports `bind:selectedColor`. */
		selectedColor?: ColorValue | null
		/** Whether the palette is displayed in compact mode. */
		isCompact?: boolean
		/** Indices picked from `colors` when in compact mode. */
		compactColorIndices?: number[]
		/** Whether duplicate colors are allowed. */
		allowDuplicates?: boolean
		/** Slot deletion mode. */
		deletionMode?: DeletionMode
		/** Class name applied to the deletion tooltip. */
		tooltipClassName?: string | null
		/** Selector of the deletion tooltip content. */
		tooltipContentSelector?: string | null
		/** Whether to display a transparent slot at the start of the list. */
		showTransparentSlot?: boolean
		/** Maximum number of slots. Set to `-1` for no limit. */
		maxColors?: number
		/** Whether to display the color input within the footer. */
		showInput?: boolean
		/** Type of the color input. */
		inputType?: InputType
		/** Number of grid columns. Set to `0` to display slots on a single row. */
		numColumns?: number
		/** Maximum number of columns when `numColumns` is `0`. Set to `0` for no limit. */
		maxColumns?: number
		/** Animation applied when a slot is rendered. */
		transition?: Transition | null
		/** Called whenever a color is selected. */
		onselect?: (args: SelectEventArgs) => void
		/** Accessible name announced for the color swatch listbox. */
		label?: string
		/** Class name applied to the root element. */
		class?: string
		/** Replaces the header. */
		header?: Snippet<[HeaderSnippetProps]>
		/** Rendered before the color slots. */
		beforeSlot?: Snippet<[EdgeSlotSnippetProps]>
		/** Replaces the transparent slot. */
		transparentSlot?: Snippet
		/** Replaces the default color slots. */
		slot?: Snippet<[SlotSnippetProps]>
		/** Rendered after the color slots. */
		afterSlot?: Snippet<[EdgeSlotSnippetProps]>
		/** Replaces the loader shown while colors resolve. */
		loader?: Snippet
		/** Replaces the footer. */
		footer?: Snippet<[HeaderSnippetProps]>
		/** Replaces the footer input. */
		input?: Snippet<[InputSnippetProps]>
		/** Replaces the tools panel. */
		tools?: Snippet<[ToolsSnippetProps]>
		/** Replaces the settings panel content. */
		settings?: Snippet<[SettingsSnippetProps]>
	}

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
		label = 'Color swatches',
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
	}: Props = $props()

	const _uid = $props.id()

	let _colors = $state<NormalizedColor[] | null>(null)
	let _colorGroups = $state<NormalizedColorGroup[] | null>(null)
	let _numColumns = $state(untrack(() => numColumns))
	let _isSettingsOn = $state(false)
	let _isCompact = $state(untrack(() => isCompact))
	let _listboxEl = $state<HTMLElement | null>(null)
	let _focusedIndex = $state<number | null>(null)

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

	let _tools: PaletteToolName[] = $derived([
		...(_colorGroups == null && compactColorIndices?.length ? [COMPACT] : []),
		...(settings ? [SETTINGS] : []),
	] as PaletteToolName[])

	// Number of navigable options rendered on the default slot path.
	const _optionCount = $derived(
		_colorGroups
			? _colorGroups.reduce((sum, group) => sum + group.colors.length, 0)
			: _colors
				? _colors.length + (showTransparentSlot ? 1 : 0)
				: 0
	)

	// Global option index at which each group starts, in DOM order.
	const _groupOffsets = $derived.by(() => {
		const offsets: number[] = []
		let base = 0
		for (const group of _colorGroups ?? []) {
			offsets.push(base)
			base += group.colors.length
		}
		return offsets
	})

	// Global option index of the current selection, or -1 when none matches.
	const _selectedIndex = $derived.by(() => {
		if (_colorGroups) {
			let base = 0
			for (const group of _colorGroups) {
				const index = group.colors.findIndex((color) => color.value === selectedColor)
				if (index >= 0) {
					return base + index
				}
				base += group.colors.length
			}
			return -1
		}
		if (_colors) {
			const offset = showTransparentSlot ? 1 : 0
			if (showTransparentSlot && selectedColor === null) {
				return 0
			}
			const index = _colors.findIndex((color) => color.value === selectedColor)
			return index >= 0 ? index + offset : -1
		}
		return -1
	})

	// Option that owns `tabindex="0"`: last focused, else selected, else first.
	const _activeIndex = $derived.by(() => {
		const preferred = _focusedIndex ?? (_selectedIndex >= 0 ? _selectedIndex : 0)
		return Math.min(Math.max(preferred, 0), Math.max(_optionCount - 1, 0))
	})

	const _selectColor = (color: ColorValue | null) => {
		selectedColor = color
		onselect?.({ color })
	}

	const _addColor = (color: ColorValue) => {
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

	const _removeColor = (index: number) => (_colors = (_colors ?? []).filter((c, i) => i !== index))

	const _removeGroupColor = (groupIndex: number, colorIndex: number) => {
		_colorGroups = (_colorGroups ?? []).map((group, gi) =>
			gi === groupIndex ? { ...group, colors: group.colors.filter((_, ci) => ci !== colorIndex) } : group
		)
	}

	const _onSlotSelect = ({ color }: SelectEventArgs) => _selectColor(color)

	const _onInputAdd = ({ color }: AddEventArgs) => _addColor(color)

	const _onDelete = (index: number) => _removeColor(index)

	const _onToolSelect = (args: ToolSelectEventArgs | PaletteToolName) => {
		const tool = typeof args === 'string' ? args : args.tool
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

	const _getOptions = (): HTMLElement[] =>
		_listboxEl ? [..._listboxEl.querySelectorAll<HTMLElement>('[role="option"]:not([disabled])')] : []

	const _onListboxKeydown = (e: KeyboardEvent) => {
		const options = _getOptions()
		const count = options.length
		if (count === 0) {
			return
		}
		const current = options.indexOf(document.activeElement as HTMLElement)
		const from = current >= 0 ? current : Math.min(_activeIndex, count - 1)
		let next: number
		switch (e.key) {
			case 'ArrowRight':
				next = Math.min(from + 1, count - 1)
				break
			case 'ArrowLeft':
				next = Math.max(from - 1, 0)
				break
			case 'ArrowDown':
				next = Math.min(from + _numColumns, count - 1)
				break
			case 'ArrowUp':
				next = Math.max(from - _numColumns, 0)
				break
			case 'Home':
				next = 0
				break
			case 'End':
				next = count - 1
				break
			default:
				return
		}
		e.preventDefault()
		_focusedIndex = next
		options[next]?.focus()
	}

	const _onListboxFocusin = (e: FocusEvent) => {
		const index = _getOptions().indexOf(e.target as HTMLElement)
		if (index >= 0) {
			_focusedIndex = index
		}
	}
</script>

<div class="palette {className}" data-testid="__palette__" data-palette>
	<section class="palette__content" class:palette__content--compact={_isCompact} style="--num-columns: {_numColumns}">
		{#if !_isCompact}
			{@render header?.({ selectedColor })}
		{/if}
		{#if !!_colorGroups}
			<div
				bind:this={_listboxEl}
				class="palette__groups"
				role="listbox"
				aria-label={label}
				aria-orientation="horizontal"
				tabindex={-1}
				onkeydown={_onListboxKeydown}
				onfocusin={_onListboxFocusin}
			>
				{#each _colorGroups as group, groupIndex}
					<div class="palette__groups__group" role="presentation" data-testid="__palette-group__">
						{#if group.name}
							<p
								id="{_uid}-group-{groupIndex}"
								class="palette__groups__group__name"
								data-testid="__palette-group-name__"
							>
								{group.name}
							</p>
						{/if}
						<ul
							class="palette__cells"
							role="group"
							aria-labelledby={group.name ? `${_uid}-group-${groupIndex}` : undefined}
						>
							{#each group.colors as color, colorIndex (`${color.value}_${colorIndex}`)}
								{@const optionIndex = (_groupOffsets[groupIndex] ?? 0) + colorIndex}
								<li
									data-testid="__palette-cell__"
									class="palette__cells__cell"
									role="presentation"
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
											tabindex: optionIndex === _activeIndex ? 0 : -1,
										})}
									{:else}
										<PaletteSlot
											color={color.value}
											selected={color.value === selectedColor}
											tabindex={optionIndex === _activeIndex ? 0 : -1}
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
			<ul
				bind:this={_listboxEl}
				class="palette__cells"
				role="listbox"
				aria-label={label}
				aria-orientation="horizontal"
				tabindex={-1}
				onkeydown={_onListboxKeydown}
				onfocusin={_onListboxFocusin}
			>
				{#if beforeSlot}
					{@render beforeSlot({ selectedColor, transition, isCompact: _isCompact })}
				{/if}
				{#if showTransparentSlot}
					<li data-testid="__palette-cell__" class="palette__cells__cell" role="presentation">
						{#if transparentSlot}
							{@render transparentSlot()}
						{:else}
							<PaletteSlot
								aria-label="Transparent slot"
								selected={selectedColor === null}
								tabindex={_activeIndex === 0 ? 0 : -1}
								onselect={_onSlotSelect}
							/>
						{/if}
					</li>
				{/if}
				{#each _colors as color, index (`${color.value}_${index}`)}
					{@const optionIndex = index + (showTransparentSlot ? 1 : 0)}
					<li
						data-testid="__palette-cell__"
						class="palette__cells__cell"
						role="presentation"
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
								tabindex: optionIndex === _activeIndex ? 0 : -1,
							})}
						{:else}
							<PaletteSlot
								color={color.value}
								selected={color.value === selectedColor}
								tabindex={optionIndex === _activeIndex ? 0 : -1}
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
