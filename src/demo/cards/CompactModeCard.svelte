<script lang="ts">
	import { Palette } from '$lib'
	import type { ColorsProp } from '$lib/types'

	import Card from '../components/Card.svelte'
	import { getPaletteTheme } from '../lib/theme.svelte'

	const DESCRIPTION =
		'Provide <code>compactColorIndices</code> to expose a compact toggle in the tools row. Collapsing the palette shows only the picked indices; enlarging restores the full grid. Grouped palettes collapse the same way: compact mode ignores the grouping and shows one flat strip of the picked colors, the indices addressing the groups&rsquo; colors flattened in order.'

	const CODE = `<Palette
	{colors}
	compactColorIndices={[0, 4, 7, 11]}
/>

<Palette
	colors={groupedColors}
	compactColorIndices={[0, 3, 5, 7]}
/>`

	const colors: ColorsProp = [
		'#ff595e',
		'#ff7655',
		'#ffca3a',
		'#c5ca30',
		'#8ac926',
		'#52a675',
		'#1982c4',
		'#4267ac',
		'#6a4c93',
		'#8a5a83',
		'#b5179e',
		'#e01e84',
	]

	const compactColorIndices = [0, 4, 7, 11]

	const groupedColors: ColorsProp = [
		{ name: 'Warm', colors: ['#ff595e', '#ff7655', '#ffca3a', '#c5ca30'] },
		{ name: 'Cool', colors: ['#1982c4', '#4267ac', '#6a4c93', '#8a5a83'] },
	]

	const groupedCompactColorIndices = [0, 3, 5, 7]
</script>

<Card
	title="Compact mode"
	badge="compactColorIndices"
	description={DESCRIPTION}
	code={CODE}
	docHref="https://github.com/untemps/svelte-palette#compact-mode"
>
	<div class="card__stage">
		<div class="palette-frame">
			<Palette {colors} {compactColorIndices} data-palette-theme={getPaletteTheme()} />
		</div>
		<div class="palette-frame">
			<Palette
				colors={groupedColors}
				compactColorIndices={groupedCompactColorIndices}
				data-palette-theme={getPaletteTheme()}
			/>
		</div>
	</div>

	<p class="hint">
		Use the compact / enlarge button in the tools row to collapse the flat palette to indices {compactColorIndices.join(
			', '
		)} and the grouped one to indices {groupedCompactColorIndices.join(', ')} of its flattened colors.
	</p>
</Card>
