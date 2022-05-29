<script>
	import { createEventDispatcher } from 'svelte'

	import { ADD } from '../events/PaletteEvents'

	import PaletteSlot from './PaletteSlot.svelte'
	import PaletteEyeDropper from './PaletteEyeDropper.svelte'

	export let color = null
	export let inputType = 'text'
	export let inputAriaLabel = 'Enter an hex color value'
	export let inputTitle = 'The value must be a valid hex color'
	export let buttonAriaLabel = 'Submit this hex color value'
	export let eyeDropperButtonAriaLabel = 'Pick a color from the screen'

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

<form data-testid="__palette-input-root__" on:submit|preventDefault={_onSubmit}>
    {#if inputType !== 'color'}<PaletteSlot data-testid="__palette-input-slot__" bind:color role="presentation" tabindex="-1" disabled />{/if}
	<input
		data-testid="__palette-input-input__"
		type={inputType}
		value={color}
		aria-label={inputAriaLabel}
		title={inputTitle}
        class:color="{inputType === 'color'}"
		on:input|preventDefault={_onChange}
	/>
	<button data-testid="__palette-input-submit__" type="submit" disabled={!isValid} aria-label={buttonAriaLabel}>
		<svg viewBox="0 0 12 12" width="12px" height="12px">
			<g transform="matrix(0.75, 0, 0, 0.75, 0, 0)">
				<path
					d="M 14.857 9.143 L 9.143 9.143 L 9.143 14.857 C 9.143 15.489 8.631 16 8 16 C 7.369 16 6.857 15.489 6.857 14.857 L 6.857 9.143 L 1.143 9.143 C 0.512 9.143 0 8.632 0 8 C 0 7.368 0.512 6.857 1.143 6.857 L 6.857 6.857 L 6.857 1.143 C 6.857 0.511 7.369 0 8 0 C 8.631 0 9.143 0.511 9.143 1.143 L 9.143 6.857 L 14.857 6.857 C 15.488 6.857 16 7.368 16 8 C 16 8.632 15.488 9.143 14.857 9.143 Z"
				/>
			</g>
		</svg>
	</button>
    {#if inputType !== 'color'}<PaletteEyeDropper buttonAriaLabel={eyeDropperButtonAriaLabel} on:add={_onEyeDropperAdd} />{/if}
</form>

<style>
	form {
		display: flex;
		align-items: center;
        justify-content: center;
		column-gap: 0.5rem;
	}

	input {
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
		border-top-right-radius: 0;
		border-bottom-right-radius: 0;
	}

	input:disabled {
		opacity: 0.5;
	}

	input:focus {
		border-color: rgba(0, 0, 0, 0.3);
	}
    
    input.color {
        width: 12rem;
        padding: 0.1rem 0.3rem;
    }

	button {
        position: relative;
		width: 2rem;
		height: 2rem;
		margin: 0;
		background: rgba(0, 0, 0, 0.1);
		border-color: rgba(0, 0, 0, 0);
		border-radius: 0.3rem;
		border-top-left-radius: 0;
		border-bottom-left-radius: 0;
		cursor: pointer;
	}

	input + button {
		margin-left: -0.5rem;
	}

    button:hover {
        background: rgba(0, 0, 0, 0.15);
    }

	button:disabled {
		opacity: 0.5;
	}

	button:focus {
		border-color: rgba(0, 0, 0, 0.3);
	}

	svg {
        position: absolute;
        top: calc(50% - 6px);
        left: calc(50% - 6px);
	}

	svg path {
		fill: rgba(0, 0, 0, 0.6);
	}
</style>
