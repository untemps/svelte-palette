<script>
	import { createEventDispatcher } from 'svelte'

	import { ADD } from '../enums/PaletteEvent'
	import { PLUS } from '../enums/PaletteIcon'

	import IconButton from './IconButton.svelte'
	import PaletteSlot from './PaletteSlot.svelte'
	import PaletteEyeDropper from './PaletteEyeDropper.svelte'

	export let color = null
	export let inputType = 'text'
	export let inputAriaLabel = 'Enter an hex color value'
	export let inputTitle = 'The value must be a valid hex color'
	export let buttonAriaLabel = 'Submit this hex color value'
	export let eyeDropperAriaLabel = 'Pick a color from the screen'

	const dispatch = createEventDispatcher()
	const validationRegex = /^#?(([0-9a-f]{2}){3,4}|([0-9a-f]){3})$/gi

	const _isValid = (value) => !!value && validationRegex.test(value)

	$: color = color?.replace(validationRegex, '#$1') || ''
	$: inputType = inputType === 'text' || inputType === 'color' ? inputType : 'text'
	$: isValid = _isValid(color)

	const _onChange = ({ target: { value } }) => {
		color = value
	}

	const _onEyeDropperAdd = ({ detail: { color: value } }) => {
		color = value
	}

	const _onSubmit = () => {
		dispatch(ADD, {
			color,
		})
	}
</script>

<style>
	form {
		display: flex;
		align-items: center;
		justify-content: center;
		column-gap: 0.5rem;
	}

	.palette_input__adder {
		display: flex;
		align-items: center;
	}

	.palette_input__input {
		font-family: Helvetica, sans-serif;
		font-size: 0.8rem;
		max-width: 6rem;
		height: 2rem;
		margin: 0;
		padding: 0.5rem;
		outline: none;
		color: rgba(0, 0, 0, 0.6);
		background: rgba(255, 255, 255, 1);
		border-color: rgba(0, 0, 0, 0.1);
		border-radius: 0.3rem;
		border-right-width: 0;
		border-top-right-radius: 0;
		border-bottom-right-radius: 0;
	}

	.palette_input__input:disabled {
		opacity: 0.5;
	}

	.palette_input__input:focus {
		border-right-width: 1px;
		border-color: rgba(0, 0, 0, 0.3);
	}

	.palette_input__input--color {
		width: 12rem;
		padding: 0.1rem 0.3rem;
	}

	:global(button.palette_input__submit) {
		margin-left: -1px !important;
		border-top-left-radius: 0 !important;
		border-bottom-left-radius: 0 !important;
	}
</style>

<form data-testid="__palette-input__">
	{#if inputType !== 'color'}<PaletteSlot
			data-testid="__palette-input-slot__"
			bind:color
			role="presentation"
			tabindex="-1"
			disabled />{/if}
	<span class="palette_input__adder">
		<input
			data-testid="__palette-input-input__"
			type={inputType}
			value={color}
			aria-label={inputAriaLabel}
			title={inputTitle}
			class="palette_input__input"
			class:palette_input__input--color={inputType === 'color'}
			on:input|preventDefault={_onChange} />
		<IconButton
			data-testid="__palette-input-submit__"
			icon={PLUS}
			disabled={!isValid}
			aria-label={buttonAriaLabel}
			class="palette_input__submit"
			on:click={_onSubmit} />
	</span>
	{#if inputType !== 'color'}
		<PaletteEyeDropper ariaLabel={eyeDropperAriaLabel} on:add={_onEyeDropperAdd} />
	{/if}
</form>
