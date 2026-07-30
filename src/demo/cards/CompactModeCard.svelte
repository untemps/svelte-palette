<script lang="ts">
	import { Palette } from '$lib'
	import type { ColorsProp } from '$lib/types'

	import Card from '../components/Card.svelte'
	import { getTheme } from '../lib/theme.svelte'

	const DESCRIPTION =
		'Provide <code>compactColorIndices</code> to expose a compact toggle in the tools row. Collapsing the palette shows only the picked indices; enlarging restores the full grid.'

	const CODE = `<Palette
	{colors}
	compactColorIndices={[0, 4, 7, 11]}
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
			<Palette {colors} {compactColorIndices} data-palette-theme={getTheme()} />
		</div>
	</div>

	<p class="hint">
		Use the compact / enlarge button in the tools row to collapse the palette to indices {compactColorIndices.join(
			', '
		)}.
	</p>
</Card>
