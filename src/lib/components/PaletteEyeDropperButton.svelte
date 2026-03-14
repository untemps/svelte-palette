<script>
	import { EYE_DROPPER } from '../enums/PaletteIcon'
	import PaletteIconButton from './PaletteIconButton.svelte'

	let { onadd = undefined, onerror = undefined, ...restProps } = $props()

	const _onClick = async () => {
		try {
			const eyeDropper = new EyeDropper()
			const { sRGBHex: color } = await eyeDropper.open()
			onadd?.({ color })
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
