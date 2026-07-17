<script>
	import { COMPACT, ENLARGE } from '../enums/PaletteIcon'
	import PaletteIconButton from './PaletteIconButton.svelte'

	/**
	 * @typedef {Object} Props
	 * @property {boolean} [isCompact] Whether the palette is currently compact.
	 * @property {(event: MouseEvent) => void} [onclick] Called when the button is clicked.
	 */

	/** @type {Props & Omit<import('svelte/elements').HTMLButtonAttributes, keyof Props>} */
	let { isCompact = false, onclick = undefined, ...restProps } = $props()
</script>

<PaletteIconButton
	data-testid="__palette-compact-toggle-button__"
	aria-label={isCompact ? 'Enlarge the palette' : 'Compact the palette'}
	{...restProps}
	icon={isCompact ? ENLARGE : COMPACT}
	{onclick}
/>
