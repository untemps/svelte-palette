<script lang="ts">
	import Palette from '../Palette.svelte'

	import type { ColorsProp } from '../../types'

	let {
		initialColors,
		initialIsCompact = false,
		initialCompactColorIndices = [],
		initialAllowDuplicates = false,
		initialMaxColors = 30,
		initialShowTransparentSlot = false,
		initialNumColumns = 5,
	}: {
		initialColors: ColorsProp
		initialIsCompact?: boolean
		initialCompactColorIndices?: number[]
		initialAllowDuplicates?: boolean
		initialMaxColors?: number
		initialShowTransparentSlot?: boolean
		initialNumColumns?: number
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
/>
