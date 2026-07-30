<script lang="ts">
	import { Palette } from '$lib'
	import type { ColorsProp, ColorValue } from '$lib/types'

	import Card from '../components/Card.svelte'
	import { getTheme } from '../lib/theme.svelte'

	const DESCRIPTION =
		'Set <code>showTransparentSlot</code> to prepend a "no color" option. Selecting it clears the pick — <code>selectedColor</code> becomes <code>null</code>.'

	const CODE = `<Palette
	{colors}
	bind:selectedColor
	showTransparentSlot
/>`

	const colors: ColorsProp = ['#006466', '#065a60', '#0b525b', '#144552', '#1b3a4b', '#212f45']
	let selectedColor = $state<ColorValue | null>('#006466')
</script>

<Card
	title="Transparent slot"
	badge="showTransparentSlot"
	description={DESCRIPTION}
	code={CODE}
	docHref="https://github.com/untemps/svelte-palette#palette-api"
>
	<div class="card__stage">
		<div class="palette-frame">
			<Palette {colors} bind:selectedColor showTransparentSlot numColumns={7} data-palette-theme={getTheme()} />
		</div>
	</div>

	<p class="readout">
		<span class="readout__label">selectedColor</span>
		{#if selectedColor}
			<span class="swatch" style="background:{selectedColor}"></span>
			<span class="readout__value">{selectedColor}</span>
		{:else}
			<span class="readout__value">null (transparent)</span>
		{/if}
	</p>
</Card>
