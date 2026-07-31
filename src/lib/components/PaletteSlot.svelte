<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements'
	import type { TransitionConfig } from 'svelte/transition'

	import type { ColorValue, SelectEventArgs, Transition } from '../types'

	interface Props {
		/** The color value of the slot. */
		color?: ColorValue | null
		/** Human-readable name used as the accessible label and native tooltip; falls back to the color value. */
		name?: string | null
		/** Whether the slot is selected. */
		selected?: boolean
		/** Whether the slot is disabled. */
		disabled?: boolean
		/** Tab index applied to the slot button. Used to build the grid roving tabindex. */
		tabindex?: number
		/** Animation applied when the slot is rendered. */
		transition?: Transition | null
		/** Called when the slot is clicked. */
		onselect?: (args: SelectEventArgs) => void
	}

	let {
		color = null,
		name = null,
		selected = false,
		disabled = false,
		tabindex = 0,
		role,
		transition = null,
		onselect,
		...restProps
	}: Props & Omit<HTMLButtonAttributes, keyof Props> = $props()

	const enter = (node: Element): TransitionConfig => transition?.fn(node, transition?.args) ?? {}

	const _onClick = (e: MouseEvent) => {
		e.preventDefault()
		!disabled && onselect?.({ color })
	}
</script>

<button
	data-testid="__palette-slot__"
	aria-label={name ?? color}
	title={name ?? undefined}
	{role}
	aria-selected={role === 'option' ? selected : undefined}
	{...restProps}
	class:empty={!color}
	class:selected
	class:clickable={!disabled}
	style="--color:{color};"
	{disabled}
	{tabindex}
	in:enter
	onclick={_onClick}
></button>

<style>
	button {
		width: var(--palette-slot-size, 1rem);
		height: var(--palette-slot-size, 1rem);
		margin: 1px 0 0 0;
		padding: 0;
		border: 1px solid var(--palette-slot-border, rgba(0, 0, 0, 0.2));
		border-radius: 50%;
		background-color: var(--color);
	}

	button:active {
		background-color: var(--color);
	}

	button:focus-visible {
		outline: 2px solid var(--palette-focus-ring, #1a1a1a);
		outline-offset: 2px;
	}

	@media (forced-colors: active) {
		button:focus-visible {
			outline-color: Highlight;
		}
	}

	button.selected {
		/* Selection ring drawn as a box-shadow; the surface layer keeps a 2px gap
		   between the slot and the grey ring. */
		box-shadow:
			0 0 0 2px var(--palette-surface, #fafafa),
			0 0 0 4px var(--palette-slot-ring, #9e9e9e);
	}

	button.clickable {
		cursor: pointer;
	}

	button.empty {
		border: var(--palette-slot-empty, #aaa) solid 1px;
		background: linear-gradient(
			to top left,
			#00000000 calc(50% - 1px),
			var(--palette-slot-empty, #aaa) 50% 50%,
			#00000000 calc(50% + 1px)
		);
	}
</style>
