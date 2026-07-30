<script lang="ts">
	import { Palette } from '$lib'
	import type { ColorsProp } from '$lib/types'

	import Card from '../components/Card.svelte'
	import { getTheme } from '../lib/theme.svelte'

	const DESCRIPTION =
		'<code>numColumns</code> fixes the grid width. Set it to <code>0</code> to lay slots on a single row and let <code>maxColumns</code> decide when they wrap.'

	const CODE = `<Palette {colors} {numColumns} {maxColumns} />`

	const colors: ColorsProp = [
		'#8ecae6',
		'#219ebc',
		'#023047',
		'#ffb703',
		'#fb8500',
		'#606c38',
		'#283618',
		'#bc6c25',
		'#e76f51',
		'#2a9d8f',
	]

	let numColumns = $state(5)
	let maxColumns = $state(4)
</script>

<Card
	title="Layout"
	badge="numColumns"
	description={DESCRIPTION}
	code={CODE}
	docHref="https://github.com/untemps/svelte-palette#palette-api"
>
	<div class="control__row">
		<label class="control">
			<span class="control__label">numColumns: {numColumns}</span>
			<input class="range" type="range" min="0" max="8" bind:value={numColumns} />
		</label>
		<label class="control">
			<span class="control__label">maxColumns: {maxColumns || '∞'}</span>
			<input class="range" type="range" min="0" max="8" bind:value={maxColumns} disabled={numColumns > 0} />
		</label>
	</div>

	<div class="card__stage">
		<div class="palette-frame">
			<Palette {colors} {numColumns} {maxColumns} data-palette-theme={getTheme()} />
		</div>
	</div>

	<p class="hint">
		{#if numColumns > 0}
			Fixed grid of {numColumns} columns. Set numColumns to 0 to enable maxColumns.
		{:else}
			Single-row flow wrapping after {maxColumns || 'unlimited'} columns.
		{/if}
	</p>
</Card>
