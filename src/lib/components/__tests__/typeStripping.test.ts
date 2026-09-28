import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { parse } from 'svelte/compiler'

const componentsDir = resolve(process.cwd(), 'src/lib/components')

const components = readdirSync(componentsDir, { recursive: true, encoding: 'utf8' })
	.filter((file) => file.endsWith('.svelte') && !file.includes('__tests__'))
	.sort()

const FUNCTION_TYPES = ['ArrowFunctionExpression', 'FunctionExpression', 'FunctionDeclaration']

const findLeakingSyntax = (node: unknown, source: string, found: string[] = []): string[] => {
	if (Array.isArray(node)) {
		node.forEach((child) => findLeakingSyntax(child, source, found))
	} else if (node && typeof node === 'object') {
		const { type, start, end } = node as { type?: string; start?: number; end?: number }
		if (type && FUNCTION_TYPES.includes(type)) {
			for (const param of (node as { params: { optional?: boolean; start: number; end: number }[] }).params) {
				if (param.optional) found.push(source.slice(param.start, param.end))
			}
		}
		if (type === 'NewExpression' && ('typeArguments' in node || 'typeParameters' in node)) {
			found.push(source.slice(start, end))
		}
		for (const [key, child] of Object.entries(node)) {
			if (key !== 'typeAnnotation' && key !== 'returnType') findLeakingSyntax(child, source, found)
		}
	}
	return found
}

test.each(components)('Writes %s without optional parameters or `new` type arguments', (file) => {
	const source = readFileSync(resolve(componentsDir, file), 'utf8')
	const { instance, module } = parse(source, { modern: true })

	expect(findLeakingSyntax([module?.content, instance?.content], source)).toEqual([])
})
