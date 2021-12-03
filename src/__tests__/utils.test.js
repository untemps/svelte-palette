import { resolveClass } from '../utils'

describe('utils', () => {
	describe('resolveClass', () => {
		it.each([[null], [undefined], [{}], [new Date()]])('Throws if cannot perform resolution', (input) => {
			expect(() => resolveClass(input)).toThrow()
		})

		it.each([
			[[[true, 'foo']], 'foo'],
			[[[false, 'foo']], ''],
			[[[false, 'foo', 'bar']], 'bar'],
			[
				[
					[false, 'foo', 'bar'],
					[true, 'foo', 'bar'],
				],
				'bar foo',
			],
			[
				[
					[true, 'foo', 'bar'],
					[false, 'foo', 'bar'],
				],
				'foo bar',
			],
			[
				[
					[false, 'foo'],
					[true, 'foo', 'bar'],
				],
				'foo',
			],
			[
				[
					[true, 'foo', 'bar'],
					[false, 'foo'],
				],
				'foo',
			],
			[
				[
					[true, 'foo', 'bar'],
					[false, 'foo'],
					[true, 'foo'],
					[false, 'foo', 'bar'],
				],
				'foo foo bar',
			],
			[
				[
					[false, 'foo', 'bar'],
					[true, 'foo'],
					[false, 'foo'],
					[true, 'foo', 'bar'],
				],
				'bar foo foo',
			],
			[
				[
					[true, 'foo'],
					[false, 'foo', 'bar'],
					[true, 'foo', 'bar'],
					[false, 'foo'],
				],
				'foo bar foo',
			],
			[
				[
					[false, 'foo'],
					[true, 'foo', 'bar'],
					[false, 'foo', 'bar'],
					[true, 'foo'],
				],
				'foo bar foo',
			],
		])('', (arr, expected) => {
			expect(resolveClass(arr)).toBe(expected)
		})
	})
})
