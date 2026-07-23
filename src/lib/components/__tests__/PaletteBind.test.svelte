<script lang="ts">
	import { untrack } from 'svelte'

	import Palette from '../Palette.svelte'

	import { TOOLTIP } from '../../enums/PaletteDeletionMode'

	import type { ColorsProp } from '../../types'

	let {
		initialColors,
		isCompact = false,
		initialCompactColorIndices = [],
	}: { initialColors: ColorsProp; isCompact?: boolean; initialCompactColorIndices?: number[] } = $props()

	let colors = $state<ColorsProp | null>(untrack(() => initialColors))
	let compactColorIndices = $state<number[]>(untrack(() => initialCompactColorIndices))
</script>

<div data-testid="__bound-colors__">{JSON.stringify(colors)}</div>
<div data-testid="__bound-indices__">{JSON.stringify(compactColorIndices)}</div>
<Palette bind:colors bind:compactColorIndices {isCompact} showInput deletionMode={TOOLTIP} />
