<script lang="ts">
	import { browser } from '$app/environment'

	import { Palette } from '$lib'

	import type { ColorsProp } from '$lib/types'

	const _palette = ['#2ec4b6', '#e71d36', '#ff9f1c', '#011627', '#41ead4', '#f71735', '#3a86ff', '#8338ec']

	const _fetchColors = (shouldFail: boolean): Promise<string[]> =>
		new Promise((resolve, reject) =>
			setTimeout(
				() =>
					shouldFail ? reject(new Error('The color service is unavailable (HTTP 503)')) : resolve(_palette),
				900
			)
		)

	let colors = $state<ColorsProp | null>(browser ? _fetchColors(true) : null)
	let selectedColor = $state<string | null>(null)
	let lastError = $state<string | null>(null)

	const _failingSource = browser ? _fetchColors(true) : null

	const _loadFailing = () => {
		lastError = null
		colors = _fetchColors(true)
	}

	const _loadSucceeding = () => {
		lastError = null
		colors = _fetchColors(false)
	}
</script>

<main class="example6" style="--bgColor:{selectedColor ?? '#1b1b1b'}">
	<h1 class="title">Async Colors &amp; Error State</h1>
	<p class="intro">
		The <code>colors</code> prop accepts a promise. While it is pending the palette shows the loader; if it rejects,
		the palette shows an error state — through the <code>error</code> snippet and the
		<code>onerror</code> callback — instead of spinning forever. Retrying with a fresh promise clears the error.
	</p>

	<div class="controls">
		<button type="button" onclick={_loadSucceeding}>Fetch colors (succeeds)</button>
		<button type="button" onclick={_loadFailing}>Fetch colors (fails)</button>
	</div>

	<div class="content">
		<Palette
			class="palette__custom"
			data-palette-theme="light"
			{colors}
			bind:selectedColor
			numColumns={4}
			onerror={({ error }) => (lastError = error instanceof Error ? error.message : String(error))}
		>
			{#snippet error({ error })}
				<div class="error">
					<p class="error__message">
						{error instanceof Error ? error.message : 'Unable to load the colors.'}
					</p>
					<button type="button" class="error__retry" onclick={_loadSucceeding}>Retry</button>
				</div>
			{/snippet}
		</Palette>
	</div>

	<div class="status" data-testid="__example-error__">
		{#if lastError}
			<span class="status__label">onerror</span>
			<span class="status__value">{lastError}</span>
		{:else}
			<span class="status__hint">No error reported yet — try the “fails” button above.</span>
		{/if}
	</div>

	<p class="intro intro--muted">
		Omitting the <code>error</code> snippet renders the bundled <code>PaletteError</code> component instead:
	</p>
	<div class="content">
		<Palette
			class="palette__custom palette__custom--default"
			colors={_failingSource}
			numColumns={4}
			data-palette-theme="light"
		/>
	</div>
</main>

<style>
	.example6 {
		min-height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.25rem;
		padding: 2.5rem 1.5rem;
		font-family: Helvetica, sans-serif;
		color: #f5f5f5;
		background-color: var(--bgColor);
		transition: background-color 0.4s ease;
	}

	.title {
		margin: 0;
		font-size: 1.75rem;
		text-align: center;
	}

	.intro {
		max-width: 42rem;
		margin: 0;
		text-align: center;
		line-height: 1.5;
	}

	.intro--muted {
		margin-top: 1rem;
		opacity: 0.85;
	}

	.intro code {
		padding: 0.05rem 0.3rem;
		font-size: 0.85em;
		background-color: rgba(255, 255, 255, 0.14);
		border-radius: 0.2rem;
	}

	.controls {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		justify-content: center;
	}

	.controls button {
		padding: 0.5rem 1rem;
		font: inherit;
		font-size: 0.875rem;
		color: #1b1b1b;
		background-color: #f5f5f5;
		border: none;
		border-radius: 0.3rem;
		cursor: pointer;
	}

	.controls button:hover {
		background-color: #fff;
	}

	.content {
		width: 100%;
		max-width: 26rem;
	}

	.example6 :global(.palette[data-palette].palette__custom) {
		border-radius: 0.5rem;
		overflow: hidden;
	}

	.example6 :global(.palette__custom--default) {
		background-color: #fff;
	}

	.error {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.6rem;
		padding: 0.5rem;
		text-align: center;
		color: #c0392b;
	}

	.error__message {
		margin: 0;
		font-size: 0.875rem;
		font-weight: 600;
	}

	.error__retry {
		padding: 0.35rem 0.9rem;
		font: inherit;
		font-size: 0.8rem;
		color: #fff;
		background-color: #c0392b;
		border: none;
		border-radius: 0.3rem;
		cursor: pointer;
	}

	.status {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		min-height: 1.5rem;
		font-size: 0.8rem;
	}

	.status__label {
		padding: 0.1rem 0.4rem;
		font-family: monospace;
		color: #1b1b1b;
		background-color: #ffb3a7;
		border-radius: 0.2rem;
	}

	.status__hint {
		opacity: 0.7;
	}
</style>
