<script lang="ts">
	import { Palette } from '$lib'
	import type { ColorsProp, ColorValue } from '$lib/types'

	import Card from '../components/Card.svelte'
	import { getPaletteTheme } from '../lib/theme.svelte'

	const DESCRIPTION =
		'The slot grid is a real <code>listbox</code> with <code>option</code> children, a single tab stop and roving <code>tabindex</code>. Arrow keys move focus, Enter/Space select, and Delete/Backspace remove the focused slot when a <code>deletionMode</code> is set. Grouped palettes navigate by rendered row: a group holding more colors than <code>numColumns</code> wraps, and <kbd>↑</kbd> <kbd>↓</kbd> step through its own rows before crossing into the next group.'

	const CODE = `<Palette
	bind:colors
	bind:selectedColor
	deletionMode="tooltip"
/>

<Palette
	colors={colorGroups}
	bind:selectedColor={groupedColor}
	numColumns={4}
	labels={{ slots: 'Grouped color slots' }}
/>`

	let colors = $state<ColorsProp | null>(['#2b2d42', '#8d99ae', '#edf2f4', '#ef233c', '#d90429', '#fca311'])
	let selectedColor = $state<ColorValue | null>('#ef233c')

	const colorGroups: ColorsProp = [
		{ name: 'Warm', colors: ['#865c54', '#8f5447', '#a65846', '#a9715e', '#ad8c72', '#c2b091', '#e0cdb4'] },
		{ name: 'Cool', colors: ['#172b41', '#32465c', '#617899', '#9ba2bc', '#847999', '#50526a'] },
		{ name: 'Accent', colors: ['#f56476', '#e43f6f', '#be3e82'] },
	]
	let groupedColor = $state<ColorValue | null>('#617899')
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
				data-palette-theme={getPaletteTheme()}
			/>
		</div>
		<div class="palette-frame">
			<Palette
				colors={colorGroups}
				bind:selectedColor={groupedColor}
				numColumns={4}
				labels={{ slots: 'Grouped color slots' }}
				data-palette-theme={getPaletteTheme()}
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
