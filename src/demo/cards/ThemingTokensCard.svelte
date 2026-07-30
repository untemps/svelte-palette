<script lang="ts">
	import { Palette } from '$lib'
	import type { ColorsProp } from '$lib/types'

	import Card from '../components/Card.svelte'
	import { getPaletteTheme } from '../lib/theme.svelte'

	const DESCRIPTION =
		'Restyle the palette through its <code>--palette-*</code> custom properties. They are declared at zero specificity, so an inline <code>style</code> or a class overrides any of them without <code>!important</code>.'

	const CODE = `<Palette
	style="--palette-surface:#0b1f2a; --palette-text:#e6f1f5;"
/>`

	type Preset = { name: string; tokens: Record<string, string> }

	const PRESETS: Preset[] = [
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

	const colors: ColorsProp = ['#e63946', '#f1faee', '#a8dadc', '#457b9d', '#1d3557', '#ffb703']

	let selected = $state(0)

	const toStyle = (tokens: Record<string, string>): string =>
		Object.entries(tokens)
			.map(([name, value]) => `${name}: ${value}`)
			.join('; ')

	let paletteStyle = $derived(toStyle(PRESETS[selected].tokens))
</script>

<Card
	title="Theming with tokens"
	badge="--palette-*"
	description={DESCRIPTION}
	code={CODE}
	docHref="https://github.com/untemps/svelte-palette#theming-with-css-custom-properties"
>
	<div class="seg" role="group" aria-label="Token preset">
		{#each PRESETS as preset, index (preset.name)}
			<button type="button" class="seg__btn" aria-pressed={selected === index} onclick={() => (selected = index)}>
				{preset.name}
			</button>
		{/each}
	</div>

	<div class="card__stage">
		<div class="palette-frame">
			<Palette {colors} showInput numColumns={6} style={paletteStyle} data-palette-theme={getPaletteTheme()} />
		</div>
	</div>

	<p class="readout">
		<span class="readout__label">style</span>
		<span class="readout__value">{paletteStyle || '(default tokens)'}</span>
	</p>
</Card>
