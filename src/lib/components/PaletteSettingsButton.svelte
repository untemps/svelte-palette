<script lang="ts">
	import { SETTINGS } from '../enums/PaletteIcon'

	import PaletteIconButton from './PaletteIconButton.svelte'

	import { DEFAULT_LABELS } from '../labels'

	import type { HTMLButtonAttributes } from 'svelte/elements'

	interface Props {
		/** Called when the button is clicked. */
		onclick?: (event: MouseEvent) => void
	}

	let { onclick = undefined, ...restProps }: Props & Omit<HTMLButtonAttributes, keyof Props> = $props()
</script>

<PaletteIconButton
	data-testid="__palette-settings-button__"
	aria-label={DEFAULT_LABELS.settings}
	{...restProps}
	icon={SETTINGS}
	{onclick}
/>
