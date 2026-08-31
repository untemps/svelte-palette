<script lang="ts">
	import { tick, untrack } from 'svelte'

	import {
		calculateColorGroups,
		calculateColors,
		calculateNumColumns,
		isColorGroups,
		isSameColor,
		normalizeInputType,
		pickColors,
		transformColors,
	} from '../utils/utils.js'

	import { NONE } from '../enums/PaletteDeletionMode'
	import { COMPACT, SETTINGS } from '$lib/enums/PaletteTool.js'

	import PaletteInput from './PaletteInput.svelte'
	import PaletteSlot from './PaletteSlot.svelte'
	import PaletteTrashButton from './PaletteTrashButton.svelte'
	import PaletteLoader from './PaletteLoader.svelte'
	import PaletteError from './PaletteError.svelte'
	import PaletteTools from './PaletteTools.svelte'
	import PaletteSettingsPanel from './PaletteSettingsPanel.svelte'
	import PaletteCompactToggleButton from './PaletteCompactToggleButton.svelte'

	import useDeletion from './useDeletion'

	import { DEFAULT_LABELS } from '../labels'

	import type { Snippet } from 'svelte'

	import type { HTMLAttributes } from 'svelte/elements'

	import type { NormalizedColor, NormalizedColorGroup, PickedColor } from '../utils/utils.js'

	import type {
		AddEventArgs,
		ColorValue,
		ColorsProp,
		DeleteEventArgs,
		DeletionMode,
		EdgeSlotSnippetProps,
		ErrorEventArgs,
		ErrorSnippetProps,
		HeaderSnippetProps,
		InputAddEventArgs,
		InputSnippetProps,
		InputType,
		PaletteLabels,
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
		colors?: ColorsProp | null
		selectedColor?: ColorValue | null
		isCompact?: boolean
		compactColorIndices?: number[]
		allowDuplicates?: boolean
		deletionMode?: DeletionMode
		tooltipClassName?: string | null
		tooltipContentSelector?: string | null
		showTransparentSlot?: boolean
		maxColors?: number
		showInput?: boolean
		inputType?: InputType
		numColumns?: number
		maxColumns?: number
		transition?: Transition | null
		onselect?: (args: SelectEventArgs) => void
		onadd?: (args: AddEventArgs) => void
		ondelete?: (args: DeleteEventArgs) => void
		onerror?: (args: ErrorEventArgs) => void
		labels?: Partial<PaletteLabels>
		presentational?: boolean
		class?: string
		header?: Snippet<[HeaderSnippetProps]>
		beforeSlot?: Snippet<[EdgeSlotSnippetProps]>
		transparentSlot?: Snippet<[TransparentSlotSnippetProps]>
		slot?: Snippet<[SlotSnippetProps]>
		afterSlot?: Snippet<[EdgeSlotSnippetProps]>
		loader?: Snippet
		error?: Snippet<[ErrorSnippetProps]>
		footer?: Snippet<[HeaderSnippetProps]>
		input?: Snippet<[InputSnippetProps]>
		tools?: Snippet<[ToolsSnippetProps]>
		settings?: Snippet<[SettingsSnippetProps]>
	}

	let {
		colors = $bindable(null),
		selectedColor = $bindable(null),
		isCompact = false,
		compactColorIndices = $bindable([]),
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
		onerror = undefined,
		labels = undefined,
		presentational = false,
		class: className = '',
		header = undefined,
		beforeSlot = undefined,
		transparentSlot = undefined,
		slot: colorSlot = undefined,
		afterSlot = undefined,
		loader = undefined,
		error = undefined,
		footer = undefined,
		input = undefined,
		tools = undefined,
		settings = undefined,
		...restProps
	}: Props & Omit<HTMLAttributes<HTMLDivElement>, keyof Props> = $props()

	const _paletteId = $props.id()

	let _colors = $state<NormalizedColor[] | null>(null)
	let _fullColors = $state<NormalizedColor[] | null>(null)
	let _colorGroups = $state<NormalizedColorGroup[] | null>(null)
	let _fullColorGroups = $state<NormalizedColorGroup[] | null>(null)
	let _error = $state<unknown>(null)
	let _hasError = $state(false)
	let _numColumns = $state(untrack(() => numColumns))
	let _isSettingsOn = $state(false)
	let _isCompact = $state(untrack(() => isCompact))
	let _listboxEl = $state<HTMLElement | null>(null)
	let _focusedIndex = $state<number | null>(null)
	let _skipColorsSync = $state(false)
	let _syncedViewParams: ReturnType<typeof _viewParams> | null = null
	let _colorsGeneration = 0
	let _colorsSource: ColorsProp | null = null

	let _inputType = $derived(normalizeInputType(inputType))

	const _labels = $derived<PaletteLabels>({ ...DEFAULT_LABELS, ...labels })

	const _viewParams = () => ({
		isCompact: _isCompact,
		compactColorIndices: [...(compactColorIndices ?? [])],
		allowDuplicates,
		maxColors,
		showTransparentSlot,
		numColumns,
		maxColumns,
	})

	const _sameViewParams = (a: ReturnType<typeof _viewParams> | null, b: ReturnType<typeof _viewParams>): boolean =>
		a != null &&
		a.isCompact === b.isCompact &&
		a.allowDuplicates === b.allowDuplicates &&
		a.maxColors === b.maxColors &&
		a.showTransparentSlot === b.showTransparentSlot &&
		a.numColumns === b.numColumns &&
		a.maxColumns === b.maxColumns &&
		a.compactColorIndices.length === b.compactColorIndices.length &&
		a.compactColorIndices.every((index, i) => index === b.compactColorIndices[i])

	const _groupNumColumns = (
		groups: NormalizedColorGroup[],
		params: Pick<ReturnType<typeof _viewParams>, 'numColumns' | 'maxColumns'>
	): number =>
		calculateNumColumns(
			groups.reduce((max, group) => Math.max(max, group.colors.length), 0),
			{ showTransparentSlot: false, numColumns: params.numColumns, maxColumns: params.maxColumns }
		)

	const _compactNumColumns = (
		count: number,
		params: Pick<ReturnType<typeof _viewParams>, 'compactColorIndices' | 'showTransparentSlot'>
	): number =>
		calculateNumColumns(count, {
			isCompact: true,
			compactColorIndices: params.compactColorIndices,
			showTransparentSlot: params.showTransparentSlot,
		})

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
		const _params = _viewParams()
		const generation = ++_colorsGeneration
		const _sourceChanged = _source !== _colorsSource
		_colorsSource = _source
		if (untrack(() => _skipColorsSync)) {
			_skipColorsSync = false
			if (_sameViewParams(_syncedViewParams, _params)) {
				return
			}
		}
		if (_sourceChanged) {
			_hasError = false
			_error = null
		}
		Promise.resolve(_source).then(
			(results) => {
				if (generation !== _colorsGeneration) {
					return
				}
				if (!!results) {
					_hasError = false
					_error = null
					_focusedIndex = null
					if (isColorGroups(results)) {
						const newColorGroups = calculateColorGroups(results, {
							allowDuplicates: _params.allowDuplicates,
							maxColors: _params.maxColors,
						})
						_colorGroups = newColorGroups
						_fullColorGroups = calculateColorGroups(results, { allowDuplicates: true })
						_colors = null
						_fullColors = null
						_numColumns = _groupNumColumns(newColorGroups, _params)
					} else {
						const newColors = calculateColors(results, _params)
						_colors = newColors
						_colorGroups = null
						_fullColorGroups = null
						_fullColors = transformColors(Array.isArray(results) ? results : [])
						_numColumns = _params.isCompact
							? _compactNumColumns(newColors.length, _params)
							: calculateNumColumns(newColors.length, _params)
					}
				}
			},
			(reason) => {
				if (generation !== _colorsGeneration) {
					return
				}
				const _wasError = _hasError
				_hasError = true
				_error = reason
				_colors = null
				_colorGroups = null
				_fullColorGroups = null
				_fullColors = null
				_focusedIndex = null
				if (!_wasError) {
					onerror?.({ error: reason })
				}
			}
		)
	})

	let _tools: PaletteToolName[] = $derived([
		...(_colors != null && compactColorIndices?.length ? [COMPACT] : []),
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
				const index = group.colors.findIndex((color) => isSameColor(color.value, selectedColor))
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
			const index = _colors.findIndex((color) => isSameColor(color.value, selectedColor))
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

	const _deleteShortcut = $derived(!presentational && deletionMode !== NONE ? 'Delete Backspace' : undefined)

	const _selectColor = (color: ColorValue | null) => {
		selectedColor = color
		onselect?.({ color })
	}

	const _syncColors = (nextColors: NormalizedColor[]) => {
		_fullColors = nextColors
		_skipColorsSync = true
		_syncedViewParams = _viewParams()
		colors = nextColors
	}

	const _syncColorGroups = (nextFullColorGroups: NormalizedColorGroup[]) => {
		_fullColorGroups = nextFullColorGroups
		_skipColorsSync = true
		_syncedViewParams = _viewParams()
		colors = nextFullColorGroups
	}

	const _addColor = (color: ColorValue) => {
		if (_colors == null || _isCompact) {
			return
		}
		const previousLength = (_colors ?? []).length
		const nextFullColors = transformColors([...(_fullColors ?? []), color])
		const nextColors = calculateColors(nextFullColors, _viewParams())
		_colors = nextColors
		_numColumns = calculateNumColumns(nextColors.length, _viewParams())
		if (nextColors.length > previousLength) {
			_syncColors(nextFullColors)
			onadd?.({ color, colors: nextFullColors })
		}
	}

	const _removeColor = (index: number) => {
		if (_isCompact) {
			_removeCompactColor(index)
			return
		}
		const rendered = (_colors ?? [])[index]
		if (!rendered) {
			return
		}
		const target = _picked()[index]
		const fullIndex =
			target && isSameColor(target.color.value, rendered.value)
				? target.index
				: (_fullColors ?? []).findIndex((color) => isSameColor(color.value, rendered.value))
		if (fullIndex < 0) {
			return
		}
		const removed = (_fullColors ?? [])[fullIndex]
		const dropped = _droppedIndices(_fullColors ?? [], fullIndex)
		const nextFullColors = _dropIndices(_fullColors ?? [], dropped)
		const nextColors = calculateColors(nextFullColors, _viewParams())
		_colors = nextColors
		_numColumns = calculateNumColumns(nextColors.length, _viewParams())
		_syncColors(nextFullColors)
		ondelete?.({ color: removed.value, index: fullIndex, colors: nextFullColors })
	}

	const _picked = (): PickedColor[] => pickColors(_fullColors ?? [], _viewParams())

	const _droppedIndices = (full: NormalizedColor[], fullIndex: number, indices?: number[]): Set<number> => {
		const removed = full[fullIndex]
		if (allowDuplicates || !removed) {
			return new Set([fullIndex])
		}
		return new Set([
			...full.reduce<number[]>(
				(dropped, color, index) =>
					(!indices || indices.includes(index)) && isSameColor(color.value, removed.value)
						? [...dropped, index]
						: dropped,
				[]
			),
			fullIndex,
		])
	}

	const _dropIndices = (full: NormalizedColor[], dropped: Set<number>): NormalizedColor[] =>
		full.filter((_, index) => !dropped.has(index))

	const _removeCompactColor = (index: number) => {
		const rendered = (_colors ?? [])[index]
		if (!rendered) {
			return
		}
		const picked = _picked()
		const target = picked[index]
		const match =
			target && isSameColor(target.color.value, rendered.value)
				? target
				: picked.find((item) => isSameColor(item.color.value, rendered.value))
		const fullIndex = match
			? match.index
			: (_fullColors ?? []).findIndex((color) => isSameColor(color.value, rendered.value))
		if (fullIndex < 0) {
			return
		}
		const removed = (_fullColors ?? [])[fullIndex]
		const dropped = _droppedIndices(_fullColors ?? [], fullIndex, compactColorIndices ?? [])
		const nextFullColors = _dropIndices(_fullColors ?? [], dropped)
		compactColorIndices = (compactColorIndices ?? [])
			.filter((n) => !dropped.has(n))
			.map((n) => n - [...dropped].filter((index) => index < n).length)
		const nextColors = calculateColors(nextFullColors, {
			isCompact: true,
			compactColorIndices,
			allowDuplicates,
			maxColors,
		})
		_colors = nextColors
		_numColumns = _compactNumColumns(nextColors.length, {
			compactColorIndices: compactColorIndices ?? [],
			showTransparentSlot,
		})
		_syncColors(nextFullColors)
		ondelete?.({ color: removed.value, index: fullIndex, colors: nextFullColors })
	}

	const _removeGroupColor = (groupIndex: number, colorIndex: number) => {
		const group = (_colorGroups ?? [])[groupIndex]
		const rendered = group?.colors[colorIndex]
		if (!rendered) {
			return
		}
		const fullGroup = (_fullColorGroups ?? [])[groupIndex]
		const target = pickColors(fullGroup?.colors ?? [], { allowDuplicates, maxColors })[colorIndex]
		const fullIndex =
			target && isSameColor(target.color.value, rendered.value)
				? target.index
				: (fullGroup?.colors ?? []).findIndex((color) => isSameColor(color.value, rendered.value))
		if (fullIndex < 0) {
			return
		}
		const removed = (fullGroup?.colors ?? [])[fullIndex]
		const dropped = _droppedIndices(fullGroup?.colors ?? [], fullIndex)
		const nextFullColorGroups = (_fullColorGroups ?? []).map((g, gi) =>
			gi === groupIndex ? { ...g, colors: _dropIndices(g.colors, dropped) } : g
		)
		const nextColorGroups = calculateColorGroups(nextFullColorGroups, { allowDuplicates, maxColors })
		_colorGroups = nextColorGroups
		_numColumns = _groupNumColumns(nextColorGroups, { numColumns, maxColumns })
		_syncColorGroups(nextFullColorGroups)
		ondelete?.({
			color: removed.value,
			index: fullIndex,
			colors: nextFullColorGroups,
			groupIndex,
			...(group?.name != null && { groupName: group.name }),
		})
	}

	const _onSlotSelect = ({ color }: SelectEventArgs) => _selectColor(color)

	const _onInputAdd = ({ color }: InputAddEventArgs) => _addColor(color)

	const _onDelete = (index: number) => _removeColor(index)

	const _toggleCompact = () => {
		if (_colors == null) {
			return
		}
		_isCompact = !_isCompact
	}

	const _onToolSelect = (args: ToolSelectEventArgs | PaletteToolName) => {
		const tool = typeof args === 'string' ? args : args.tool
		switch (tool) {
			case SETTINGS:
				_isSettingsOn = true
				break
			case COMPACT:
				_toggleCompact()
				break
		}
	}

	const _onExpand = () => _toggleCompact()

	const _onSettingsClose = () => {
		_isSettingsOn = false
	}

	type CellPosition = { container: Element | null; position: number }

	let _cachedOptions: HTMLElement[] | null = null
	let _cachedCells: CellPosition[] = []

	$effect(() => {
		void _colors
		void _colorGroups
		void showTransparentSlot
		void presentational
		void _isCompact
		void selectedColor
		_cachedOptions = null
		_cachedCells = []
	})

	const _getOptions = (): HTMLElement[] => {
		if (_cachedOptions) {
			return _cachedOptions
		}
		if (!_listboxEl) {
			return []
		}
		const options: HTMLElement[] = []
		const cells: CellPosition[] = []
		let container: Element | null = null
		let position = 0
		for (const cell of _listboxEl.querySelectorAll<HTMLElement>('.palette__cells__cell')) {
			const parent = cell.parentElement
			position = parent === container ? position + 1 : 0
			container = parent
			const option =
				cell.querySelector<HTMLElement>('[role="option"]:not([disabled])') ??
				cell.querySelector<HTMLElement>('[tabindex]:not([disabled])')
			if (option) {
				options.push(option)
				cells.push({ container, position })
			}
		}
		_cachedOptions = options
		_cachedCells = cells
		return _cachedOptions
	}

	const _rowStep = (options: HTMLElement[], from: number, dir: number): number => {
		const columns = Number.isFinite(_numColumns) ? Math.max(_numColumns, 1) : 1
		const rows: { index: number; column: number }[][] = []
		let lastContainer: Element | null = null
		let lastRow = -1
		for (let index = 0; index < options.length; index++) {
			const cell = _cachedCells[index]
			const container = cell?.container ?? null
			const position = cell?.position ?? index
			const row = Math.floor(position / columns)
			if (container !== lastContainer || row !== lastRow) {
				rows.push([])
				lastContainer = container
				lastRow = row
			}
			rows[rows.length - 1].push({ index, column: position % columns })
		}
		const rowIndex = rows.findIndex((row) => row.some((cell) => cell.index === from))
		const targetRow = rows[rowIndex + dir]
		if (rowIndex < 0 || !targetRow) {
			return from
		}
		const column = rows[rowIndex].find((cell) => cell.index === from)?.column ?? 0
		const target = targetRow.findLast((cell) => cell.column <= column) ?? targetRow[0]
		return target.index
	}

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
				return
			}
			_onDelete(colorIndex)
		}
		await tick()
		_cachedOptions = null
		const options = _getOptions()
		if (options.length === 0) {
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

<div {...restProps} data-palette-id={_paletteId} class="palette {className}" data-testid="__palette__" data-palette>
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
				aria-label={presentational ? undefined : _labels.slots}
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
									tabindex={deletionMode === NONE ? undefined : -1}
									use:useDeletion={{
										deletionMode,
										areaSelector: `[data-palette-id="${_paletteId}"]`,
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
											ariaKeyShortcuts: _deleteShortcut,
										})}
									{:else}
										<PaletteSlot
											color={color.value}
											name={color.name}
											role={_optionRole}
											selected={optionIndex === _selectedIndex}
											tabindex={_rovingTabindex(optionIndex)}
											aria-keyshortcuts={_deleteShortcut}
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
			<div class="palette__cells">
				{#if beforeSlot}
					{@render beforeSlot({ selectedColor, transition, isCompact: _isCompact })}
				{/if}
				<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
				<ul
					bind:this={_listboxEl}
					class="palette__listbox"
					role={presentational ? 'presentation' : 'listbox'}
					aria-label={presentational ? undefined : _labels.slots}
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
								})}
							{:else}
								<PaletteSlot
									aria-label={_labels.transparentSlot}
									role={_optionRole}
									selected={selectedColor === null}
									tabindex={_rovingTabindex(0)}
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
							tabindex={deletionMode === NONE ? undefined : -1}
							use:useDeletion={{
								deletionMode,
								areaSelector: `[data-palette-id="${_paletteId}"]`,
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
									ariaKeyShortcuts: _deleteShortcut,
								})}
							{:else}
								<PaletteSlot
									color={color.value}
									name={color.name}
									role={_optionRole}
									selected={optionIndex === _selectedIndex}
									tabindex={_rovingTabindex(optionIndex)}
									aria-keyshortcuts={_deleteShortcut}
									{transition}
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
		{:else if _hasError}
			{#if error}
				{@render error({ error: _error })}
			{:else}
				<PaletteError error={_error} label={_labels.error} />
			{/if}
		{:else if loader}
			{@render loader()}
		{:else}
			<PaletteLoader label={_labels.loader} />
		{/if}
		{#if !_isCompact}
			{@render footer?.({ selectedColor })}
		{/if}
		{#if _isCompact && _colors != null}
			<PaletteCompactToggleButton
				isCompact={true}
				compactLabel={_labels.compact}
				enlargeLabel={_labels.enlarge}
				onclick={_onExpand}
			/>
		{/if}
	</section>
	{#if !_isCompact && showInput && _colors != null}
		{#if input}
			{@render input({ selectedColor, inputType: _inputType })}
		{:else}
			<PaletteInput
				color={selectedColor}
				inputType={_inputType}
				colorLabel={_labels.inputColor}
				colorErrorLabel={_labels.inputColorError}
				submitLabel={_labels.submitColor}
				eyeDropperLabel={_labels.eyeDropper}
				onadd={_onInputAdd}
			/>
		{/if}
	{/if}
	{#if !_isCompact && !!_tools?.length}
		{#if tools}
			{@render tools({ compactColorIndices, isCompact: _isCompact, onSelect: _onToolSelect })}
		{:else}
			<PaletteTools
				tools={_tools}
				label={_labels.tools}
				compactLabel={_labels.compact}
				settingsLabel={_labels.settings}
				onselect={_onToolSelect}
			/>
		{/if}
	{/if}
</div>
{#if settings}
	<PaletteSettingsPanel isVisible={_isSettingsOn}>
		{@render settings({ onClose: _onSettingsClose })}
	</PaletteSettingsPanel>
{/if}

<template id="tooltip-template">
	<PaletteTrashButton deleteLabel={_labels.trash} />
</template>

<style>
	.palette,
	:global(.palette *) {
		box-sizing: border-box;
	}

	/*
	 * Token defaults, declared at zero specificity via :where() so any ordinary
	 * consumer rule — an inline style, or a class on the root — overrides them
	 * without !important and without coupling to internal BEM class names. The
	 * visual properties below stay on `.palette` and read the tokens through var().
	 * These are also the universal fallback: a browser without light-dark() support
	 * keeps them (light only) instead of breaking.
	 */
	:where(.palette) {
		--palette-surface: #fafafa;
		--palette-text: black;
		--palette-border: #e5e5e5;
		--palette-divider: #e9e9e9;
		--palette-icon: #646464;
		--palette-icon-disabled: #bdbdbd;
		--palette-loader: #ccc;
		--palette-radius: 0.3rem;
		--palette-font-family: Helvetica, sans-serif;
		--palette-grid-column-track: minmax(2rem, 1fr);
		--palette-grid-row-track: minmax(2rem, 1fr);
		--palette-grid-column-gap: 0.3rem;
		--palette-grid-row-gap: 0.6rem;
		--palette-slot-size: 1rem;
		--palette-slot-border: rgba(0, 0, 0, 0.2);
		--palette-slot-empty: #aaa;
		--palette-slot-ring: #9e9e9e;
		--palette-input-surface: rgba(255, 255, 255, 1);
		--palette-input-text: rgba(0, 0, 0, 0.6);
		--palette-error: #c0392b;
		--palette-error-message: #595959;
		--palette-focus-ring: #1a1a1a;
		--palette-tooltip-surface: black;
		--palette-tooltip-text: #fff;
	}

	.palette {
		width: 100%;
		color: var(--palette-text, black);
		display: flex;
		flex-direction: column;
		align-items: center;
		background-color: var(--palette-surface, #fafafa);
	}

	/*
	 * Dark theme. Where light-dark() is supported, every theme-varying token is
	 * declared once as light-dark(<light>, <dark>) and resolved from the
	 * `color-scheme` on the root: `light dark` follows the OS, and data-palette-theme
	 * forces one scheme. This replaces the previous pair of identical dark
	 * declaration lists (a @media block and a forced-attribute block) with a single
	 * source of truth. Browsers without light-dark() keep the light defaults above
	 * (no dark mode) rather than breaking. The focus-ring dark value stays
	 * WCAG-contrasting against the dark surface.
	 */
	@supports (color: light-dark(#000, #fff)) {
		:where(.palette) {
			--palette-surface: light-dark(#fafafa, #1e1e1e);
			--palette-text: light-dark(black, #ededed);
			--palette-border: light-dark(#e5e5e5, #3a3a3a);
			--palette-divider: light-dark(#e9e9e9, #3a3a3a);
			--palette-icon: light-dark(#646464, #d0d0d0);
			--palette-icon-disabled: light-dark(#bdbdbd, #6a6a6a);
			--palette-loader: light-dark(#ccc, #555555);
			--palette-slot-border: light-dark(rgba(0, 0, 0, 0.2), rgba(255, 255, 255, 0.2));
			--palette-slot-empty: light-dark(#aaa, #777777);
			--palette-slot-ring: light-dark(#9e9e9e, #6a6a6a);
			--palette-input-surface: light-dark(rgba(255, 255, 255, 1), #2a2a2a);
			--palette-input-text: light-dark(rgba(0, 0, 0, 0.6), rgba(255, 255, 255, 0.75));
			--palette-error: light-dark(#c0392b, #ff6b5e);
			--palette-error-message: light-dark(#595959, #b0b0b0);
			--palette-focus-ring: light-dark(#1a1a1a, #f0f0f0);
			--palette-tooltip-surface: light-dark(black, #f0f0f0);
			--palette-tooltip-text: light-dark(#fff, #1a1a1a);
		}

		.palette {
			color-scheme: light dark;
		}

		.palette[data-palette-theme='light'] {
			color-scheme: light;
		}

		.palette[data-palette-theme='dark'] {
			color-scheme: dark;
		}
	}

	/*
	 * Theme-aware deletion tooltip. The default svelte-use-tooltip bubble ships a
	 * fixed black background; because it renders inline inside the palette
	 * (portal: false), it inherits the palette tokens, so restyle it to track the
	 * theme instead of staying black on a dark surface. A custom tooltipClassName
	 * replaces the default class, opting out of these rules (the consumer owns it).
	 */
	.palette :global(.__tooltip) {
		background-color: var(--palette-tooltip-surface, black);
		color: var(--palette-tooltip-text, #fff);
	}

	.palette :global(.__tooltip:has(.trash_button__button)) {
		line-height: 0;
	}

	.palette :global(.__tooltip-top::after) {
		border-top-color: var(--palette-tooltip-surface, black);
	}

	.palette :global(.__tooltip-bottom::after) {
		border-bottom-color: var(--palette-tooltip-surface, black);
	}

	.palette :global(.__tooltip-left::after) {
		border-left-color: var(--palette-tooltip-surface, black);
	}

	.palette :global(.__tooltip-right::after) {
		border-right-color: var(--palette-tooltip-surface, black);
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
		grid-template-columns: repeat(var(--num-columns), var(--palette-grid-column-track));
		grid-auto-rows: var(--palette-grid-row-track);
		column-gap: var(--palette-grid-column-gap);
		row-gap: var(--palette-grid-row-gap);
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

	:where(.palette__groups__group > ul.palette__cells) {
		display: grid;
		grid-template-columns: repeat(var(--num-columns), var(--palette-grid-column-track));
		grid-auto-rows: var(--palette-grid-row-track);
		column-gap: var(--palette-grid-column-gap);
		row-gap: var(--palette-grid-row-gap);
		align-items: center;
		justify-items: center;
	}

	:where(.palette__groups__group) > ul.palette__cells {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	:where(.palette__groups__group > ul.palette__cells > .palette__cells__cell) {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
