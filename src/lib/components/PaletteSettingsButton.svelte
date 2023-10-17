<script>
	import { SETTINGS } from '../enums/PaletteIcon'

	import PaletteIconButton from './PaletteIconButton.svelte'
</script>

<PaletteIconButton
	data-testid="__palette-settings-button__"
	aria-label="Go to settings"
	{...$$restProps}
	icon={SETTINGS}
	on:click
/>
