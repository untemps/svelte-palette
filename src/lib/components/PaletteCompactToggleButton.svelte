<script>
	import { COMPACT, ENLARGE } from '../enums/PaletteIcon'
	import PaletteIconButton from './PaletteIconButton.svelte'

	let { isCompact = false, onclick = undefined, ...restProps } = $props()
</script>

<PaletteIconButton
	data-testid="__palette-compact-toggle-button__"
	aria-label={isCompact ? 'Enlarge the palette' : 'Compact the palette'}
	{...restProps}
	icon={isCompact ? ENLARGE : COMPACT}
	{onclick}
/>
