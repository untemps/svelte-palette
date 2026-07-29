<script lang="ts">
	import { COMPACT, ENLARGE } from '../enums/PaletteIcon'
	import PaletteIconButton from './PaletteIconButton.svelte'

	import type { HTMLButtonAttributes } from 'svelte/elements'

	interface Props {
		/** Whether the palette is currently compact. */
		isCompact?: boolean
		/** Accessible name when the palette is full (clicking compacts it). */
		compactLabel?: string
		/** Accessible name when the palette is compact (clicking enlarges it). */
		enlargeLabel?: string
		/** Called when the button is clicked. */
		onclick?: (event: MouseEvent) => void
	}

	let {
		isCompact = false,
		compactLabel = 'Compact the palette',
		enlargeLabel = 'Enlarge the palette',
		onclick = undefined,
		...restProps
	}: Props & Omit<HTMLButtonAttributes, keyof Props> = $props()
</script>

<PaletteIconButton
	data-testid="__palette-compact-toggle-button__"
	aria-label={isCompact ? enlargeLabel : compactLabel}
	{...restProps}
	icon={isCompact ? ENLARGE : COMPACT}
	{onclick}
/>
