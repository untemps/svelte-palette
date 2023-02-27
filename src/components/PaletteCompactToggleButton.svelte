<script>
	import { createEventDispatcher } from 'svelte'

	import { CLICK } from '../enums/PaletteEvent'
	import { COMPACT, ENLARGE } from '../enums/PaletteIcon'

	import IconButton from './PaletteIconButton.svelte'

	export let isCompact = false

	const dispatch = createEventDispatcher()

	const _onClick = () => dispatch(CLICK, { isCompact })
</script>

<IconButton
	data-testid="__palette-compact-toggle-button__"
	aria-label={isCompact ? 'Enlarge the palette' : 'Compact the palette'}
	{...$$restProps}
	icon={isCompact ? ENLARGE : COMPACT}
	on:click={_onClick} />
