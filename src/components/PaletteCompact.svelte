<script>
	import { createEventDispatcher } from 'svelte'

	import { CLICK } from '../enums/PaletteEvent'
	import { COMPACT, ENLARGE } from '../enums/PaletteIcon'
	
	import IconButton from './IconButton.svelte'

	export let isCompact = false
	export let ariaLabel = 'Compact the palette'

	const dispatch = createEventDispatcher()

	const _onClick = () => dispatch(CLICK, { isCompact })
</script>

<IconButton
	data-testid="__palette-compact__"
	icon={isCompact ? ENLARGE : COMPACT}
	aria-label={ariaLabel}
	on:click={_onClick} />
