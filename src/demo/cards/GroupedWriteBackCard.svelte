<script lang="ts">
	import { Palette } from '$lib'
	import type { ColorGroup, ColorsProp, DeleteEventArgs } from '$lib/types'

	import Card from '../components/Card.svelte'
	import { getPaletteTheme } from '../lib/theme.svelte'

	const DESCRIPTION =
		'In grouped mode <code>bind:colors</code> receives the groups as they were supplied, with only their colors normalized: a group carrying no <code>colors</code> array is skipped by the grid and handed back untouched, and so are the keys the palette has no use for. <code>ondelete</code> reports <code>groupIndex</code> in that supplied list and hands over a list the handler owns — editing it from the callback is resolved rather than absorbed. The supplied list itself is read when it is reassigned, whichever group changed.'

	const CODE = `const colors = [
	{ id: 'reserved', name: 'Reserved' },
	{ id: 'warm', name: 'Warm', colors: ['#865C54', '#A65846'] },
]

<Palette
	bind:colors
	deletionMode="tooltip"
	ondelete={(args) => {
		const groups = args.colors as ColorGroup[]
		groups[args.groupIndex].colors.push('#F5BAAE')
	}}
/>`

	const ECHOED = '#f5baae'
	const APPENDED = '#e43f6f'

	const initial = (): ColorsProp =>
		[
			{ id: 'reserved', name: 'Reserved' },
			{ id: 'warm', name: 'Warm', colors: ['#865c54', '#8f5447', '#a65846', '#a9715e'] },
			{ id: 'cool', name: 'Cool', colors: ['#172b41', '#617899', '#847999'] },
		] as unknown as ColorsProp

	let colors = $state<ColorsProp | null>(initial())
	let echo = $state(false)
	let lastDelete = $state<DeleteEventArgs | null>(null)

	const groups = $derived(Array.isArray(colors) ? (colors as ColorGroup[]) : [])
	const rendered = $derived(groups.filter((group) => Array.isArray(group.colors)).length)

	const onDelete = (args: DeleteEventArgs) => {
		lastDelete = args
		if (echo && args.groupIndex != null) {
			;(args.colors as ColorGroup[])[args.groupIndex].colors.push(ECHOED)
		}
	}

	const editInPlace = (index: number) => {
		groups[index].colors = [...groups[index].colors, APPENDED]
	}

	const reassign = () => {
		colors = groups.map((group) => ({ ...group })) as unknown as ColorsProp
	}

	const reset = () => {
		colors = initial()
		lastDelete = null
	}
</script>

<Card
	title="Grouped write-back"
	badge="bind:colors"
	description={DESCRIPTION}
	code={CODE}
	docHref="https://github.com/untemps/svelte-palette#array-of-color-groups"
>
	<div class="control__row">
		<label class="switch">
			<input type="checkbox" bind:checked={echo} />
			ondelete appends {ECHOED}
		</label>
	</div>

	<div class="btn-row">
		<button type="button" class="btn btn--sm" onclick={() => editInPlace(1)}>Edit Warm in place</button>
		<button type="button" class="btn btn--sm" onclick={() => editInPlace(2)}>Edit Cool in place</button>
		<button type="button" class="btn btn--sm btn--primary" onclick={reassign}>Reassign the list</button>
		<button type="button" class="btn btn--sm btn--ghost" onclick={reset}>Reset</button>
	</div>

	<div class="card__stage">
		<div class="palette-frame">
			<Palette
				bind:colors
				numColumns={4}
				deletionMode="tooltip"
				ondelete={onDelete}
				data-palette-theme={getPaletteTheme()}
			/>
		</div>
	</div>

	<p class="readout">
		<span class="readout__label">ondelete</span>
		<span class="readout__value">
			{#if lastDelete}
				{lastDelete.color} at index {lastDelete.index} of group {lastDelete.groupIndex} ({lastDelete.groupName})
			{:else}
				Hover a slot and confirm in the tooltip to delete it
			{/if}
		</span>
	</p>

	<p class="hint">
		{groups.length} groups bound, {rendered} rendered — <code>Reserved</code> carries no colors, so the grid skips
		it while the bound list keeps it and its <code>id</code>. Editing a group in place changes the bound list
		without reaching the grid, the same for either group; reassigning the list is what the palette reads.
	</p>

	<pre class="bound">{JSON.stringify(colors, null, 1)}</pre>
</Card>

<style>
	.bound {
		max-height: 11rem;
		margin: 0.75rem 0 0;
		padding: 0.6rem 0.75rem;
		overflow: auto;
		border: 1px solid var(--border);
		border-radius: 0.5rem;
		background: var(--surface-sunken);
		color: var(--text-muted);
		font-size: 0.72rem;
		line-height: 1.45;
	}
</style>
