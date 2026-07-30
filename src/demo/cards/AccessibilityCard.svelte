<script lang="ts">
	import { Palette } from '$lib'
	import type { ColorsProp, ColorValue } from '$lib/types'

	import Card from '../components/Card.svelte'
	import { getTheme } from '../lib/theme.svelte'

	const DESCRIPTION =
		'The slot grid is a real <code>listbox</code> with <code>option</code> children, a single tab stop and roving <code>tabindex</code>. Arrow keys move focus, Enter/Space select, and Delete/Backspace remove the focused slot when a <code>deletionMode</code> is set.'

	const CODE = `<Palette
	bind:colors
	bind:selectedColor
	deletionMode="tooltip"
/>
<!-- listbox / option roles, roving tabindex,
     arrow-key navigation & a visible focus ring -->`

	let colors = $state<ColorsProp | null>(['#2b2d42', '#8d99ae', '#edf2f4', '#ef233c', '#d90429', '#fca311'])
	let selectedColor = $state<ColorValue | null>('#ef233c')
</script>

<Card
	title="Keyboard & listbox a11y"
	badge="listbox"
	description={DESCRIPTION}
	code={CODE}
	docHref="https://github.com/untemps/svelte-palette#accessibility"
>
	<div class="card__stage">
		<div class="palette-frame">
			<Palette
				bind:colors
				bind:selectedColor
				numColumns={6}
				deletionMode="tooltip"
				data-palette-theme={getTheme()}
			/>
		</div>
	</div>

	<p class="hint kbd-hint">
		<kbd>Tab</kbd> to focus · <kbd>←</kbd> <kbd>→</kbd> <kbd>↑</kbd> <kbd>↓</kbd> to move ·
		<kbd>Enter</kbd> to select · <kbd>Del</kbd> to remove
	</p>
</Card>

<style>
	.kbd-hint {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.35rem;
		line-height: 2;
	}
</style>
