export type ColorItem = {
	name?: string
	value: string
}

export type ColorGroup = {
	name?: string
	colors: (string | ColorItem)[]
}

export type NormalizedColorGroup = {
	name?: string
	colors: ColorItem[]
}

export type ColorsInput = (string | ColorItem)[] | ColorGroup[]

export type TransitionConfig = {
	fn: (node: Element, args?: Record<string, unknown>) => unknown
	args?: Record<string, unknown>
}
