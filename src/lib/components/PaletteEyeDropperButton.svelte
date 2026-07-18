<script lang="ts">
	import { EYE_DROPPER } from '../enums/PaletteIcon'
	import PaletteIconButton from './PaletteIconButton.svelte'
	import { normalizeColor } from '../utils/utils.js'

	import type { HTMLButtonAttributes } from 'svelte/elements'

	import type { AddEventArgs, ErrorEventArgs } from '../types'

	interface Props {
		/** Called when a color is picked with the eye dropper. */
		onadd?: (args: AddEventArgs) => void
		/** Called when the eye dropper fails or is dismissed. */
		onerror?: (args: ErrorEventArgs) => void
	}

	let {
		onadd = undefined,
		onerror = undefined,
		...restProps
	}: Props & Omit<HTMLButtonAttributes, keyof Props> = $props()

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
	onclick={_onClick}
/>
