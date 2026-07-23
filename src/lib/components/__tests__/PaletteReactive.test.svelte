<script lang="ts">
	import Palette from '../Palette.svelte'

	import { NONE } from '../../enums/PaletteDeletionMode'

	import type { ColorsProp, DeleteEventArgs, DeletionMode } from '../../types'

	let {
		initialColors,
		initialIsCompact = false,
		initialCompactColorIndices = [],
		initialAllowDuplicates = false,
		initialMaxColors = 30,
		initialShowTransparentSlot = false,
		initialNumColumns = 5,
		deletionMode = NONE,
		ondelete = undefined,
	}: {
		initialColors: ColorsProp
		initialIsCompact?: boolean
		initialCompactColorIndices?: number[]
		initialAllowDuplicates?: boolean
		initialMaxColors?: number
		initialShowTransparentSlot?: boolean
		initialNumColumns?: number
		deletionMode?: DeletionMode
		ondelete?: (args: DeleteEventArgs) => void
	} = $props()

	let colors = $state<ColorsProp | null>(initialColors)
	let isCompact = $state<boolean>(initialIsCompact)
	let compactColorIndices = $state<number[]>(initialCompactColorIndices)
	let allowDuplicates = $state<boolean>(initialAllowDuplicates)
	let maxColors = $state<number>(initialMaxColors)
	let showTransparentSlot = $state<boolean>(initialShowTransparentSlot)
	let numColumns = $state<number>(initialNumColumns)

	export const setIsCompact = (value: boolean) => (isCompact = value)
	export const setCompactColorIndices = (value: number[]) => (compactColorIndices = value)
	export const appendCompactColorIndex = (value: number) => {
		compactColorIndices.push(value)
	}
	export const setAllowDuplicates = (value: boolean) => (allowDuplicates = value)
	export const setMaxColors = (value: number) => (maxColors = value)
	export const setShowTransparentSlot = (value: boolean) => (showTransparentSlot = value)
</script>

<Palette
	bind:colors
	{isCompact}
	{compactColorIndices}
	{allowDuplicates}
	{maxColors}
	{showTransparentSlot}
	{numColumns}
	{deletionMode}
	{ondelete}
/>
