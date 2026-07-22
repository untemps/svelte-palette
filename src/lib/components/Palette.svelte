<script lang="ts">
	import { tick, untrack } from 'svelte'

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
		PaletteAddEventArgs,
		PaletteDeleteEventArgs,
		PaletteToolName,
		SelectEventArgs,
		SettingsSnippetProps,
		SlotSnippetProps,
		ToolSelectEventArgs,
		ToolsSnippetProps,
		Transition,
		TransparentSlotSnippetProps,
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
		/** Called once a color has been added to the list through the input. */
		onadd?: (args: PaletteAddEventArgs) => void
		/** Called once a color has been removed from the list through the deletion gesture. */
		ondelete?: (args: PaletteDeleteEventArgs) => void
		/** Accessible name announced for the color slot listbox. */
		label?: string
		/**
		 * Renders the slot grid as a purely visual display instead of a listbox:
		 * drops the `listbox`/`option` roles, the roving tab stop and the arrow-key
		 * navigation. Use it for decorative palettes that are not meant to be picked from.
		 */
		presentational?: boolean
		/** Class name applied to the root element. */
		class?: string
		/**
		 * Color of the focus outline on color slots, including custom `slot`/`transparentSlot` snippets
		 * (applied through a `--focusColor` CSS variable set on the palette root, which those snippets
		 * inherit and also receive as a `focusColor` argument). Defaults to `blue`; can also be set
		 * through the `--focusColor` CSS variable directly.
		 */
		focusColor?: string
		/** Replaces the header. */
		header?: Snippet<[HeaderSnippetProps]>
		/** Rendered before the color slots. */
		beforeSlot?: Snippet<[EdgeSlotSnippetProps]>
		/** Replaces the transparent slot. */
		transparentSlot?: Snippet<[TransparentSlotSnippetProps]>
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
		colors = $bindable(null),
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
		onadd = undefined,
		ondelete = undefined,
		label = 'Color slots',
		presentational = false,
		class: className = '',
		focusColor = undefined,
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

	let _colors = $state<NormalizedColor[] | null>(null)
	let _colorGroups = $state<NormalizedColorGroup[] | null>(null)
	let _numColumns = $state(untrack(() => numColumns))
	let _isSettingsOn = $state(false)
	let _isCompact = $state(untrack(() => isCompact))
	let _listboxEl = $state<HTMLElement | null>(null)
	let _focusedIndex = $state<number | null>(null)
	/**
	 * One-shot guard set by the write-back helpers (`_syncColors`/`_syncColorGroups`) so the resolver
	 * `$effect` skips the component's own mutation of the bound `colors` instead of re-normalizing it.
	 * It is consumed (reset to `false`) on the next effect run. Being one-shot, reassigning `colors`
	 * synchronously from within `onadd`/`ondelete` is dropped until the next external change.
	 */
	let _skipColorsSync = $state(false)

	$effect(() => {
		_isCompact = isCompact
	})

	$effect(() => {
		if (numColumns > 0) {
			_numColumns = numColumns
		}
	})

	$effect(() => {
		const _source = colors
		const _numCols = numColumns
		const _maxCols = maxColumns
		if (untrack(() => _skipColorsSync)) {
			_skipColorsSync = false
			return
		}
		Promise.resolve(_source).then((results) => {
			if (!!results) {
				_focusedIndex = null
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

	const _optionCount = $derived(
		_colorGroups
			? _colorGroups.reduce((sum, group) => sum + group.colors.length, 0)
			: _colors
				? _colors.length + (showTransparentSlot ? 1 : 0)
				: 0
	)

	const _groupOffsets = $derived.by(() => {
		const offsets: number[] = []
		let base = 0
		for (const group of _colorGroups ?? []) {
			offsets.push(base)
			base += group.colors.length
		}
		return offsets
	})

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

	const _activeIndex = $derived.by(() => {
		const preferred = _focusedIndex ?? (_selectedIndex >= 0 ? _selectedIndex : 0)
		return Math.min(Math.max(preferred, 0), Math.max(_optionCount - 1, 0))
	})

	const _rovingTabindex = (optionIndex: number): number =>
		presentational ? -1 : optionIndex === _activeIndex ? 0 : -1

	const _optionRole = $derived(presentational ? undefined : 'option')

	// Announce the keyboard deletion affordance on deletable options. Absent when deletion is off
	// or the grid is presentational (no keydown handler), and never set on the transparent slot,
	// which is not a deletable color. Mirrors the `Delete`/`Backspace` handling in `_deleteOption`.
	const _deleteShortcut = $derived(!presentational && deletionMode !== NONE ? 'Delete Backspace' : undefined)

	const _selectColor = (color: ColorValue | null) => {
		selectedColor = color
		onselect?.({ color })
	}

	const _syncColors = (nextColors: NormalizedColor[]) => {
		_skipColorsSync = true
		colors = nextColors
	}

	const _syncColorGroups = (nextGroups: NormalizedColorGroup[]) => {
		_skipColorsSync = true
		colors = nextGroups
	}

	const _addColor = (color: ColorValue) => {
		if (_colorGroups != null || _isCompact) {
			return
		}
		const previousLength = (_colors ?? []).length
		const nextColors = calculateColors([...(_colors ?? []), color], {
			isCompact: _isCompact,
			compactColorIndices,
			allowDuplicates,
			maxColors,
		})
		_colors = nextColors
		_numColumns = calculateNumColumns(nextColors.length, {
			isCompact: _isCompact,
			compactColorIndices,
			showTransparentSlot,
			numColumns,
			maxColumns,
		})
		if (nextColors.length > previousLength) {
			_syncColors(nextColors)
			onadd?.({ color, colors: nextColors })
		}
	}

	const _removeColor = (index: number) => {
		const removed = (_colors ?? [])[index]
		const nextColors = (_colors ?? []).filter((c, i) => i !== index)
		_colors = nextColors
		if (!_isCompact && removed) {
			_syncColors(nextColors)
			ondelete?.({ color: removed.value, index, colors: nextColors })
		}
	}

	const _removeGroupColor = (groupIndex: number, colorIndex: number) => {
		const group = (_colorGroups ?? [])[groupIndex]
		const removed = group?.colors[colorIndex]
		const nextGroups = (_colorGroups ?? []).map((g, gi) =>
			gi === groupIndex ? { ...g, colors: g.colors.filter((_, ci) => ci !== colorIndex) } : g
		)
		_colorGroups = nextGroups
		_syncColorGroups(nextGroups)
		if (removed) {
			ondelete?.({
				color: removed.value,
				index: colorIndex,
				colors: nextGroups,
				groupIndex,
				...(group?.name != null && { groupName: group.name }),
			})
		}
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

	// Cache the resolved option elements so arrow-key navigation does not re-query the DOM
	// on every keystroke. The cache is dropped whenever the rendered option set can change.
	let _cachedOptions: HTMLElement[] | null = null

	$effect(() => {
		// Track the state that drives which slots are rendered so the cache is invalidated.
		// `selectedColor` is included because a custom `slot` may swap its focusable node
		// when it becomes selected, which would otherwise leave detached nodes cached.
		void _colors
		void _colorGroups
		void showTransparentSlot
		void presentational
		void _isCompact
		void selectedColor
		_cachedOptions = null
	})

	const _getOptions = (): HTMLElement[] => {
		if (_cachedOptions) {
			return _cachedOptions
		}
		if (!_listboxEl) {
			return []
		}
		_cachedOptions = [..._listboxEl.querySelectorAll<HTMLElement>('.palette__cells__cell')]
			.map(
				(cell) =>
					cell.querySelector<HTMLElement>('[role="option"]:not([disabled])') ??
					cell.querySelector<HTMLElement>('[tabindex]:not([disabled])')
			)
			.filter((el): el is HTMLElement => el != null)
		return _cachedOptions
	}

	const _rowStep = (options: HTMLElement[], from: number, dir: number): number => {
		if (!_colorGroups) {
			const target = from + dir * _numColumns
			return target >= 0 && target < options.length ? target : from
		}
		const rows: number[][] = []
		let lastRow: Element | null = null
		options.forEach((option, index) => {
			const row = option.closest('.palette__cells')
			if (row !== lastRow) {
				rows.push([])
				lastRow = row
			}
			rows[rows.length - 1].push(index)
		})
		const rowIndex = rows.findIndex((row) => row.includes(from))
		const targetRow = rows[rowIndex + dir]
		if (rowIndex < 0 || !targetRow) {
			return from
		}
		const column = rows[rowIndex].indexOf(from)
		return targetRow[Math.min(column, targetRow.length - 1)]
	}

	// Delete the color under the focused option, the keyboard counterpart of the pointer-only
	// tooltip/drop deletion affordances. Focus stays on the neighbour that shifts into place.
	const _deleteOption = async (from: number) => {
		if (deletionMode === NONE) {
			return
		}
		if (_colorGroups) {
			let groupIndex = -1
			for (let i = 0; i < _groupOffsets.length; i++) {
				if (from >= _groupOffsets[i]) {
					groupIndex = i
				} else {
					break
				}
			}
			if (groupIndex < 0) {
				return
			}
			_removeGroupColor(groupIndex, from - _groupOffsets[groupIndex])
		} else {
			const colorIndex = from - (showTransparentSlot ? 1 : 0)
			if (colorIndex < 0) {
				// The leading transparent slot clears the selection; it is not a deletable color.
				return
			}
			_onDelete(colorIndex)
		}
		// The option set has been replaced; drop the cache and move focus to the neighbour.
		await tick()
		_cachedOptions = null
		const options = _getOptions()
		if (options.length === 0) {
			// Nothing left to focus: keep focus on the listbox container rather than
			// letting it fall back to <body> now that the deleted option is gone.
			_focusedIndex = null
			_listboxEl?.focus()
			return
		}
		const next = Math.min(from, options.length - 1)
		_focusedIndex = next
		options[next]?.focus()
	}

	const _onListboxKeydown = (e: KeyboardEvent) => {
		const options = _getOptions()
		const count = options.length
		if (count === 0) {
			return
		}
		const current = options.indexOf(document.activeElement as HTMLElement)
		const from = current >= 0 ? current : Math.min(_activeIndex, count - 1)
		if (e.key === 'Delete' || e.key === 'Backspace') {
			if (deletionMode === NONE || current < 0) {
				return
			}
			e.preventDefault()
			_deleteOption(current)
			return
		}
		let next: number
		switch (e.key) {
			case 'ArrowRight':
				next = Math.min(from + 1, count - 1)
				break
			case 'ArrowLeft':
				next = Math.max(from - 1, 0)
				break
			case 'ArrowDown':
				next = _rowStep(options, from, 1)
				break
			case 'ArrowUp':
				next = _rowStep(options, from, -1)
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

<div class="palette {className}" data-testid="__palette__" data-palette style:--focusColor={focusColor}>
	<section class="palette__content" class:palette__content--compact={_isCompact} style="--num-columns: {_numColumns}">
		{#if !_isCompact}
			{@render header?.({ selectedColor })}
		{/if}
		{#if !!_colorGroups}
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<div
				bind:this={_listboxEl}
				class="palette__groups"
				role={presentational ? undefined : 'listbox'}
				aria-label={presentational ? undefined : label}
				tabindex={-1}
				onkeydown={presentational ? undefined : _onListboxKeydown}
				onfocusin={presentational ? undefined : _onListboxFocusin}
			>
				{#each _colorGroups as group, groupIndex}
					<div class="palette__groups__group" role="presentation" data-testid="__palette-group__">
						{#if group.name}
							<p
								class="palette__groups__group__name"
								aria-hidden={presentational ? undefined : 'true'}
								data-testid="__palette-group-name__"
							>
								{group.name}
							</p>
						{/if}
						<ul
							class="palette__cells"
							role={presentational ? 'presentation' : 'group'}
							aria-label={presentational ? undefined : group.name || undefined}
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
											selected: optionIndex === _selectedIndex,
											transition,
											isCompact: false,
											index: colorIndex,
											tabindex: _rovingTabindex(optionIndex),
											focusColor,
											ariaKeyShortcuts: _deleteShortcut,
										})}
									{:else}
										<PaletteSlot
											color={color.value}
											role={_optionRole}
											selected={optionIndex === _selectedIndex}
											tabindex={_rovingTabindex(optionIndex)}
											aria-keyshortcuts={_deleteShortcut}
											{transition}
											{focusColor}
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
			<div class="palette__cells">
				{#if beforeSlot}
					{@render beforeSlot({ selectedColor, transition, isCompact: _isCompact })}
				{/if}
				<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
				<ul
					bind:this={_listboxEl}
					class="palette__listbox"
					role={presentational ? 'presentation' : 'listbox'}
					aria-label={presentational ? undefined : label}
					tabindex={-1}
					onkeydown={presentational ? undefined : _onListboxKeydown}
					onfocusin={presentational ? undefined : _onListboxFocusin}
				>
					{#if showTransparentSlot}
						<li data-testid="__palette-cell__" class="palette__cells__cell" role="presentation">
							{#if transparentSlot}
								{@render transparentSlot({
									tabindex: _rovingTabindex(0),
									selected: selectedColor === null,
									focusColor,
								})}
							{:else}
								<PaletteSlot
									aria-label="Transparent slot"
									role={_optionRole}
									selected={selectedColor === null}
									tabindex={_rovingTabindex(0)}
									{focusColor}
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
									selected: optionIndex === _selectedIndex,
									transition,
									isCompact: _isCompact,
									index,
									tabindex: _rovingTabindex(optionIndex),
									focusColor,
									ariaKeyShortcuts: _deleteShortcut,
								})}
							{:else}
								<PaletteSlot
									color={color.value}
									role={_optionRole}
									selected={optionIndex === _selectedIndex}
									tabindex={_rovingTabindex(optionIndex)}
									aria-keyshortcuts={_deleteShortcut}
									{transition}
									{focusColor}
									onselect={_onSlotSelect}
								/>
							{/if}
						</li>
					{/each}
				</ul>
				{#if afterSlot}
					{@render afterSlot({ selectedColor, transition, isCompact: _isCompact })}
				{/if}
			</div>
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
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.6rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.palette__content > .palette__cells > .palette__listbox {
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

	.palette__content > .palette__cells .palette__cells__cell {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.palette__cells__cell:focus,
	.palette__listbox:focus,
	.palette__groups:focus {
		outline: none;
	}

	.palette__content.palette__content--compact > .palette__cells > .palette__listbox {
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
