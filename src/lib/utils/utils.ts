import { extractByIndices } from '@untemps/utils/array/extractByIndices'

import type { ColorGroup, ColorInput, ColorValue } from '../types'

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

export const COLOR_REGEX = /^#?(([0-9a-f]{2}){3,4}|([0-9a-f]){3})$/i

export const isColorValid = ($color: string): boolean => {
	return COLOR_REGEX.test($color)
}

export const normalizeColor = ($color: string): string => {
	if (isColorValid($color)) return $color
	const match = $color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
	if (match) {
		const [, r, g, b] = match
		return `#${[r, g, b].map((v) => parseInt(v).toString(16).padStart(2, '0')).join('')}`
	}
	return $color
}
