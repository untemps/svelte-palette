import { describe, expect, test } from 'vitest'

import { calculateColors, calculateNumColumns } from '../utils.js'

describe('utils', () => {
	describe('calculateColors', () => {
		const colors = [1, 2, 3, 4, 5]
		const params = {
			isCompact: false,
			compactColorIndices: [],
			allowDuplicates: true,
			maxColors: 5,
		}

		test.each([
			[colors, params, colors],
			[colors, { ...params, isCompact: true }, []],
			[colors, { ...params, isCompact: false, compactColorIndices: [0, 4] }, colors],
			[colors, { ...params, isCompact: true, compactColorIndices: [0, 4] }, [1, 5]],
			[colors, { ...params, isCompact: true, compactColorIndices: null }, []],
			[colors, { ...params, allowDuplicates: false }, colors],
			[[1, 1, 1], { ...params, allowDuplicates: false }, [1]],
			[[1, 1, 1], { ...params, allowDuplicates: true }, [1, 1, 1]],
			[colors, { ...params, maxColors: 8 }, colors],
			[colors, { ...params, maxColors: 3 }, [1, 2, 3]],
			[[1, 1, 1], { ...params, allowDuplicates: false, maxColors: 2 }, [1]],
			[[1, 1, 1], { ...params, allowDuplicates: true, maxColors: 2 }, [1, 1]],
			[[1, 1, 1], null, [1, 1, 1]],
			[null, params, []],
			[null, null, []],
			[[], params, []],
		])('colors:%j, params:%j, expected: %j', (colors, params, expected) => {
			expect(calculateColors(colors, params)).toEqual(expected)
		})
	})

	describe('calculateNumColumns', () => {
		const colorLength = 25
		const params = {
			isCompact: false,
			compactColorIndices: [],
			showTransparentSlot: false,
			numColumns: 5,
		}

		test.each([
			[colorLength, params, params.numColumns],
			[colorLength, { ...params, numColumns: 30 }, colorLength],
			[colorLength, { ...params, showTransparentSlot: true }, params.numColumns],
			[colorLength, { ...params, numColumns: 30, showTransparentSlot: true }, colorLength + 1],
			[colorLength, { ...params, numColumns: colorLength, showTransparentSlot: true }, colorLength],
			[colorLength, { ...params, isCompact: true }, params.compactColorIndices.length],
			[colorLength, { ...params, isCompact: true, compactColorIndices: [0, 1] }, 2],
			[colorLength, { ...params, isCompact: true, compactColorIndices: [0, 1], showTransparentSlot: true }, 3],
			[
				colorLength,
				{ ...params, isCompact: true, compactColorIndices: [2, 7, 13, 20], showTransparentSlot: true },
				5,
			],
			[2, { ...params, isCompact: true, compactColorIndices: [0, 1, 2] }, 2],
			[colorLength, { ...params, compactColorIndices: [0, 1] }, params.numColumns],
			[-1, params, 0],
			[0, params, 0],
			[0, { ...params, showTransparentSlot: true }, 1],
			[colorLength, null, 1],
			[-1, null, 0],
			[colorLength, { ...params, numColumns: -1 }, colorLength],
		])('colorLength:%j, params:%j, expected:%j', (colorLength, params, expected) => {
			expect(calculateNumColumns(colorLength, params)).toBe(expected)
		})
	})
})
