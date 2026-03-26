declare module '@untemps/utils/array/extractByIndices' {
	export function extractByIndices<T>(array: T[], indices: number[]): T[]
}

type SvelteActionReturn = { destroy?: () => void; update?: (params: unknown) => void }

declare module '@untemps/svelte-use-tooltip' {
	export function useTooltip(node: Element, options: Record<string, unknown>): SvelteActionReturn
}

declare module '@untemps/svelte-use-drop-outside' {
	export function useDropOutside(node: Element, options: Record<string, unknown>): SvelteActionReturn
}
