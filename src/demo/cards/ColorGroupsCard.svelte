<script lang="ts">
	import { Palette } from '$lib'
	import type { ColorsProp, ColorValue } from '$lib/types'

	import Card from '../components/Card.svelte'
	import { getPaletteTheme } from '../lib/theme.svelte'

	const DESCRIPTION =
		'Pass an array of <code>{ name, colors }</code> groups and the palette renders each collection under its label. Selection still works across every group.'

	const CODE = `const colors = [
	{ name: 'Warm', colors: ['#865C54', '#A65846', '#AD8C72'] },
	{ name: 'Cool', colors: ['#172B41', '#617899', '#847999'] },
]

<Palette {colors} bind:selectedColor />`

	const colors: ColorsProp = [
		{ name: 'Warm', colors: ['#865c54', '#8f5447', '#a65846', '#a9715e', '#ad8c72', '#c2b091'] },
		{ name: 'Cool', colors: ['#172b41', '#32465c', '#617899', '#9ba2bc', '#847999', '#50526a'] },
		{ name: 'Nature', colors: ['#8b8c6b', '#97a847', '#5b652c', '#6a6a40'] },
		{ name: 'Vivid', colors: ['#f2d9bf', '#f5baae', '#f1a191', '#f56476', '#e43f6f', '#be3e82'] },
	]

	let selectedColor = $state<ColorValue | null>('#865c54')
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
			<Palette {colors} bind:selectedColor numColumns={6} data-palette-theme={getPaletteTheme()} />
		</div>
	</div>

	<p class="readout">
		<span class="readout__label">selectedColor</span>
		{#if selectedColor}
			<span class="color-chip" style="background:{selectedColor}"></span>
			<span class="readout__value">{selectedColor}</span>
		{:else}
			<span class="readout__value">null</span>
		{/if}
	</p>
</Card>

<style>
	/*
	 * The library lays out only the ungrouped listbox; grouped mode leaves each
	 * group's cells to the consumer, so give them a name and a horizontal grid.
	 */
	.groups-frame :global(.palette__groups__group__name) {
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-size: 0.65rem;
		font-weight: 700;
		color: var(--palette-text);
		opacity: 0.7;
	}
	.groups-frame :global(ul.palette__cells) {
		margin: 0;
		padding: 0;
		list-style: none;
		display: grid;
		/* Honour the palette's numColumns (published on .palette__content); a 0
		   floor keeps the row inside the card at any mobile width. */
		grid-template-columns: repeat(var(--num-columns, 6), minmax(0, 1fr));
		gap: 0.4rem;
		align-items: center;
		justify-items: center;
	}
	.groups-frame :global(.palette__cells__cell) {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
