import { DEFAULT_LABELS } from '../labels'

test('Holds the canonical built-in label strings', () => {
	expect(DEFAULT_LABELS).toEqual({
		slots: 'Color slots',
		loader: 'Loading colors',
		error: 'Colors failed to load',
		transparentSlot: 'Transparent slot',
		compact: 'Compact the palette',
		enlarge: 'Enlarge the palette',
		inputHex: 'Enter a hex color value',
		inputHexError: 'The value must be a valid hex color',
		submitHex: 'Submit the hex color value',
		eyeDropper: 'Pick a color from the screen',
		tools: 'Palette tools',
		settings: 'Go to settings',
		trash: 'Delete color',
	})
})
