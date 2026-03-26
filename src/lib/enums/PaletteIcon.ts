export const COMPACT = 'compact' as const
export const ENLARGE = 'enlarge' as const
export const EYE_DROPPER = 'eyeDropper' as const
export const PLUS = 'plus' as const
export const SETTINGS = 'settings' as const
export const TRASH = 'trash' as const

export type PaletteIcon =
	| typeof COMPACT
	| typeof ENLARGE
	| typeof EYE_DROPPER
	| typeof PLUS
	| typeof SETTINGS
	| typeof TRASH
