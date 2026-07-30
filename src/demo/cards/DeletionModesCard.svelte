<script lang="ts">
	import { Palette } from '$lib'
	import type { ColorsProp, DeletionMode } from '$lib/types'

	import Card from '../components/Card.svelte'
	import { getPaletteTheme } from '../lib/theme.svelte'

	const DESCRIPTION =
		'<code>deletionMode</code> controls how slots are removed: <code>none</code> disables it, <code>tooltip</code> asks for confirmation on hover, and <code>drop</code> drags a slot onto a trash target. A <code>tooltipClassName</code> restyles the confirm bubble.'

	const CODE = `<Palette
	bind:colors
	deletionMode="tooltip"
	tooltipClassName="my-tooltip"
/>`

	const MODES: DeletionMode[] = ['none', 'tooltip', 'drop']

	let colors = $state<ColorsProp | null>(['#f94144', '#f3722c', '#f9c74f', '#90be6d', '#43aa8b', '#577590'])
	let mode = $state<DeletionMode>('tooltip')
	let customTooltip = $state(false)
</script>

<Card
	title="Deletion modes"
	badge="deletionMode"
	description={DESCRIPTION}
	code={CODE}
	docHref="https://github.com/untemps/svelte-palette#deletion-modes"
>
	<div class="control__row">
		<div class="seg" role="group" aria-label="Deletion mode">
			{#each MODES as option (option)}
				<button type="button" class="seg__btn" aria-pressed={mode === option} onclick={() => (mode = option)}>
					{option}
				</button>
			{/each}
		</div>
		<label class="switch">
			<input type="checkbox" bind:checked={customTooltip} disabled={mode !== 'tooltip'} />
			tooltipClassName
		</label>
	</div>

	<div class="card__stage">
		<div class="palette-frame">
			<Palette
				bind:colors
				numColumns={6}
				deletionMode={mode}
				tooltipClassName={customTooltip ? 'demo-tooltip' : null}
				data-palette-theme={getPaletteTheme()}
			/>
		</div>
	</div>

	<p class="hint">
		{#if mode === 'none'}
			Deletion is off — slots cannot be removed.
		{:else if mode === 'tooltip'}
			Hover a slot and confirm in the tooltip to delete it.
		{:else}
			Drag a slot onto the trash target to delete it.
		{/if}
	</p>
</Card>

<style>
	:global(.demo-tooltip) {
		position: absolute;
		z-index: 9999;
		padding: 0.4rem 0.6rem;
		border-radius: 0.4rem;
		background: var(--accent);
		color: var(--accent-contrast);
		font-size: 0.75rem;
		box-shadow: var(--shadow-md);
	}
</style>
