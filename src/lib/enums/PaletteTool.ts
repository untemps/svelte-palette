export const SETTINGS = 'settings' as const
export const COMPACT = 'compact' as const

export type PaletteTool = typeof SETTINGS | typeof COMPACT
