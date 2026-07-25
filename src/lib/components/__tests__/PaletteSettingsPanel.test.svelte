<script lang="ts">
	import { untrack } from 'svelte'

	import PaletteSettingsPanel from '../PaletteSettingsPanel.svelte'

	let {
		initialTarget = 'body',
		initialIsVisible = false,
	}: {
		initialTarget?: string
		initialIsVisible?: boolean
	} = $props()

	let target = $state<string>(untrack(() => initialTarget))
	let isVisible = $state<boolean>(untrack(() => initialIsVisible))

	export const setTarget = (value: string) => (target = value)
	export const setIsVisible = (value: boolean) => (isVisible = value)
</script>

<PaletteSettingsPanel {target} {isVisible}>
	<span data-testid="__panel-content__">Panel content</span>
</PaletteSettingsPanel>
