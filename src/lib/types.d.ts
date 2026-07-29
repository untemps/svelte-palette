import type { TransitionConfig } from 'svelte/transition'

/**
 * A single color value. Any CSS color string is accepted, typically a hex value such as `#865C54`.
 */
export type ColorValue = string

/**
 * A color expressed as an object, allowing an optional display name to be associated with the value.
 */
export interface ColorObject {
	/** Optional display name for the color. */
	name?: string
	/** The color value (any CSS color string, typically a hex value). */
	value: ColorValue
}

/**
 * A color passed to the palette, either as a bare value or as a {@link ColorObject}.
 */
export type ColorInput = ColorValue | ColorObject

/**
 * A named collection of colors. Passing an array of groups displays the palette as labelled sections.
 */
export interface ColorGroup {
	/** Optional label displayed above the group. */
	name?: string
	/** Colors belonging to the group. */
	colors: ColorInput[]
}

/**
 * The resolved value accepted by the `colors` prop: either a flat list of colors or a list of groups.
 */
export type Colors = ColorInput[] | ColorGroup[]

/**
 * The value accepted by the `colors` prop, synchronously or as a promise to be resolved.
 */
export type ColorsProp = Colors | Promise<Colors>

/**
 * Slot appearance animation, mirroring Svelte's `in:`/`out:` directive API.
 */
export interface Transition {
	/** Transition function (a Svelte-exported transition or a custom one). */
	fn: (node: Element, args?: any) => TransitionConfig
	/** Parameters passed to the transition function. */
	args?: any
}

/**
 * Available slot deletion modes. Enums are exported as `NONE`, `TOOLTIP` and `DROP`.
 */
export type DeletionMode = 'none' | 'tooltip' | 'drop'

/**
 * Available palette tools. Enums are exported as `COMPACT` and `SETTINGS`.
 */
export type PaletteToolName = 'compact' | 'settings'

/**
 * Icons rendered by `PaletteIconButton`.
 */
export type PaletteIconName = 'compact' | 'enlarge' | 'eyeDropper' | 'plus' | 'settings' | 'trash'

/**
 * Accepted types for the color input. Any other value falls back to `"text"`.
 */
export type InputType = 'text' | 'color'

/**
 * Overridable built-in text and accessibility labels of the palette. Pass a `Partial<PaletteLabels>` to the
 * `labels` prop of `Palette` to localize the whole set or tweak individual strings; every key defaults to the
 * value held in `DEFAULT_LABELS`.
 */
export interface PaletteLabels {
	/** Accessible name of the slot listbox. Aliased by the `label` prop, which wins when both are set. */
	slots: string
	/** Text announced while an async `colors` source is loading. */
	loader: string
	/** Headline announced when an async `colors` source rejects. */
	error: string
	/** Accessible name of the leading transparent (no-color) slot. */
	transparentSlot: string
	/** Accessible name of the tools compact button (shrinks the palette). */
	compact: string
	/** Accessible name of the compact-mode enlarge button (restores the full palette). */
	enlarge: string
	/** Accessible name of the hex color input. */
	inputHex: string
	/** Validation hint shown as the hex input `title`. */
	inputHexError: string
	/** Accessible name of the input submit button. */
	submitHex: string
	/** Accessible name of the eye-dropper button. */
	eyeDropper: string
	/** Accessible name of the tools panel section. */
	tools: string
	/** Accessible name of the settings button. */
	settings: string
	/** Accessible name of the deletion (trash) button shown in the tooltip. */
	trash: string
}

/**
 * Argument passed to the `onselect` callback when a color is picked.
 */
export interface SelectEventArgs {
	/** The selected color value, or `null` when the transparent slot is selected. */
	color: ColorValue | null
}

/**
 * Argument passed to the input/eye-dropper `onadd` callback when a color is submitted.
 */
export interface InputAddEventArgs {
	/** The color value being added. */
	color: ColorValue
}

/**
 * Argument passed to the palette-level `onadd` callback once a color has been added to the list.
 */
export interface AddEventArgs {
	/** The color value that was added. */
	color: ColorValue
	/** The resulting color list, resolved to its normalized form. */
	colors: Colors
}

/**
 * Argument passed to the palette-level `ondelete` callback once a color has been removed from the list.
 */
export interface DeleteEventArgs {
	/** The color value that was removed. */
	color: ColorValue
	/** The index of the removed color within its list (or group in grouped mode). */
	index: number
	/** The resulting color list, resolved to its normalized form. */
	colors: Colors
	/** The index of the group the color was removed from, only provided in grouped mode. */
	groupIndex?: number
	/** The name of the group the color was removed from, only provided in grouped mode when the group is named. */
	groupName?: string
}

/**
 * Argument passed to an `onerror` callback carrying the underlying error. Used by the eye dropper when the
 * EyeDropper API fails or is dismissed, and by the palette when an async `colors` source rejects.
 */
export interface ErrorEventArgs {
	/** The error thrown by the EyeDropper API, or the rejection reason of an async `colors` source. */
	error: unknown
}

/**
 * Argument passed to the tools `onselect` callback when a tool is activated.
 */
export interface ToolSelectEventArgs {
	/** The activated tool. */
	tool: PaletteToolName
}

/**
 * Properties passed to the `header` and `footer` snippets.
 */
export interface HeaderSnippetProps {
	/** The currently selected color, or `null` when none is selected. */
	selectedColor: ColorValue | null
}

/**
 * Properties passed to the `beforeSlot` and `afterSlot` snippets.
 */
export interface EdgeSlotSnippetProps {
	/** The currently selected color, or `null` when none is selected. */
	selectedColor: ColorValue | null
	/** The transition applied to the slots, if any. */
	transition: Transition | null
	/** Whether the palette is displayed in compact mode. */
	isCompact: boolean
}

/**
 * Properties passed to the `slot` snippet that replaces the default color slots.
 */
export interface SlotSnippetProps {
	/** Index of the color within its list (or group). */
	index: number
	/** Roving tab index to forward to the custom slot so it joins arrow-key navigation (`0` when active, `-1` otherwise). */
	tabindex: number
	/** The color value of the slot. */
	color: ColorValue
	/** The color name, when the color was provided as an object; `undefined` for bare color values. */
	colorName?: string
	/** The group name, only provided when the colors are grouped. */
	groupName?: string
	/** The currently selected color, or `null` when none is selected. */
	selectedColor: ColorValue | null
	/** Whether this slot is the selected one. Index-accurate: with `allowDuplicates`, only the first matching slot is `true`. */
	selected: boolean
	/** The transition applied to the slot, if any. */
	transition: Transition | null
	/** Whether the palette is displayed in compact mode. */
	isCompact: boolean
	/**
	 * The `aria-keyshortcuts` value announcing keyboard deletion (`"Delete Backspace"` when a `deletionMode`
	 * is set, `undefined` otherwise). Forward it onto your focusable element (e.g. `aria-keyshortcuts={ariaKeyShortcuts}`)
	 * so screen readers announce that `Delete`/`Backspace` removes the focused slot.
	 */
	ariaKeyShortcuts?: string
}

/**
 * Properties passed to the `transparentSlot` snippet that replaces the default transparent slot.
 */
export interface TransparentSlotSnippetProps {
	/** Roving tab index to forward so the transparent option keeps the single tab stop (`0` when active, `-1` otherwise). */
	tabindex: number
	/** Whether the transparent (no-color) option is currently selected, i.e. `selectedColor === null`. */
	selected: boolean
}

/**
 * Properties passed to the `input` snippet that replaces the default color input.
 */
export interface InputSnippetProps {
	/** The currently selected color, or `null` when none is selected. */
	selectedColor: ColorValue | null
	/** The resolved input type. */
	inputType: InputType
}

/**
 * Properties passed to the `tools` snippet that replaces the default tools panel.
 */
export interface ToolsSnippetProps {
	/** Indices used to build the compact palette. */
	compactColorIndices: number[]
	/** Whether the palette is displayed in compact mode. */
	isCompact: boolean
	/** Activates a tool by name (use the exported `COMPACT` and `SETTINGS` constants). */
	onSelect: (tool: PaletteToolName) => void
}

/**
 * Properties passed to the `settings` snippet that replaces the default settings panel content.
 */
export interface SettingsSnippetProps {
	/** Closes the settings panel. */
	onClose: () => void
}

/**
 * Properties passed to the `error` snippet that replaces the default error state shown when an async
 * `colors` source rejects.
 */
export interface ErrorSnippetProps {
	/** The rejection reason of the async `colors` source. */
	error: unknown
}
