// Ambient declarations for the library sources (not published — `files` only ships `dist`).

// The EyeDropper API is not yet part of the TypeScript DOM lib.
declare class EyeDropper {
	open(options?: { signal?: AbortSignal }): Promise<{ sRGBHex: string }>
}

interface Window {
	EyeDropper?: typeof EyeDropper
}

// This dependency ships no type declarations.
declare module '@untemps/svelte-use-drop-outside'
