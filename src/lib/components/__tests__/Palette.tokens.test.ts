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
