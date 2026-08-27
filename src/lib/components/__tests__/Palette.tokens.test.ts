import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { compile } from 'svelte/compiler'

test('Declares the palette token defaults at zero specificity via :where()', () => {
	const source = readFileSync(resolve(process.cwd(), 'src/lib/components/Palette.svelte'), 'utf8')
	const { css } = compile(source, { name: 'Palette', filename: 'Palette.svelte', css: 'external' })

	const code = (css?.code ?? '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ')

	const tokenRule = /([^{}]*)\{[^{}]*--palette-surface\s*:/.exec(code)

	expect(tokenRule?.[1]).toBeTruthy()
	expect(tokenRule?.[1]).toContain(':where(')
})

test('Lays the flat and grouped slot grids out on the same geometry tokens', () => {
	const source = readFileSync(resolve(process.cwd(), 'src/lib/components/Palette.svelte'), 'utf8')
	const { css } = compile(source, { name: 'Palette', filename: 'Palette.svelte', css: 'external' })

	const code = (css?.code ?? '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ')

	const blocks = [...code.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
	const grid = (matches: (selector: string) => boolean) =>
		blocks.find(([, selector, declarations]) => matches(selector) && declarations.includes('grid-template-columns'))

	const flat = grid((selector) => selector.includes('.palette__listbox') && !selector.includes('--compact'))
	const grouped = grid((selector) => selector.includes('ul.palette__cells'))

	const geometry = (block: RegExpMatchArray | undefined) =>
		['grid-template-columns', 'grid-auto-rows', 'column-gap', 'row-gap'].map((property) =>
			new RegExp(`(?:^|;)\\s*${property}\\s*:([^;]*)`).exec(block?.[2] ?? '')?.[1].trim()
		)

	expect(flat).toBeTruthy()
	expect(grouped).toBeTruthy()
	expect(geometry(flat)).toEqual(geometry(grouped))
	geometry(flat).forEach((value) => expect(value).toContain('var(--palette-grid-'))
})
