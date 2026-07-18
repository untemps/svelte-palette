<script lang="ts">
	import { COMPACT, ENLARGE } from '../enums/PaletteIcon'
	import PaletteIconButton from './PaletteIconButton.svelte'

	import type { HTMLButtonAttributes } from 'svelte/elements'

	interface Props {
		/** Whether the palette is currently compact. */
		isCompact?: boolean
		/** Called when the button is clicked. */
		onclick?: (event: MouseEvent) => void
	}

	let {
		isCompact = false,
		onclick = undefined,
		...restProps
	}: Props & Omit<HTMLButtonAttributes, keyof Props> = $props()
</script>

<PaletteIconButton
	data-testid="__palette-compact-toggle-button__"
	aria-label={isCompact ? 'Enlarge the palette' : 'Compact the palette'}
	{...restProps}
	icon={isCompact ? ENLARGE : COMPACT}
	{onclick}
/>
