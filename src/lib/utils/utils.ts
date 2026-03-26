import { extractByIndices } from '@untemps/utils/array/extractByIndices'

import type { ColorItem, ColorGroup, NormalizedColorGroup, ColorsInput } from '../types.js'

export const transformColors = ($colors: (string | ColorItem)[]): ColorItem[] => {
	return $colors.map((color) => {
		const name = (color as ColorItem).name ?? null
		const value = (color as ColorItem).value ?? (color as string)
		return {
			...(!!name && { name }),
			value,
		}
	})
}

type CalculateColorsParams = {
	isCompact?: boolean
	compactColorIndices?: number[] | null
	allowDuplicates?: boolean
	maxColors?: number
}

export const calculateColors = (
	$colors: ColorsInput | null | undefined | unknown,
	$params: CalculateColorsParams | null
): ColorItem[] => {
	if (!$colors || !Array.isArray($colors)) {
		$colors = [] as (string | ColorItem)[]
	}
	const colors = $colors as (string | ColorItem)[]
	if (!$params) {
		$params = { isCompact: false, compactColorIndices: [], allowDuplicates: true, maxColors: colors.length }
	}
	if (!$params.compactColorIndices) {
		$params = { ...$params, compactColorIndices: [] }
	}
	if (($params.maxColors ?? 0) < 0) {
		$params = { ...$params, maxColors: colors.length }
	}

	let result: ColorItem[] = transformColors(colors)

	if (!!$params.isCompact) {
		result = extractByIndices(result, $params.compactColorIndices ?? [])
	}
	if (!$params.allowDuplicates) {
		result = result.filter((item, index) => result.findIndex(({ value }) => value === item.value) === index)
	}
	if (result.length > ($params.maxColors ?? Infinity)) {
		result = result.slice(0, $params.maxColors)
	}
	return result
}

type CalculateNumColumnsParams = {
	isCompact?: boolean
	compactColorIndices?: number[] | null
	showTransparentSlot?: boolean
	numColumns?: number
	maxColumns?: number
}

type CalculateNumColumnsOptions = {
	minNumColumns?: number
}

export const calculateNumColumns = (
	$colorLength: number,
	$params: CalculateNumColumnsParams | null,
	$options?: CalculateNumColumnsOptions
): number => {
	const MIN_NUM_COLUMNS = 5
	$colorLength = Math.max($colorLength + +($params?.showTransparentSlot ?? false), 0)
	if (!$params) {
		$params = { isCompact: false, compactColorIndices: [], showTransparentSlot: false, numColumns: 1 }
	}
	if (!!$params.isCompact) {
		return Math.min(
			$colorLength,
			+($params.compactColorIndices?.length ?? 0) + +($params.showTransparentSlot ?? false)
		)
	}
	if (($params.numColumns ?? 0) > 0) {
		return Math.max($params.numColumns ?? 0, 0)
	}
	const cols = Math.max($colorLength, $options?.minNumColumns ?? MIN_NUM_COLUMNS)
	return ($params.maxColumns ?? 0) > 0 ? Math.min(cols, $params.maxColumns!) : cols
}

export const isColorGroups = ($colors: unknown): $colors is ColorGroup[] => {
	return Array.isArray($colors) && $colors.length > 0 && Array.isArray(($colors[0] as ColorGroup)?.colors)
}

export const calculateColorGroups = (
	$groups: ColorGroup[] | null | undefined | unknown,
	$params: CalculateColorsParams | null
): NormalizedColorGroup[] => {
	if (!$groups || !Array.isArray($groups)) {
		return []
	}
	return ($groups as ColorGroup[])
		.filter((group) => Array.isArray(group?.colors))
		.map((group) => ({
			...(group.name != null && { name: group.name }),
			colors: calculateColors(group.colors, $params),
		}))
}

export const COLOR_REGEX = /^#?(([0-9a-f]{2}){3,4}|([0-9a-f]){3})$/i

export const isColorValid = ($color: unknown): boolean => {
	return COLOR_REGEX.test($color as string)
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
