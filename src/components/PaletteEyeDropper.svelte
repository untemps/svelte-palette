<script>
	import { createEventDispatcher } from 'svelte'

	import { ADD, ERROR } from '../enums/PaletteEvent'
	import { EYE_DROPPER } from '../enums/PaletteIcon'

	import IconButton from './IconButton.svelte'

	export let ariaLabel = 'Submit this hex color value'

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

{#if !!window.EyeDropper}
	<IconButton
		data-testid="__palette-eyedropper__"
		icon={EYE_DROPPER}
		type="submit"
		aria-label={ariaLabel}
		on:click={_onClick} />
{/if}
