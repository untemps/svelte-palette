<script>
	import { createEventDispatcher } from 'svelte'

	import PaletteSlot from './PaletteSlot.svelte'

	export let color = null
	export let inputAriaLabel = 'Enter an hex color value'
	export let inputTitle = 'The value must be a valid hex color'
	export let buttonAriaLabel = 'Submit this hex color value'
	export let onChange = null

	const dispatch = createEventDispatcher()
	const validationRegex = /^#?(([0-9a-f]{2}){3,4}|([0-9a-f]){3})$/gi

	const _isValid = (value) => validationRegex.test(value)

	$: color = color?.replace(validationRegex, '#$1') || ''
	$: noSubmit = !_isValid(color)

	const _onChange = (e) => {
		const {
			target: { value },
		} = e
		color = value
	}

	const _onSubmit = () => {
		dispatch('add', {
			color,
		})
	}
</script>

<form on:submit|preventDefault={_onSubmit}>
	<PaletteSlot bind:color role="presentation" tabindex="-1" />
	<input
		type="text"
		value={color}
		aria-label={inputAriaLabel}
		title={inputTitle}
		on:input|preventDefault={_onChange}
	/>
	<button type="submit" disabled={noSubmit} aria-label={buttonAriaLabel}>
		<svg x="0px" y="0px" width="100%" height="100%" viewBox="0 0 16 16" role="presentation">
			<polygon points="13,7 9,7 9,3 7,3 7,7 3,7 3,9 7,9 7,13 9,13 9,9 13,9" />
		</svg>
	</button>
</form>

<style>
	form {
		display: flex;
		align-items: center;
		column-gap: 0.5rem;
	}

	input {
		max-width: 6rem;
		height: 2.2rem;
		margin: 0;
		padding: 0.5rem;
	}

	button {
		min-width: 2.2rem;
		height: 2.2rem;
		margin: 0;
		padding: 0.5rem;
		border-color: #ccc;
	}

	button:disabled {
		opacity: 0.5;
	}

	button:focus {
		border-color: #666;
	}

	svg {
		width: 1rem;
		height: 1rem;
	}

	svg polygon {
		fill: #ccc;
	}

	button:focus svg polygon {
		fill: #666;
	}
</style>
