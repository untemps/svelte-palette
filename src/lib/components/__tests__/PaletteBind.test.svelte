<script lang="ts">
	import { untrack } from 'svelte'

	import Palette from '../Palette.svelte'

	import { TOOLTIP } from '../../enums/PaletteDeletionMode'

	import type { ColorsProp } from '../../types'

	let {
		initialColors,
		isCompact = false,
		initialCompactColorIndices = [],
		maxColors = 30,
		allowDuplicates = false,
	}: {
		initialColors: ColorsProp
		isCompact?: boolean
		initialCompactColorIndices?: number[]
		maxColors?: number
		allowDuplicates?: boolean
	} = $props()

	let colors = $state<ColorsProp | null>(untrack(() => initialColors))
	let compactColorIndices = $state<number[]>(untrack(() => initialCompactColorIndices))
</script>

<div data-testid="__bound-colors__">{JSON.stringify(colors)}</div>
<div data-testid="__bound-indices__">{JSON.stringify(compactColorIndices)}</div>
<Palette
	bind:colors
	bind:compactColorIndices
	{isCompact}
	{maxColors}
	{allowDuplicates}
	showInput
	deletionMode={TOOLTIP}
/>
