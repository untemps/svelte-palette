<script>
	import { SETTINGS } from '../enums/PaletteIcon'

	import PaletteIconButton from './PaletteIconButton.svelte'

	/**
	 * @typedef {Object} Props
	 * @property {(event: MouseEvent) => void} [onclick] Called when the button is clicked.
	 */

	/** @type {Props & Omit<import('svelte/elements').HTMLButtonAttributes, keyof Props>} */
	let { onclick = undefined, ...restProps } = $props()
</script>

<PaletteIconButton
	data-testid="__palette-settings-button__"
	aria-label="Go to settings"
	{...restProps}
	icon={SETTINGS}
	{onclick}
/>
