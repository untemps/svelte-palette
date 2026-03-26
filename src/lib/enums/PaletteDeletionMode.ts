export const NONE = 'none' as const
export const TOOLTIP = 'tooltip' as const
export const DROP = 'drop' as const

export type PaletteDeletionMode = typeof NONE | typeof TOOLTIP | typeof DROP
