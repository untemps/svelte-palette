<script lang="ts">
	import { Palette } from '$lib'
	import type { ColorsProp, ColorValue } from '$lib/types'

	import Card from '../components/Card.svelte'
	import { getTheme } from '../lib/theme.svelte'

	const DESCRIPTION =
		'Bind the current pick with <code>bind:selectedColor</code>, then observe every mutation through the <code>onselect</code>, <code>onadd</code>, <code>ondelete</code> and <code>onerror</code> callbacks.'

	const CODE = `<Palette
	bind:selectedColor
	showInput
	deletionMode="tooltip"
	onselect={({ color }) => log('select', color)}
	onadd={({ color }) => log('add', color)}
	ondelete={({ color }) => log('delete', color)}
	onerror={({ error }) => log('error', error)}
/>`

	let colors = $state<ColorsProp | null>(['#4361ee', '#4895ef', '#4cc9f0', '#f72585', '#b5179e'])
	let selectedColor = $state<ColorValue | null>('#4361ee')

	let seq = 0
	let events = $state<{ id: number; type: string; detail: string }[]>([])

	const log = (type: string, detail: string) => {
		events = [{ id: seq++, type, detail }, ...events].slice(0, 6)
	}
</script>

<Card
	title="Selection & callbacks"
	badge="onselect"
	description={DESCRIPTION}
	code={CODE}
	docHref="https://github.com/untemps/svelte-palette#callbacks"
>
	<div class="card__stage">
		<div class="palette-frame">
			<Palette
				bind:colors
				bind:selectedColor
				showInput
				deletionMode="tooltip"
				data-palette-theme={getTheme()}
				onselect={({ color }) => log('select', color ?? 'transparent')}
				onadd={({ color }) => log('add', color)}
				ondelete={({ color, index }) => log('delete', `${color} @${index}`)}
				onerror={({ error }) => log('error', error instanceof Error ? error.message : String(error))}
			/>
		</div>
	</div>

	<p class="readout">
		<span class="readout__label">selectedColor</span>
		{#if selectedColor}
			<span class="swatch" style="background:{selectedColor}"></span>
			<span class="readout__value">{selectedColor}</span>
		{:else}
			<span class="readout__value">null</span>
		{/if}
	</p>

	<ul class="log" aria-label="Callback events">
		{#each events as event (event.id)}
			<li class="log__line"><span class="log__event">{event.type}</span><span>{event.detail}</span></li>
		{/each}
	</ul>
</Card>
