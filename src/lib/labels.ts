import type { PaletteLabels } from './types'

/**
 * The built-in text and accessibility labels used by `Palette` and its default primitives. Spread and override
 * a subset through the `labels` prop of `Palette` (see the {@link PaletteLabels} interface) to localize the
 * palette or tweak individual strings without replacing any snippet.
 */
export const DEFAULT_LABELS: Readonly<PaletteLabels> = Object.freeze({
	slots: 'Color slots',
	loader: 'Loading colors',
	error: 'Colors failed to load',
	transparentSlot: 'Transparent slot',
	compact: 'Compact the palette',
	enlarge: 'Enlarge the palette',
	inputColor: 'Enter a color value',
	inputColorError: 'The value must be a valid color',
	submitColor: 'Submit the color value',
	eyeDropper: 'Pick a color from the screen',
	tools: 'Palette tools',
	settings: 'Go to settings',
	trash: 'Delete color',
})
