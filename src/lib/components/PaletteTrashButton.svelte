<script>
	import { TRASH } from '../enums/PaletteIcon'

	import PaletteIconButton from './PaletteIconButton.svelte'
</script>

<PaletteIconButton
	data-testid="__palette-trash-button__"
	aria-label="Delete the slot"
	icon={TRASH}
	class="tooltip__button"
/>

<style>
	:global(button.icon_button__button.tooltip__button) {
		cursor: pointer;
		margin: 0;
		padding: 0;
		background: none;
		border: none;
	}

	:global(button.icon_button__button.tooltip__button > svg) {
		width: 24px;
		height: auto;
		top: 4px;
		left: 4px;
	}

	:global(button.icon_button__button.tooltip__button > svg path, button.icon_button__button.tooltip__button > svg line) {
		stroke: white;
	}

	:global(button.icon_button__button.tooltip__button:active) {
		background: none;
	}

	:global(button.icon_button__button.tooltip__button:active > svg path) {
		stroke: #aaaaaa;
	}
</style>
