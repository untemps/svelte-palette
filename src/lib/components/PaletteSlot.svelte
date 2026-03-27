<script lang="ts">
	import type { TransitionConfig } from '../types'

	let {
		color = null,
		selected = false,
		disabled = false,
		transition = null,
		onselect = undefined,
		...restProps
	}: {
		color?: string | null
		selected?: boolean
		disabled?: boolean
		transition?: TransitionConfig | null
		onselect?: (event: { color: string | null }) => void
		[key: string]: unknown
	} = $props()

	const enter = (node: Element) => transition?.fn(node, transition?.args)

	const _onClick = (e: MouseEvent): void => {
		e.preventDefault()
		!disabled && onselect?.({ color })
	}
</script>

<button
	data-testid="__palette-slot__"
	aria-label={color}
	{...restProps}
	class:empty={!color}
	class:selected
	class:clickable={!disabled}
	style="--color:{color}; --outerBorderColor:{color || '#aaa'};"
	{disabled}
	in:enter
	onclick={_onClick}
></button>

<style>
	button {
		width: 1rem;
		height: 1rem;
		margin: 1px 0 0 0;
		padding: 0;
		border: 1px solid rgba(0, 0, 0, 0.2);
		border-radius: 50%;
		background-color: var(--color);
	}

	button:active {
		background-color: var(--color);
	}

	button:focus {
		outline: 2px solid #bdbdbd;
		outline-offset: 2px;
	}

	button.selected {
		outline: 2px solid var(--outerBorderColor);
		outline-offset: 2px;
	}

	button.clickable {
		cursor: pointer;
	}

	button.empty {
		border: #aaa solid 1px;
		background: linear-gradient(to top left, #00000000 calc(50% - 1px), #aaa 50% 50%, #00000000 calc(50% + 1px));
	}
</style>
