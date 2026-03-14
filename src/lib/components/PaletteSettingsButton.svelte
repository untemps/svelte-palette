<script>
	import { SETTINGS } from '../enums/PaletteIcon'

	import PaletteIconButton from './PaletteIconButton.svelte'

	let { onclick = undefined, ...restProps } = $props()
</script>

<PaletteIconButton
	data-testid="__palette-settings-button__"
	aria-label="Go to settings"
	{...restProps}
	icon={SETTINGS}
	{onclick}
/>
