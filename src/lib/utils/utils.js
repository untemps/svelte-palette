import { extractByIndices } from '@untemps/utils/array/extractByIndices'

export const calculateColors = ($colors, $params) => {
	if (!$colors) {
		$colors = []
	}
	if (!$params) {
		$params = { isCompact: false, compactColorIndices: [], allowDuplicates: true, maxColors: $colors.length }
	}
	if (!$params.compactColorIndices) {
		$params = { ...$params, compactColorIndices: [] }
	}
	if ($params.maxColors < 0) {
		$params = { ...$params, maxColors: $colors.length }
	}

	if (!!$params.isCompact) {
		$colors = extractByIndices($colors, $params.compactColorIndices)
	}
	if (!$params.allowDuplicates) {
		$colors = $colors.filter((item, index) => $colors.indexOf(item) === index)
	}
	if ($colors.length > $params.maxColors) {
		$colors = $colors.slice(0, $params.maxColors)
	}
	return $colors
}

export const calculateNumColumns = ($colorLength, $params) => {
	if ($colorLength <= 0) {
		$colorLength = 1
	}
	if (!$params) {
		$params = { isCompact: false, compactColorIndices: [], showTransparentSlot: false, numColumns: 1 }
	}
	if (!!$params.showTransparentSlot) {
		$colorLength = $colorLength + 1
	}
	if ($params.numColumns <= 0) {
		$params = { ...$params, numColumns: $colorLength }
	}
	if (!!$params.isCompact) {
		$colorLength = Math.min($colorLength, +$params.compactColorIndices?.length + +$params.showTransparentSlot)
	}
	return Math.min($colorLength, $params.numColumns)
}
