<script>
	import { TRASH } from '../enums/PaletteIcon'

	import IconButton from './IconButton.svelte'
</script>

<style>
	:global(button.tooltip__button) {
		cursor: pointer !important;
		margin: 0 !important;
		padding: 0 !important;
		background: none !important;
		border: none !important;
	}

	:global(button.tooltip__button svg) {
		width: 24px !important;
		height: auto !important;
		top: 4px !important;
		left: 4px !important;
	}

	:global(button.tooltip__button > svg path) {
		fill: white !important;
	}

	:global(button.tooltip__button:active) {
		background: none !important;
	}

	:global(button.tooltip__button:active > svg path) {
		fill: #aaaaaa !important;
	}
</style>

<IconButton data-testid="__palette-trash__" icon={TRASH} class="tooltip__button" />
