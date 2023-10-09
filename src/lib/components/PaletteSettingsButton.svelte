<script>
	import { createEventDispatcher } from 'svelte'

	import { CLICK } from '../enums/PaletteEvent'
	import { SETTINGS } from '../enums/PaletteIcon'

	import PaletteIconButton from './PaletteIconButton.svelte'

	const dispatch = createEventDispatcher()

	const _onClick = () => dispatch(CLICK, { isCompact })
</script>

<PaletteIconButton
	data-testid="__palette-settings-button__"
	aria-label="Go to settings"
	{...$$restProps}
	icon={SETTINGS}
	on:click={_onClick}
/>
