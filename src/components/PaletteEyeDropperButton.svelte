<script>
	import { createEventDispatcher } from 'svelte'

	import { ADD, ERROR } from '../enums/PaletteEvent'
	import { EYE_DROPPER } from '../enums/PaletteIcon'

	import PaletteIconButton from './PaletteIconButton.svelte'

	$: isAvailable = !!window.EyeDropper

	const dispatch = createEventDispatcher()

	const _onClick = async () => {
		try {
			const eyeDropper = new EyeDropper()
			const { sRGBHex: color } = await eyeDropper.open()
			dispatch(ADD, {
				color,
			})
		} catch (error) {
			dispatch(ERROR, {
				error,
			})
		}
	}
</script>

{#if isAvailable}
	<PaletteIconButton
		data-testid="__palette-eyedropper-button__"
		aria-label="Submit the hex color value"
		{...$$restProps}
		icon={EYE_DROPPER}
		type="submit"
		on:click={_onClick}
	/>
{/if}
