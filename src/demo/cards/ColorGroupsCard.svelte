<script lang="ts">
	import { Palette } from '$lib'
	import type { ColorsProp } from '$lib/types'

	import Card from '../components/Card.svelte'
	import { getPaletteTheme } from '../lib/theme.svelte'

	const DESCRIPTION =
		'Pass an array of <code>{ name, colors }</code> groups and the palette renders each named collection as its own labelled strip. Add <code>presentational</code> to drop the listbox roles, tab stop and arrow-key navigation — a purely decorative palette — and replace each slot with the <code>slot</code> snippet to render your own mark.'

	const CODE = `const colors = [
	{ name: 'Warm', colors: ['#865C54', '#A65846', '#AD8C72'] },
	{ name: 'Cool', colors: ['#172B41', '#617899', '#847999'] },
]

<Palette {colors} presentational>
	{#snippet slot({ color })}
		<div class="block" style="--c:{color}"></div>
	{/snippet}
</Palette>`

	const colors: ColorsProp = [
		{ name: 'Warm', colors: ['#865c54', '#8f5447', '#a65846', '#a9715e', '#ad8c72', '#c2b091'] },
		{ name: 'Cool', colors: ['#172b41', '#32465c', '#617899', '#9ba2bc', '#847999', '#50526a'] },
		{ name: 'Nature', colors: ['#8b8c6b', '#97a847', '#5b652c', '#6a6a40'] },
		{ name: 'Vivid', colors: ['#f2d9bf', '#f5baae', '#f1a191', '#f56476', '#e43f6f', '#be3e82'] },
	]
</script>

<Card
	title="Color groups"
	badge="ColorGroup[]"
	description={DESCRIPTION}
	code={CODE}
	docHref="https://github.com/untemps/svelte-palette#array-of-color-groups"
>
	<div class="card__stage">
		<div class="palette-frame groups-frame">
			<Palette {colors} presentational data-palette-theme={getPaletteTheme()}>
				{#snippet slot({ color })}
					<div class="gblock" style="--c:{color}"></div>
				{/snippet}
			</Palette>
		</div>
	</div>
</Card>

<style>
	/*
	 * The library lays out only the ungrouped listbox; grouped mode leaves each
	 * group's cells to the consumer. Render each group as a full-width colour
	 * strip captioned by its name, in the spirit of the presentational demo.
	 */
	.groups-frame :global(.palette__groups) {
		gap: 1rem;
	}
	.groups-frame :global(.palette__groups__group) {
		display: flex;
		flex-direction: column-reverse; /* strip on top, name beneath */
		gap: 0.5rem;
	}
	.groups-frame :global(.palette__groups__group__name) {
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--palette-text);
	}
	.groups-frame :global(ul.palette__cells) {
		display: flex;
		margin: 0;
		padding: 0;
		list-style: none;
		border-radius: 0.5rem;
		overflow: hidden;
	}
	/* Equal-width blocks so groups of any size fill the whole strip */
	.groups-frame :global(.palette__cells__cell) {
		flex: 1 1 0;
		min-width: 0;
	}
	.gblock {
		width: 100%;
		height: 56px;
		background: var(--c);
	}
</style>
