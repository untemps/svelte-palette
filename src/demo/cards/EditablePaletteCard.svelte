<script lang="ts">
	import { Palette } from '$lib'
	import type { ColorsProp } from '$lib/types'

	import Card from '../components/Card.svelte'
	import { getTheme } from '../lib/theme.svelte'

	const DESCRIPTION =
		'Two-way <code>bind:colors</code> keeps a list in sync as slots are added from the input or removed from the palette. <code>maxColors</code> caps the size and <code>allowDuplicates</code> gates repeats.'

	const CODE = `<script>
	let colors = $state(['#f94144', '#f3722c', '#f8961e'])
<\/script>

<Palette
	bind:colors
	{maxColors}
	{allowDuplicates}
	showInput
	deletionMode="tooltip"
/>`

	let colors = $state<ColorsProp | null>(['#f94144', '#f3722c', '#f8961e', '#f9c74f', '#90be6d'])
	let maxColors = $state(12)
	let allowDuplicates = $state(false)

	let count = $derived(Array.isArray(colors) ? colors.length : 0)
</script>

<Card
	title="Editable palette"
	badge="bind:colors"
	description={DESCRIPTION}
	code={CODE}
	docHref="https://github.com/untemps/svelte-palette#palette-api"
>
	<div class="control__row">
		<label class="control control--inline">
			<span class="control__label">maxColors</span>
			<input class="field field--sm" type="number" min="1" max="30" bind:value={maxColors} />
		</label>
		<label class="switch">
			<input type="checkbox" bind:checked={allowDuplicates} />
			allowDuplicates
		</label>
	</div>

	<div class="card__stage">
		<div class="palette-frame">
			<Palette
				bind:colors
				{maxColors}
				{allowDuplicates}
				showInput
				deletionMode="tooltip"
				data-palette-theme={getTheme()}
			/>
		</div>
	</div>

	<p class="readout">
		<span class="readout__label">bind:colors</span>
		<span class="readout__value">{count} / {maxColors} slots — add with the input, delete on hover</span>
	</p>
</Card>
