<script lang="ts">
	import { Palette } from '$lib'

	import type { ColorsProp, ColorValue } from '$lib/types'

	let colors = $state<ColorsProp | null>([
		'#865C54',
		'#8F5447',
		'#A65846',
		'#A9715E',
		'#AD8C72',
		'#C2B091',
		'#172B41',
		'#32465C',
		'#617899',
		'#9BA2BC',
	])
	let selectedColor = $state<ColorValue | null>('#865C54')

	// data-palette-theme drives the built-in dark mode:
	// - "auto" (or absent) follows the OS via prefers-color-scheme
	// - "light" forces the light tokens
	// - "dark" forces the dark tokens regardless of the OS preference
	let theme = $state<'auto' | 'light' | 'dark'>('auto')

	type TokenOverrides = Record<string, string>

	const presets: { name: string; tokens: TokenOverrides }[] = [
		{ name: 'Defaults', tokens: {} },
		{
			name: 'Ocean',
			tokens: {
				'--palette-surface': '#0b1f2a',
				'--palette-text': '#e6f1f5',
				'--palette-border': '#1c3a48',
				'--palette-divider': '#1c3a48',
				'--palette-icon': '#9fd3e0',
				'--palette-input-surface': '#12303d',
				'--palette-input-text': '#cfe8ef',
				'--palette-focus-ring': '#7fd7ff',
			},
		},
		{
			name: 'Sand',
			tokens: {
				'--palette-surface': '#f6efe3',
				'--palette-text': '#4a3b2a',
				'--palette-border': '#e0d2ba',
				'--palette-divider': '#e6dac6',
				'--palette-icon': '#8a7350',
				'--palette-radius': '0.75rem',
				'--palette-input-surface': '#fffaf0',
			},
		},
	]

	let selectedPreset = $state(0)

	const _tokensToStyle = (tokens: TokenOverrides): string =>
		Object.entries(tokens)
			.map(([name, value]) => `${name}: ${value}`)
			.join('; ')

	let paletteStyle = $derived(_tokensToStyle(presets[selectedPreset].tokens))
</script>

<main class="example8">
	<section class="controls" aria-label="Theming controls">
		<fieldset>
			<legend>Theme mode <code>data-palette-theme</code></legend>
			<label><input type="radio" name="theme" value="auto" bind:group={theme} /> auto (follows OS)</label>
			<label><input type="radio" name="theme" value="light" bind:group={theme} /> light</label>
			<label><input type="radio" name="theme" value="dark" bind:group={theme} /> dark</label>
		</fieldset>

		<fieldset>
			<legend>Token preset <code>style="--palette-*"</code></legend>
			{#each presets as preset, index}
				<label
					><input type="radio" name="preset" value={index} bind:group={selectedPreset} /> {preset.name}</label
				>
			{/each}
		</fieldset>

		{#if paletteStyle}
			<pre class="snippet">&lt;Palette style="{paletteStyle}" /&gt;</pre>
		{:else}
			<pre class="snippet">&lt;Palette /&gt;  &lt;!-- default tokens --&gt;</pre>
		{/if}
	</section>

	<section class="stage">
		<Palette
			bind:colors
			bind:selectedColor
			data-palette-theme={theme}
			style={paletteStyle}
			showInput
			deletionMode="tooltip"
		/>
	</section>
</main>

<style>
	.example8 {
		min-height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2rem;
		padding: 2rem 1rem;
		background-color: #8a8f98;
		font-family: Helvetica, sans-serif;
	}

	.controls {
		width: 100%;
		max-width: 40rem;
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		align-items: flex-start;
	}

	.controls fieldset {
		flex: 1 1 14rem;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		margin: 0;
		padding: 0.75rem 1rem;
		border: 1px solid rgba(255, 255, 255, 0.4);
		border-radius: 0.5rem;
		background-color: rgba(255, 255, 255, 0.12);
		color: #fff;
		font-size: 0.85rem;
	}

	.controls legend {
		font-weight: 600;
	}

	.controls label {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		cursor: pointer;
	}

	.controls code {
		font-family: monospace;
		font-size: 0.75rem;
		opacity: 0.85;
	}

	.snippet {
		flex-basis: 100%;
		margin: 0;
		padding: 0.6rem 0.8rem;
		overflow-x: auto;
		border-radius: 0.5rem;
		background-color: rgba(0, 0, 0, 0.55);
		color: #f5f5f5;
		font-size: 0.75rem;
	}

	.stage {
		width: 100%;
		max-width: 22rem;
		border-radius: 0.75rem;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
	}

	/* Round the palette itself instead of clipping the stage: an overflow:hidden
	   ancestor would hide the inline (portal:false) deletion tooltip. */
	.stage :global(.palette[data-palette]) {
		border-radius: inherit;
	}
</style>
