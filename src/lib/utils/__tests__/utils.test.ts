import {
	calculateColorGroups,
	calculateColors,
	calculateNumColumns,
	isColorGroups,
	isColorValid,
	normalizeColor,
	normalizeInputType,
	parseColor,
	transformColors,
} from '../utils.js'

describe('utils', () => {
	describe('transformColors', () => {
		const colorStrings = ['#123456', '#345612', '#456123']
		const colorsObjects = [
			{
				name: 'Foo',
				value: '#123456',
			},
			{
				name: 'Bar',
				value: '#345612',
			},
			{
				name: 'Gag',
				value: '#456123',
			},
		]

		test.each([
			[
				colorStrings,
				[
					{
						value: '#123456',
					},
					{
						value: '#345612',
					},
					{
						value: '#456123',
					},
				],
			],
			[colorsObjects, colorsObjects],
			[
				[
					'#123456',
					{
						name: 'Bar',
						value: '#345612',
					},
					{
						value: '#456123',
					},
				],
				[
					{
						value: '#123456',
					},
					{
						name: 'Bar',
						value: '#345612',
					},
					{
						value: '#456123',
					},
				],
			],
		])('colors:%j, expected: %j', (colors, expected) => {
			expect(transformColors(colors)).toEqual(expected)
		})
	})

	describe('calculateColors', () => {
		const colors = ['#123456', '#345612', '#456123', '#245136', '#425136']
		const params = {
			isCompact: false,
			compactColorIndices: [],
			allowDuplicates: true,
			maxColors: 5,
		}
		const colorsObjects = [
			{
				value: colors[0],
			},
			{
				value: colors[1],
			},
			{
				value: colors[2],
			},
			{
				value: colors[3],
			},
			{
				value: colors[4],
			},
		]

		test.each([
			[colors, params, colorsObjects],
			[colors, { ...params, isCompact: true }, []],
			[colors, { ...params, isCompact: false, compactColorIndices: [0, 4] }, colorsObjects],
			[
				colors,
				{ ...params, isCompact: true, compactColorIndices: [0, 4] },
				[{ value: colors[0] }, { value: colors[4] }],
			],
			[colors, { ...params, isCompact: true, compactColorIndices: null }, []],
			[colors, { ...params, allowDuplicates: false }, colorsObjects],
			[[1, 1, 1], { ...params, allowDuplicates: false }, [{ value: 1 }]],
			[[1, 1, 1], { ...params, allowDuplicates: true }, [{ value: 1 }, { value: 1 }, { value: 1 }]],
			[colors, { ...params, maxColors: 8 }, colorsObjects],
			[colors, { ...params, maxColors: 3 }, colorsObjects.slice(0, 3)],
			[[1, 1, 1], { ...params, allowDuplicates: false, maxColors: 2 }, [{ value: 1 }]],
			[[1, 1, 1], { ...params, allowDuplicates: true, maxColors: 2 }, [{ value: 1 }, { value: 1 }]],
			[[1, 1, 1], null, [{ value: 1 }, { value: 1 }, { value: 1 }]],
			[null, params, []],
			[null, null, []],
			[[], params, []],
			['[]', params, []],
			[1, params, []],
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
			[colorLength, { ...params, numColumns: 0, maxColumns: 10 }, , 10],
			[colorLength, { ...params, numColumns: 0, maxColumns: 30 }, , colorLength],
			[colorLength, { ...params, numColumns: 0, maxColumns: 0 }, , colorLength],
			[colorLength, { ...params, numColumns: 5, maxColumns: 3 }, , params.numColumns],
			// numColumns is returned verbatim and is never clamped to maxColors (README contract, #197)
			[colorLength, { ...params, numColumns: 30, maxColors: 4 }, , 30],
			[colorLength, { ...params, numColumns: 0, maxColors: 4 }, , colorLength],
		])('colorLength:%j, params:%j, options:%j, expected:%j', (colorLength, params, options, expected) => {
			expect(calculateNumColumns(colorLength, params, options)).toBe(expected)
		})
	})

	describe('isColorGroups', () => {
		test.each([
			[[], false],
			[['#ff0', '#0ff'], false],
			[[{ value: '#ff0' }], false],
			[[{ name: 'Yellows', colors: ['#ff0'] }], true],
			[[{ colors: ['#ff0'] }, { name: 'Blues', colors: ['#00f'] }], true],
			[null, false],
			[undefined, false],
			[1, false],
		])('colors:%j, expected:%j', (colors, expected) => {
			expect(isColorGroups(colors)).toBe(expected)
		})
	})

	describe('calculateColorGroups', () => {
		const params = {
			isCompact: false,
			compactColorIndices: [],
			allowDuplicates: true,
			maxColors: 5,
		}

		test.each([
			[
				[
					{ name: 'Reds', colors: ['#f00', '#f11'] },
					{ name: 'Blues', colors: ['#00f', '#11f'] },
				],
				params,
				[
					{ name: 'Reds', colors: [{ value: '#f00' }, { value: '#f11' }] },
					{ name: 'Blues', colors: [{ value: '#00f' }, { value: '#11f' }] },
				],
			],
			[[{ colors: ['#f00'] }], params, [{ colors: [{ value: '#f00' }] }]],
			[
				[{ name: 'Reds', colors: ['#f00', '#f00'] }, { colors: [] }],
				{ ...params, allowDuplicates: false },
				[{ name: 'Reds', colors: [{ value: '#f00' }] }, { colors: [] }],
			],
			[
				[{ name: 'Reds', colors: ['#f00', '#f11', '#f22'] }],
				{ ...params, maxColors: 2 },
				[{ name: 'Reds', colors: [{ value: '#f00' }, { value: '#f11' }] }],
			],
			[[{ name: 'Reds' }, { colors: ['#f00'] }], params, [{ colors: [{ value: '#f00' }] }]],
			[null, params, []],
			[[], params, []],
		])('groups:%j, params:%j, expected:%j', (groups, params, expected) => {
			expect(calculateColorGroups(groups, params)).toEqual(expected)
		})
	})

	describe('parseColor', () => {
		test.each([
			['#ff0000', { r: 255, g: 0, b: 0, a: 1 }],
			['ff0', { r: 255, g: 255, b: 0, a: 1 }],
			['#f00a', { r: 255, g: 0, b: 0, a: 170 / 255 }],
			['#ff000080', { r: 255, g: 0, b: 0, a: 128 / 255 }],
			['rgb(255, 0, 0)', { r: 255, g: 0, b: 0, a: 1 }],
			['rgb(255 0 0)', { r: 255, g: 0, b: 0, a: 1 }],
			['rgb(100% 0% 0%)', { r: 255, g: 0, b: 0, a: 1 }],
			['rgba(0, 128, 0, 0.5)', { r: 0, g: 128, b: 0, a: 0.5 }],
			['rgb(255 0 0 / 50%)', { r: 255, g: 0, b: 0, a: 0.5 }],
			['hsl(0 100% 50%)', { r: 255, g: 0, b: 0, a: 1 }],
			['hsl(120, 100%, 50%)', { r: 0, g: 255, b: 0, a: 1 }],
			['hsla(240, 100%, 50%, 0.5)', { r: 0, g: 0, b: 255, a: 0.5 }],
			['hsl(0 0% 50%)', { r: 128, g: 128, b: 128, a: 1 }],
			['hsl(0rad 100% 50%)', { r: 255, g: 0, b: 0, a: 1 }],
			['hsl(100grad 100% 50%)', { r: 128, g: 255, b: 0, a: 1 }],
			['hsl(0.25turn 100% 50%)', { r: 128, g: 255, b: 0, a: 1 }],
			['red', { r: 255, g: 0, b: 0, a: 1 }],
			['RebeccaPurple', { r: 102, g: 51, b: 153, a: 1 }],
			['not-a-color', null],
			['rgb(0, 0)', null],
			['rgb(255,,0,0)', null],
			['rgb(255, 0 0)', null],
			['rgb(255 0 0 0)', null],
			['hsl(0 100% 50% 0.5)', null],
			['rgb(100 %, 0%, 0%)', null],
			['hsl(0, 100, 50)', null],
			['constructor', null],
			['__proto__', null],
			['toString', null],
			['hasOwnProperty', null],
			['valueOf', null],
			[null, null],
			[undefined, null],
			[123, null],
		])('color:%j, expected:%j', (color, expected) => {
			expect(parseColor(color)).toEqual(expected)
		})
	})

	describe('normalizeColor', () => {
		test.each([
			['#ff0', '#ff0'],
			['#ff0000', '#ff0000'],
			['#f00a', '#f00a'],
			['#ff000080', '#ff000080'],
			['#FF0000', '#ff0000'],
			['#ABCDEF', '#abcdef'],
			[' #FfF ', '#fff'],
			['rgb(255, 0, 0)', '#ff0000'],
			['rgb(255 0 0)', '#ff0000'],
			['rgb(100% 0% 0%)', '#ff0000'],
			['rgba(255, 0, 0, 1)', '#ff0000'],
			['rgb(0,128,0)', '#008000'],
			['rgba(255, 0, 0, 0.5)', '#ff000080'],
			['rgb(255 0 0 / 50%)', '#ff000080'],
			['hsl(0 100% 50%)', '#ff0000'],
			['hsl(120, 100%, 50%)', '#00ff00'],
			['hsla(240, 100%, 50%, 0.5)', '#0000ff80'],
			['red', '#ff0000'],
			['RebeccaPurple', '#663399'],
			[' ff0000 ', '#ff0000'],
			[' #ff0000 ', '#ff0000'],
			['rgba(0, 0, 0, 0.999)', '#000000'],
			['rgb(255 0 0 0)', 'rgb(255 0 0 0)'],
			['not-a-color', 'not-a-color'],
			['constructor', 'constructor'],
			['__proto__', '__proto__'],
		])('color:%j, expected:%j', (color, expected) => {
			expect(normalizeColor(color)).toBe(expected)
		})
	})

	describe('isColorValid', () => {
		test.each([
			['#ff0', true],
			['ff0', true],
			['ff', false],
			['fff', true],
			['ffff', true],
			['#ffff', true],
			['f00a', true],
			['#f00a', true],
			['fffff', false],
			['ffffff', true],
			['fffffff', false],
			['ffffffff', true],
			['fffffffff', false],
			['ffg', false],
			['.ff0', false],
			['ff0ff000.', false],
			['red', true],
			['RED', true],
			['rebeccapurple', true],
			['notacolor', false],
			['rgb(255, 0, 0)', true],
			['rgb(255 0 0)', true],
			['rgba(255, 0, 0, 0.5)', true],
			['rgb(255 0 0 / 50%)', true],
			['hsl(0 100% 50%)', true],
			['hsl(0, 100%, 50%)', true],
			['hsla(0, 100%, 50%, 0.5)', true],
			['rgb(0, 0)', false],
			['hsl(0, 100, 50)', false],
			['rgb(a, b, c)', false],
			['rgb(255,,0,0)', false],
			['rgb(255, 0 0)', false],
			['rgb(255 0 0 0)', false],
			['hsl(0 100% 50% 0.5)', false],
			['rgb(255 0 0 /)', false],
			['rgb(100 %, 0%, 0%)', false],
			['rgb(255 0 0 / 5 0%)', false],
			['constructor', false],
			['__proto__', false],
			['toString', false],
			[null, false],
			[undefined, false],
			[0, false],
		])('color:%j, expected:%j', (color, expected) => {
			expect(isColorValid(color)).toBe(expected)
		})
	})

	describe('normalizeInputType', () => {
		test.each([
			['text', 'text'],
			['color', 'color'],
			['foo', 'text'],
			['number', 'text'],
			['checkbox', 'text'],
			['range', 'text'],
			['password', 'text'],
			['', 'text'],
			[null, 'text'],
			[undefined, 'text'],
		])('type:%j, expected:%j', (type, expected) => {
			expect(normalizeInputType(type)).toBe(expected)
		})
	})
})
