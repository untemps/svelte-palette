<script lang="ts">
	import { EYE_DROPPER } from '../enums/PaletteIcon'
	import PaletteIconButton from './PaletteIconButton.svelte'
	import { normalizeColor } from '../utils/utils'

	let {
		onadd = undefined,
		onerror = undefined,
		...restProps
	}: {
		onadd?: (event: { color: string }) => void
		onerror?: (event: { error: unknown }) => void
		[key: string]: unknown
	} = $props()

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
