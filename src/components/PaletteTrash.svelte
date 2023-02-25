<script>
	import { TRASH } from '../enums/PaletteIcon'

	import IconButton from './IconButton.svelte'
</script>

<style>
	:global(button.tooltip__button) {
		cursor: pointer;
		margin: 0;
		padding: 0;
		background: none;
		border: none;
	}

	:global(button.tooltip__button svg) {
		width: 24px;
		height: auto;
		top: 4px;
		left: 4px;
	}

	:global(button.tooltip__button > svg path) {
		fill: white;
	}

	:global(button.tooltip__button:active) {
		background: none;
	}

	:global(button.tooltip__button:active > svg path) {
		fill: #aaaaaa;
	}
</style>

<IconButton data-testid="__palette-trash__" icon={TRASH} class="tooltip__button" />
