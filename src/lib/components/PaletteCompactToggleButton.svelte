<script>
	import { createEventDispatcher } from 'svelte'

	import { COMPACT, ENLARGE } from '../enums/PaletteIcon'

	import PaletteIconButton from './PaletteIconButton.svelte'

	export let isCompact = false

	const dispatch = createEventDispatcher()

	const _onClick = () => dispatch('click', { isCompact })
</script>

<PaletteIconButton
	data-testid="__palette-compact-toggle-button__"
	aria-label={isCompact ? 'Enlarge the palette' : 'Compact the palette'}
	{...$$restProps}
	icon={isCompact ? ENLARGE : COMPACT}
	on:click={_onClick}
/>
