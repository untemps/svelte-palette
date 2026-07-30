<script lang="ts">
	import { Palette } from '$lib'
	import type { ColorsProp, ColorValue } from '$lib/types'

	import Card from '../components/Card.svelte'
	import { getTheme } from '../lib/theme.svelte'

	const DESCRIPTION =
		'Every region is a snippet: <code>header</code>, <code>footer</code>, <code>input</code>, <code>tools</code>, <code>settings</code>, plus <code>beforeSlot</code> / <code>afterSlot</code> and <code>transparentSlot</code>. Here a <code>header</code> previews the pick and a <code>footer</code> captions the set.'

	const CODE = `<Palette bind:selectedColor>
	{#snippet header({ selectedColor })}
		<div class="preview" style="background:{selectedColor}">
			{selectedColor}
		</div>
	{/snippet}
	{#snippet footer()}
		<p>Brand accents</p>
	{/snippet}
</Palette>`

	const colors: ColorsProp = ['#3a0ca3', '#480ca8', '#560bad', '#7209b7', '#b5179e', '#f72585']
	let selectedColor = $state<ColorValue | null>('#7209b7')
</script>

<Card
	title="Custom snippets"
	badge="header / footer"
	description={DESCRIPTION}
	code={CODE}
	docHref="https://github.com/untemps/svelte-palette#snippets"
>
	<div class="card__stage">
		<div class="palette-frame">
			<Palette {colors} bind:selectedColor numColumns={6} data-palette-theme={getTheme()}>
				{#snippet header({ selectedColor })}
					<div class="snip-header" style="--c:{selectedColor ?? 'transparent'}">
						<span>{selectedColor ?? 'none'}</span>
					</div>
				{/snippet}
				{#snippet footer()}
					<p class="snip-footer">Brand accents — pick one to preview it above.</p>
				{/snippet}
			</Palette>
		</div>
	</div>
</Card>

<style>
	.snip-header {
		width: 100%;
		height: 56px;
		display: flex;
		align-items: center;
		padding: 0 0.85rem;
		background: var(--c);
		color: #fff;
		font-family: var(--font-mono);
		font-size: 0.85rem;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.45);
	}
	.snip-footer {
		padding: 0.75rem 0.85rem 0;
		font-size: 0.8rem;
		color: var(--palette-text);
		opacity: 0.75;
		text-align: left;
	}
</style>
