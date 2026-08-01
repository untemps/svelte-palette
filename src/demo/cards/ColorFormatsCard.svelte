<script lang="ts">
	import { Palette } from '$lib'
	import type { ColorsProp, ColorObject } from '$lib/types'

	import Card from '../components/Card.svelte'
	import { getPaletteTheme } from '../lib/theme.svelte'

	const DESCRIPTION =
		'The input accepts any CSS color — hex, <code>rgb()</code>/<code>rgba()</code>, <code>hsl()</code>/<code>hsla()</code> (comma or space syntax) and the CSS named colors. Whatever is typed is normalized to hex on add, keeping an 8-digit <code>#RRGGBBAA</code> value when it carries alpha.'

	const CODE = `<Palette
	colors={[
		'rebeccapurple',
		'rgb(46, 196, 182)',
		'rgba(231, 29, 54, 0.5)',
		'hsl(41 100% 55%)',
		'#3a86ff',
	]}
	showInput
/>`

	let colors = $state<ColorsProp>([
		{ name: 'Named color', value: 'rebeccapurple' },
		{ name: 'rgb()', value: 'rgb(46, 196, 182)' },
		{ name: 'rgba() with alpha', value: 'rgba(231, 29, 54, 0.5)' },
		{ name: 'hsl() space syntax', value: 'hsl(41 100% 55%)' },
		{ name: 'Hex', value: '#3a86ff' },
	] satisfies ColorObject[])

	let values = $derived.by(() => {
		if (!Array.isArray(colors)) return []
		return colors.map((color) => {
			if (typeof color === 'string') return color
			return 'value' in color ? color.value : color.name
		})
	})
</script>

<Card
	title="Color formats"
	badge="rgb / hsl / named"
	description={DESCRIPTION}
	code={CODE}
	docHref="https://github.com/untemps/svelte-palette#supported-color-formats"
>
	<div class="card__stage">
		<div class="palette-frame">
			<Palette bind:colors showInput allowDuplicates numColumns={5} data-palette-theme={getPaletteTheme()} />
		</div>
	</div>

	<div class="readout">
		<span class="readout__label">colors</span>
		<span class="readout__value">type any format — added as hex</span>
	</div>

	<ul class="formats" aria-label="Stored color values">
		{#each values as value, i (i)}
			<li class="formats__item">
				<span class="color-chip" style="background:{value}"></span>
				<code>{value}</code>
			</li>
		{/each}
	</ul>
</Card>

<style>
	.formats {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.formats__item {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 4px 10px;
		border-radius: var(--radius-pill);
		border: 1px solid var(--border);
		background: var(--surface-raised);
		font-family: var(--font-mono);
		font-size: 0.72rem;
		color: var(--text-muted);
	}
</style>
