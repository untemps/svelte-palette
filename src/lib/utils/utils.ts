import { extractByIndices } from '@untemps/utils/array/extractByIndices'

import { CSS_NAMED_COLORS } from './namedColors'

import type { ColorGroup, ColorInput, ColorValue, InputType } from '../types'

/**
 * A color normalized to an object shape, as consumed internally by the components.
 */
export interface NormalizedColor {
	name?: string
	value: ColorValue
}

/**
 * A color group whose colors have been normalized.
 */
export interface NormalizedColorGroup {
	name?: string
	colors: NormalizedColor[]
}

export interface CalculateColorsParams {
	isCompact?: boolean
	compactColorIndices?: number[] | null
	allowDuplicates?: boolean
	maxColors?: number
}

export interface CalculateNumColumnsParams {
	isCompact?: boolean
	compactColorIndices?: number[] | null
	showTransparentSlot?: boolean
	numColumns?: number
	maxColumns?: number
}

export interface CalculateNumColumnsOptions {
	minNumColumns?: number
}

export const transformColors = ($colors: ReadonlyArray<ColorInput | NormalizedColor>): NormalizedColor[] => {
	return $colors.map((color) => {
		const isObject = typeof color === 'object' && color !== null
		const name = isObject ? (color.name ?? null) : null
		const value = (isObject ? color.value : undefined) ?? color
		return {
			...(!!name && { name }),
			value,
		} as NormalizedColor
	})
}

export const calculateColors = (
	$colors: ReadonlyArray<ColorInput | NormalizedColor> | null | undefined,
	$params?: CalculateColorsParams
): NormalizedColor[] => {
	const source = !$colors || !Array.isArray($colors) ? [] : $colors
	let params: CalculateColorsParams = $params ?? {
		isCompact: false,
		compactColorIndices: [],
		allowDuplicates: true,
		maxColors: source.length,
	}
	if (!params.compactColorIndices) {
		params = { ...params, compactColorIndices: [] }
	}
	if ((params.maxColors ?? 0) < 0) {
		params = { ...params, maxColors: source.length }
	}

	let colors = transformColors(source)

	if (params.isCompact) {
		colors = extractByIndices(colors, params.compactColorIndices ?? [])
	}
	if (!params.allowDuplicates) {
		colors = colors.filter((item, index) => colors.findIndex(({ value }) => value === item.value) === index)
	}
	if (params.maxColors !== undefined && colors.length > params.maxColors) {
		colors = colors.slice(0, params.maxColors)
	}
	return colors
}

export const calculateNumColumns = (
	$colorLength: number,
	$params?: CalculateNumColumnsParams,
	$options?: CalculateNumColumnsOptions
): number => {
	const MIN_NUM_COLUMNS = 5
	const colorLength = Math.max($colorLength + Number($params?.showTransparentSlot), 0)
	const params: CalculateNumColumnsParams = $params ?? {
		isCompact: false,
		compactColorIndices: [],
		showTransparentSlot: false,
		numColumns: 1,
	}
	if (params.isCompact) {
		return Math.min(colorLength, Number(params.compactColorIndices?.length) + Number(params.showTransparentSlot))
	}
	if ((params.numColumns ?? 0) > 0) {
		return Math.max(params.numColumns ?? 0, 0)
	}
	const cols = Math.max(colorLength, $options?.minNumColumns ?? MIN_NUM_COLUMNS)
	return (params.maxColumns ?? 0) > 0 ? Math.min(cols, params.maxColumns ?? 0) : cols
}

export const isColorGroups = ($colors: unknown): $colors is ColorGroup[] => {
	return Array.isArray($colors) && $colors.length > 0 && Array.isArray(($colors[0] as ColorGroup | undefined)?.colors)
}

export const calculateColorGroups = (
	$groups: ColorGroup[] | null | undefined,
	$params?: CalculateColorsParams
): NormalizedColorGroup[] => {
	if (!$groups || !Array.isArray($groups)) {
		return []
	}
	return $groups
		.filter((group) => Array.isArray(group?.colors))
		.map((group) => ({
			...(group.name != null && { name: group.name }),
			colors: calculateColors(group.colors, $params),
		}))
}

export const COLOR_REGEX = /^#?(([0-9a-f]{2}){3,4}|([0-9a-f]){3,4})$/i

export interface ParsedColor {
	r: number
	g: number
	b: number
	a: number
}

const clamp = ($value: number, $min: number, $max: number): number => Math.min(Math.max($value, $min), $max)

const toHex2 = ($value: number): string => clamp(Math.round($value), 0, 255).toString(16).padStart(2, '0')

const parseHex = ($hex: string): ParsedColor | null => {
	const hex = $hex.replace(/^#/, '')
	if (!/^[0-9a-f]+$/i.test(hex)) return null
	let r: number
	let g: number
	let b: number
	let a = 1
	switch (hex.length) {
		case 3:
		case 4:
			r = parseInt(hex[0] + hex[0], 16)
			g = parseInt(hex[1] + hex[1], 16)
			b = parseInt(hex[2] + hex[2], 16)
			if (hex.length === 4) a = parseInt(hex[3] + hex[3], 16) / 255
			break
		case 6:
		case 8:
			r = parseInt(hex.slice(0, 2), 16)
			g = parseInt(hex.slice(2, 4), 16)
			b = parseInt(hex.slice(4, 6), 16)
			if (hex.length === 8) a = parseInt(hex.slice(6, 8), 16) / 255
			break
		default:
			return null
	}
	return { r, g, b, a }
}

const splitColorArgs = ($inner: string): string[] | null => {
	const inner = $inner.trim()
	if (!inner) return null
	let tokens: string[]
	if (inner.includes(',')) {
		if (inner.includes('/')) return null
		tokens = inner.split(',').map(($part) => $part.trim())
	} else {
		const [main, alpha, ...rest] = inner.split('/').map(($part) => $part.trim())
		if (rest.length) return null
		const components = main.split(/\s+/).filter(Boolean)
		// In space-separated syntax alpha is introduced by `/`; a bare fourth value
		// (e.g. `rgb(255 0 0 0)`) is not valid alpha, so reject any extra component.
		if (components.length > 3) return null
		tokens = alpha !== undefined ? [...components, alpha] : components
	}
	return tokens.every(($token) => $token.length > 0 && !/\s/.test($token)) ? tokens : null
}

const parseChannel = ($token: string): number | null => {
	if ($token.endsWith('%')) {
		const percent = parseFloat($token)
		return Number.isNaN(percent) ? null : clamp(Math.round((percent / 100) * 255), 0, 255)
	}
	const value = Number($token)
	return Number.isFinite(value) ? clamp(Math.round(value), 0, 255) : null
}

const parseAlpha = ($token: string): number | null => {
	if ($token.endsWith('%')) {
		const percent = parseFloat($token)
		return Number.isNaN(percent) ? null : clamp(percent / 100, 0, 1)
	}
	const value = Number($token)
	return Number.isFinite(value) ? clamp(value, 0, 1) : null
}

const parseHue = ($token: string): number | null => {
	const match = $token.match(/^([+-]?(?:\d*\.\d+|\d+))(deg|grad|rad|turn)?$/i)
	if (!match) return null
	let value = parseFloat(match[1])
	switch ((match[2] ?? 'deg').toLowerCase()) {
		case 'grad':
			value *= 360 / 400
			break
		case 'rad':
			value *= 180 / Math.PI
			break
		case 'turn':
			value *= 360
			break
	}
	return value
}

const parsePercent = ($token: string): number | null => {
	if (!$token.endsWith('%')) return null
	const percent = parseFloat($token)
	return Number.isNaN(percent) ? null : clamp(percent, 0, 100)
}

const hslToRgb = ($h: number, $s: number, $l: number): Pick<ParsedColor, 'r' | 'g' | 'b'> => {
	const hue = ((($h % 360) + 360) % 360) / 360
	const saturation = $s / 100
	const lightness = $l / 100
	if (saturation === 0) {
		const gray = Math.round(lightness * 255)
		return { r: gray, g: gray, b: gray }
	}
	const q = lightness < 0.5 ? lightness * (1 + saturation) : lightness + saturation - lightness * saturation
	const p = 2 * lightness - q
	const toChannel = ($t: number): number => {
		let t = $t
		if (t < 0) t += 1
		if (t > 1) t -= 1
		if (t < 1 / 6) return p + (q - p) * 6 * t
		if (t < 1 / 2) return q
		if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
		return p
	}
	return {
		r: Math.round(toChannel(hue + 1 / 3) * 255),
		g: Math.round(toChannel(hue) * 255),
		b: Math.round(toChannel(hue - 1 / 3) * 255),
	}
}

const parseRgb = ($color: string): ParsedColor | null => {
	const match = $color.match(/^rgba?\(\s*([^)]+?)\s*\)$/i)
	if (!match) return null
	const tokens = splitColorArgs(match[1])
	if (!tokens || tokens.length < 3 || tokens.length > 4) return null
	const r = parseChannel(tokens[0])
	const g = parseChannel(tokens[1])
	const b = parseChannel(tokens[2])
	if (r === null || g === null || b === null) return null
	let a = 1
	if (tokens.length === 4) {
		const alpha = parseAlpha(tokens[3])
		if (alpha === null) return null
		a = alpha
	}
	return { r, g, b, a }
}

const parseHsl = ($color: string): ParsedColor | null => {
	const match = $color.match(/^hsla?\(\s*([^)]+?)\s*\)$/i)
	if (!match) return null
	const tokens = splitColorArgs(match[1])
	if (!tokens || tokens.length < 3 || tokens.length > 4) return null
	const h = parseHue(tokens[0])
	const s = parsePercent(tokens[1])
	const l = parsePercent(tokens[2])
	if (h === null || s === null || l === null) return null
	let a = 1
	if (tokens.length === 4) {
		const alpha = parseAlpha(tokens[3])
		if (alpha === null) return null
		a = alpha
	}
	return { ...hslToRgb(h, s, l), a }
}

export const parseColor = ($color: unknown): ParsedColor | null => {
	if (typeof $color !== 'string') return null
	const color = $color.trim()
	if (!color) return null
	if (COLOR_REGEX.test(color)) return parseHex(color)
	if (/^rgba?\(/i.test(color)) return parseRgb(color)
	if (/^hsla?\(/i.test(color)) return parseHsl(color)
	// Guard the lookup against inherited `Object.prototype` keys (`constructor`, `__proto__`, …):
	// a bare object literal resolves those to functions/objects, which would throw in `parseHex`.
	const named = CSS_NAMED_COLORS[color.toLowerCase()]
	return typeof named === 'string' ? parseHex(named) : null
}

export const isColorValid = ($color: unknown): boolean => parseColor($color) !== null

export const normalizeColor = ($color: string): string => {
	if (typeof $color === 'string') {
		const trimmed = $color.trim()
		if (COLOR_REGEX.test(trimmed)) return trimmed.replace(COLOR_REGEX, '#$1')
	}
	const parsed = parseColor($color)
	if (!parsed) return $color
	const { r, g, b, a } = parsed
	const hex = `#${toHex2(r)}${toHex2(g)}${toHex2(b)}`
	const alpha = Math.round(a * 255)
	return alpha < 255 ? `${hex}${toHex2(alpha)}` : hex
}

export const PALETTE_INPUT_TYPES = ['text', 'color'] as const satisfies readonly InputType[]

export const normalizeInputType = ($type: string | null | undefined): InputType =>
	PALETTE_INPUT_TYPES.includes($type as InputType) ? ($type as InputType) : 'text'
