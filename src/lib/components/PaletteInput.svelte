<script>
	import { createEventDispatcher, onDestroy, onMount } from 'svelte'

	import { ADD } from '../enums/PaletteEvent'
	import { PLUS } from '../enums/PaletteIcon'

	import PaletteIconButton from './PaletteIconButton.svelte'
	import PaletteSlot from './PaletteSlot.svelte'
	import PaletteEyeDropperButton from './PaletteEyeDropperButton.svelte'

	import { COLOR_REGEX, isColorValid } from '../utils/utils'

	export let color = null
	export let inputType = 'text'

	const dispatch = createEventDispatcher()

	let _isEyeDropperAvailable = false
	let _gridColumnStart = 2
	let _gridColumnEnd = 5

	$: color = color?.replace(COLOR_REGEX, '#$1') || ''
	$: isValid = isColorValid(color)

	$: {
		_gridColumnStart = 2 - +(inputType === 'color')
		_gridColumnEnd = (_isEyeDropperAvailable ? 5 : 6) + +(inputType === 'color')
	}

	onMount(() => {
		_isEyeDropperAvailable = !!window?.EyeDropper
		return () => document.removeEventListener('keypress', _onKeyPress)
	})

	const _onInputChange = ({ target: { value } }) => {
		color = value
	}

	const _onKeyPress = (e) => {
		e.code === 'Enter' && _onSubmit()
	}

	const _onInputFocus = () => {
		document?.addEventListener('keypress', _onKeyPress)
	}

	const _onInputBlur = () => {
		document?.removeEventListener('keypress', _onKeyPress)
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

<hr class="palette__divider" />
<section
	data-testid="__palette-input__"
	class="palette__input {$$props.class ?? ''}"
	style="--grid-column-start: {_gridColumnStart}; --grid-column-end: {_gridColumnEnd}"
>
	<form>
		{#if inputType !== 'color'}<PaletteSlot
				data-testid="__palette-input-slot__"
				bind:color
				role="presentation"
				tabindex="-1"
				disabled
			/>{/if}
		<span class="palette_input__adder">
			<input
				data-testid="__palette-input-input__"
				type={inputType}
				value={color}
				aria-label="Enter an hex color value"
				title="'The value must be a valid hex color'"
				class="palette_input__input"
				class:palette_input__input--color={inputType === 'color'}
				on:focus={_onInputFocus}
				on:blur={_onInputBlur}
				on:input|preventDefault={_onInputChange}
			/>
			<PaletteIconButton
				data-testid="__palette-input-submit__"
				type="submit"
				icon={PLUS}
				disabled={!isValid}
				aria-label="Submit the hex color value"
				class="palette_input__submit"
				on:click={_onSubmit}
			/>
		</span>
		{#if _isEyeDropperAvailable && inputType !== 'color'}
			<PaletteEyeDropperButton aria-label="Pick a color from the screen" on:add={_onEyeDropperAdd} />
		{/if}
	</form>
</section>

<style>
	.palette__input {
		width: 100%;
		max-width: 14rem;
		padding: 1rem 1rem;
	}

	form {
		width: 100%;
		position: relative;
		display: grid;
		grid-template-columns: repeat(5, minmax(2rem, 1fr));
		column-gap: 0.3rem;
		justify-items: center;
		align-items: center;
	}

	.palette_input__adder {
		width: 100%;
		grid-column: var(--grid-column-start) / var(--grid-column-end);
		display: flex;
		align-items: center;
	}

	.palette_input__input {
		font-family: Helvetica, sans-serif;
		font-size: 0.8rem;
		width: 71%;
		height: 2rem;
		margin: 0;
		padding: 0.4rem;
		outline: none;
		color: rgba(0, 0, 0, 0.6);
		background: rgba(255, 255, 255, 1);
		border-width: 1px;
		border-color: #e5e5e5;
		border-style: solid;
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
		border-color: #bdbdbd;
		outline: none;
		z-index: 2;
	}

	.palette_input__input--color {
		width: 12rem;
		padding: 0.1rem 0.3rem;
	}

	:global(button.icon_button__button.palette_input__submit) {
		margin-left: -1px;
		border-top-left-radius: 0;
		border-bottom-left-radius: 0;
	}

	.palette__divider {
		border: none;
		background-color: #e9e9e9;
		width: 100%;
		height: 1px;
		margin: 0;
	}
</style>
