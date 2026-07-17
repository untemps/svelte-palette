<script>
	import { EYE_DROPPER } from '../enums/PaletteIcon'
	import PaletteIconButton from './PaletteIconButton.svelte'
	import { normalizeColor } from '../utils/utils.js'

	/**
	 * @typedef {import('../types').AddEventArgs} AddEventArgs
	 * @typedef {import('../types').ErrorEventArgs} ErrorEventArgs
	 */

	/**
	 * @typedef {Object} Props
	 * @property {(args: AddEventArgs) => void} [onadd] Called when a color is picked with the eye dropper.
	 * @property {(args: ErrorEventArgs) => void} [onerror] Called when the eye dropper fails or is dismissed.
	 */

	/** @type {Props & Omit<import('svelte/elements').HTMLButtonAttributes, keyof Props>} */
	let { onadd = undefined, onerror = undefined, ...restProps } = $props()

	const _onClick = async () => {
		try {
			const eyeDropper = new EyeDropper()
			const { sRGBHex } = await eyeDropper.open()
			onadd?.({ color: normalizeColor(sRGBHex) })
		} catch (error) {
			onerror?.({ error })
		}
	}
</script>

<PaletteIconButton
	data-testid="__palette-eyedropper-button__"
	aria-label="Submit the hex color value"
	{...restProps}
	icon={EYE_DROPPER}
	type="submit"
	onclick={_onClick}
/>
