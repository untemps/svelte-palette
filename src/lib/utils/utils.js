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

export const calculateNumColumns = ($colorLength, $params, $options) => {
	const MIN_NUM_COLUMNS = 5
	$colorLength = Math.max($colorLength + +$params?.showTransparentSlot, 0)
	if (!$params) {
		$params = { isCompact: false, compactColorIndices: [], showTransparentSlot: false, numColumns: 1 }
	}
	if (!!$params.isCompact) {
		return Math.min($colorLength, +$params.compactColorIndices?.length + +$params.showTransparentSlot)
	}
	return $params.numColumns > 0 ? Math.max($params.numColumns, 0) : Math.max($colorLength, $options?.minNumColumns ?? MIN_NUM_COLUMNS)
}
