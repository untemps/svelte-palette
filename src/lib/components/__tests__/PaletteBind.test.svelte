<script lang="ts">
	import Palette from '../Palette.svelte'

	import { TOOLTIP } from '../../enums/PaletteDeletionMode'

	import type { ColorsProp } from '../../types'

	let { initialColors }: { initialColors: ColorsProp } = $props()

	let colors = $state<ColorsProp | null>(initialColors)
</script>

<div data-testid="__bound-colors__">{JSON.stringify(colors)}</div>
<Palette bind:colors showInput deletionMode={TOOLTIP} />
