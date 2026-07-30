<script lang="ts">
	import { browser } from '$app/environment'

	import { Palette } from '$lib'
	import type { ColorsProp } from '$lib/types'

	import Card from '../components/Card.svelte'
	import { getPaletteTheme } from '../lib/theme.svelte'

	const DESCRIPTION =
		'The <code>colors</code> prop accepts a <code>Promise</code>. The palette shows the loader while it is pending, and — through the <code>error</code> snippet and <code>onerror</code> — an error state if it rejects, instead of spinning forever.'

	const CODE = `<Palette
	colors={fetchColors()}
	onerror={({ error }) => (message = String(error))}
>
	{#snippet error({ error })}
		<button onclick={retry}>Retry</button>
	{/snippet}
</Palette>`

	const PALETTE = ['#2ec4b6', '#e71d36', '#ff9f1c', '#011627', '#41ead4', '#f71735', '#3a86ff', '#8338ec']

	const fetchColors = (shouldFail: boolean): Promise<string[]> =>
		new Promise((resolve, reject) =>
			setTimeout(
				() =>
					shouldFail ? reject(new Error('The color service is unavailable (HTTP 503)')) : resolve(PALETTE),
				900
			)
		)

	let colors = $state<ColorsProp | null>(browser ? fetchColors(true) : null)
	let lastError = $state<string | null>(null)

	const loadFailing = () => {
		lastError = null
		colors = fetchColors(true)
	}

	const loadSucceeding = () => {
		lastError = null
		colors = fetchColors(false)
	}
</script>

<Card
	title="Async colors"
	badge="Promise"
	description={DESCRIPTION}
	code={CODE}
	docHref="https://github.com/untemps/svelte-palette#promise"
>
	<div class="btn-row">
		<button type="button" class="btn btn--sm btn--primary" onclick={loadSucceeding}>Fetch (succeeds)</button>
		<button type="button" class="btn btn--sm" onclick={loadFailing}>Fetch (fails)</button>
	</div>

	<div class="card__stage">
		<div class="palette-frame">
			<Palette
				{colors}
				numColumns={4}
				data-palette-theme={getPaletteTheme()}
				onerror={({ error }) => (lastError = error instanceof Error ? error.message : String(error))}
			>
				{#snippet error({ error })}
					<div class="async-error">
						<p>{error instanceof Error ? error.message : 'Unable to load the colors.'}</p>
						<button type="button" class="btn btn--sm" onclick={loadSucceeding}>Retry</button>
					</div>
				{/snippet}
			</Palette>
		</div>
	</div>

	<p class="readout">
		<span class="readout__label">onerror</span>
		<span class="readout__value">{lastError ?? 'no error reported yet'}</span>
	</p>
</Card>

<style>
	.async-error {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.6rem;
		padding: 0.5rem;
		text-align: center;
		color: var(--danger);
		font-size: var(--step--1);
	}
</style>
