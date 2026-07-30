<script lang="ts">
	import { Palette } from '$lib'
	import type { ColorsProp } from '$lib/types'

	import Card from '../components/Card.svelte'
	import { getTheme } from '../lib/theme.svelte'

	const DESCRIPTION =
		'Add <code>presentational</code> to drop the listbox roles, tab stop and arrow-key navigation — a purely decorative palette. Replace each slot with the <code>slot</code> snippet to render your own mark.'

	const CODE = `<Palette {colors} presentational>
	{#snippet slot({ color })}
		<div class="chip" style="--c:{color}"></div>
	{/snippet}
	{#snippet footer()}
		<p>Warm Sunday afternoon</p>
	{/snippet}
</Palette>`

	const colors: ColorsProp = ['#edede9', '#d6ccc2', '#f5ebe0', '#e3d5ca', '#d5bdaf']
</script>

<Card
	title="Presentational + custom slot"
	badge="presentational"
	description={DESCRIPTION}
	code={CODE}
	docHref="https://github.com/untemps/svelte-palette#display-only-palettes"
>
	<div class="card__stage">
		<div class="palette-frame pslot-frame">
			<Palette {colors} numColumns={5} presentational data-palette-theme={getTheme()}>
				{#snippet slot({ color })}
					<div class="pslot" style="--c:{color}"></div>
				{/snippet}
				{#snippet footer()}
					<div class="pslot-caption">
						<strong>Quiet &amp; Warm</strong>
						<span>Winter Sunday afternoon</span>
					</div>
				{/snippet}
			</Palette>
		</div>
	</div>
</Card>

<style>
	.pslot {
		width: 100%;
		height: 64px;
		background: var(--c);
	}

	.pslot-caption {
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: 0.85rem 1rem;
		text-align: left;
		color: var(--palette-text);
	}
	.pslot-caption strong {
		font-size: 1rem;
	}
	.pslot-caption span {
		font-size: 0.8rem;
		opacity: 0.7;
	}
</style>
