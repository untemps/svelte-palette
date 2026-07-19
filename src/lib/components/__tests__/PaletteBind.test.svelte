<script lang="ts">
	import Palette from '../Palette.svelte'

	import { TOOLTIP } from '../../enums/PaletteDeletionMode'

	import type { ColorsProp } from '../../types'

	// Test-only harness: exercises `bind:colors` so the spec can assert that internal add/delete
	// mutations propagate back to the parent-owned variable. Kept as `*.test.svelte` so it is excluded
	// from the published package.
	let { initialColors }: { initialColors: ColorsProp } = $props()

	let colors = $state<ColorsProp | null>(initialColors)
</script>

<div data-testid="__bound-colors__">{JSON.stringify(colors)}</div>
<Palette bind:colors showInput deletionMode={TOOLTIP} />
