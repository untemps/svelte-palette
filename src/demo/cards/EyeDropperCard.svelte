<script lang="ts">
	import { browser } from '$app/environment'

	import { Palette } from '$lib'
	import type { ColorsProp } from '$lib/types'

	import Card from '../components/Card.svelte'
	import { getTheme } from '../lib/theme.svelte'

	const DESCRIPTION =
		'With <code>showInput</code>, the input row exposes the native EyeDropper button. Pick any pixel on screen to add its color; a cancelled or unsupported pick surfaces through <code>onerror</code>.'

	const CODE = `<Palette bind:colors showInput onerror={handleEyeDropperError} />`

	const supported = browser && 'EyeDropper' in window

	let colors = $state<ColorsProp | null>(['#ef476f', '#ffd166', '#06d6a0', '#118ab2', '#073b4c'])
	let lastError = $state<string | null>(null)
</script>

<Card
	title="EyeDropper picker"
	badge="showInput"
	description={DESCRIPTION}
	code={CODE}
	docHref="https://github.com/untemps/svelte-palette#eyedropper-api-support"
>
	<div class="pill-row">
		{#if supported}
			<span class="pill pill--ok"><span class="pill__dot"></span>EyeDropper available</span>
		{:else}
			<span class="pill pill--warn"><span class="pill__dot"></span>Not supported in this browser</span>
		{/if}
	</div>

	<div class="card__stage">
		<div class="palette-frame">
			<Palette
				bind:colors
				showInput
				numColumns={5}
				data-palette-theme={getTheme()}
				onerror={({ error }) => (lastError = error instanceof Error ? error.message : String(error))}
			/>
		</div>
	</div>

	<p class="readout">
		<span class="readout__label">onerror</span>
		<span class="readout__value">{lastError ?? 'no error reported yet'}</span>
	</p>
</Card>
