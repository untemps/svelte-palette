<script>
	import { createEventDispatcher } from 'svelte'

	import { ADD, ERROR } from '../events/PaletteEvents'

	export let buttonAriaLabel = 'Submit this hex color value'

	const dispatch = createEventDispatcher()

	const _onClick = async () => {
		try {
			const eyeDropper = new EyeDropper()
			const { sRGBHex: color } = await eyeDropper.open()
			dispatch(ADD, {
				color,
			})
		} catch (error) {
			dispatch(ERROR, {
				error,
			})
		}
	}
</script>

{#if !!window.EyeDropper}
	<button data-testid="__palette-eyedropper-root__" type="submit" aria-label={buttonAriaLabel} on:click|preventDefault={_onClick}>
		<svg viewBox="0 0 16 16" width="16px" height="16px">
			<path
				d="M 16 2.908 C 15.991 2.106 15.656 1.343 15.072 0.794 C 13.917 -0.299 12.048 -0.258 10.904 0.886 L 9.096 2.694 C 8.315 1.982 7.113 2.009 6.365 2.756 L 5.786 3.335 C 5.272 3.85 5.272 4.683 5.786 5.199 L 5.956 5.368 L 1.809 9.515 C 1.039 10.288 0.7 11.39 0.902 12.461 L 0.096 14.307 C -0.092 14.734 0.002 15.232 0.333 15.561 C 0.579 15.808 0.913 15.948 1.262 15.948 C 1.445 15.948 1.625 15.91 1.792 15.837 L 3.522 15.081 C 4.594 15.283 5.696 14.944 6.469 14.174 L 10.615 10.028 L 10.785 10.197 C 11.3 10.711 12.134 10.711 12.649 10.197 L 13.228 9.618 C 13.974 8.87 14.001 7.668 13.29 6.887 L 15.131 5.045 C 15.7 4.481 16.013 3.709 16 2.908 Z M 5.537 13.242 C 5.036 13.741 4.309 13.936 3.626 13.754 C 3.482 13.716 3.329 13.728 3.193 13.787 L 1.424 14.559 L 2.196 12.791 C 2.256 12.654 2.268 12.501 2.229 12.357 C 2.048 11.674 2.243 10.947 2.741 10.447 L 6.888 6.3 L 9.683 9.096 L 5.537 13.242 Z"
			/>
		</svg>
	</button>
{/if}

<style>
	form {
		display: flex;
		align-items: center;
		column-gap: 0.5rem;
	}

	button {
		position: relative;
		width: 2rem;
		height: 2rem;
		margin: 0;
		background: none;
		border-color: rgba(0, 0, 0, 0);
		border-radius: 0.3rem;
		cursor: pointer;
	}

	button:disabled {
		opacity: 0.5;
	}

	button:focus {
		border-color: rgba(0, 0, 0, 0.3);
	}

	svg {
		position: absolute;
		top: calc(50% - 8px);
		left: calc(50% - 8px);
	}

	svg path {
		fill: rgba(0, 0, 0, 0.6);
	}
</style>
