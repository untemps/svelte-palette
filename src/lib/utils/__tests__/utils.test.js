import { describe, expect, test } from 'vitest'

import { calculateColors, calculateNumColumns, isColorValid } from '../utils.js'

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
			[colorLength, params, , params.numColumns],
			[colorLength, { ...params, numColumns: 30 }, , 30],
			[colorLength, { ...params, numColumns: 0 }, , colorLength],
			[colorLength, { ...params, showTransparentSlot: true }, , params.numColumns],
			[colorLength, { ...params, numColumns: 30, showTransparentSlot: true }, , 30],
			[colorLength, { ...params, numColumns: 0, showTransparentSlot: true }, , colorLength + 1],
			[colorLength, { ...params, numColumns: colorLength, showTransparentSlot: true }, , colorLength],
			[colorLength, { ...params, isCompact: true }, , 0],
			[colorLength, { ...params, isCompact: true, compactColorIndices: [0, 1] }, , 2],
			[colorLength, { ...params, isCompact: true, compactColorIndices: [0, 1], showTransparentSlot: true }, , 3],
			[0, params, , params.numColumns],
			[0, params, { minNumColumns: 10 }, params.numColumns],
			[0, { ...params, showTransparentSlot: true }, , params.numColumns],
			[0, { ...params, numColumns: 0, showTransparentSlot: true }, { minNumColumns: 10 }, 10],
			[colorLength, null, , 1],
			[-1, null, , 1],
			[colorLength, { ...params, numColumns: -1 }, , colorLength],
		])('colorLength:%j, params:%j, options:%j, expected:%j', (colorLength, params, options, expected) => {
			expect(calculateNumColumns(colorLength, params, options)).toBe(expected)
		})
	})

	describe('isColorValid', () => {
		test.each([
			['#ff0', true],
			['ff0', true],
			['ff', false],
			['fff', true],
			['ffff', false],
			['fffff', false],
			['ffffff', true],
			['fffffff', false],
			['ffffffff', true],
			['fffffffff', false],
			['ffg', false],
			['.ff0', false],
			['ff0ff000.', false],
			[null, false],
			[undefined, false],
			[0, false],
		])('color:%j, expected:%j', (color, expected) => {
			expect(isColorValid(color)).toBe(expected)
		})
	})
})
