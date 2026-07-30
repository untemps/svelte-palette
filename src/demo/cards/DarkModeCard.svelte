<script lang="ts">
	import { Palette } from '$lib'
	import type { ColorsProp } from '$lib/types'

	import Card from '../components/Card.svelte'

	const DESCRIPTION =
		'Built-in dark mode is opt-out via <code>data-palette-theme</code>: <code>auto</code> follows the OS through <code>prefers-color-scheme</code>, while <code>light</code> and <code>dark</code> force a scheme regardless.'

	const CODE = `<Palette data-palette-theme="auto" />
<!-- "auto" (default) · "light" · "dark" -->`

	const MODES = ['auto', 'light', 'dark'] as const
	type Mode = (typeof MODES)[number]

	const colors: ColorsProp = ['#264653', '#2a9d8f', '#e9c46a', '#f4a261', '#e76f51', '#8ab17d']
	let mode = $state<Mode>('auto')
</script>

<Card
	title="Dark mode"
	badge="data-palette-theme"
	description={DESCRIPTION}
	code={CODE}
	docHref="https://github.com/untemps/svelte-palette#dark-mode"
>
	<div class="seg" role="group" aria-label="Palette theme">
		{#each MODES as option (option)}
			<button type="button" class="seg__btn" aria-pressed={mode === option} onclick={() => (mode = option)}>
				{option}
			</button>
		{/each}
	</div>

	<div class="card__stage">
		<div class="palette-frame">
			<Palette {colors} showInput numColumns={6} data-palette-theme={mode} />
		</div>
	</div>

	<p class="hint">
		Set to <code>{mode}</code> — <code>auto</code> tracks the OS through <code>prefers-color-scheme</code>, while
		<code>light</code>
		and <code>dark</code> pin the scheme.
	</p>
</Card>
