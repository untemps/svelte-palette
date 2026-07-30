import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { compile } from 'svelte/compiler'

// jsdom in this suite does not inject the component's compiled CSS, so the
// token-override cascade cannot be asserted at runtime. Instead we lock in the
// contract that makes it work: the --palette-* defaults are declared at zero
// specificity (:where(...)), so an ordinary consumer rule on the root — an inline
// style, or a class — always overrides them. If this regresses to a bare
// `.palette` selector, Svelte's scoping raises it to (0,2,0) and consumer theming
// silently stops working.
test('Declares the palette token defaults at zero specificity via :where()', () => {
	const source = readFileSync(resolve(process.cwd(), 'src/lib/components/Palette.svelte'), 'utf8')
	const { css } = compile(source, { name: 'Palette', filename: 'Palette.svelte', css: 'external' })

	const code = (css?.code ?? '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ')

	// Capture the selector of the rule that declares a --palette-* default.
	const tokenRule = /([^{}]*)\{[^{}]*--palette-surface\s*:/.exec(code)

	expect(tokenRule?.[1]).toBeTruthy()
	expect(tokenRule?.[1]).toContain(':where(')
})
