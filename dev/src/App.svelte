<script>
	import { Palette, PaletteSlot } from '../../src'

	let bgColor = '#e9f1c6'
	let selectedColor = null
	let isSubmitted = false

	const colors = [
		'#53067C',
		'#892DDC',
		'#BC6FF1',
		'#3D0000',
		'#950101',
		'#FF0000',
		'#1C0C5B',
		'#3D2C8D',
		'#916BBF',
		'#C996CC',
		'#345B63',
		'#152D35',
		'#112031',
		'#7D1935',
		'#B42B51',
		'#E63E6D',
		'#3B5249',
		'#519872',
		'#A4B494',
	]

	const _onSlotClick = (color) => () => {
		isSubmitted = false
		selectedColor = color
	}

	const _onSubmit = () => {
		console.log('submit')
		isSubmitted = true
	}
</script>

<main style="--bgColor:{bgColor}">
	<div class='container'>
		<Palette {colors} on:select={({ detail: { color } }) => (bgColor = color)} />
		<hr />
		<form on:submit|preventDefault={_onSubmit}>
			<Palette {colors}>
				<div slot="header" class="palette__header">
					<h1>Pick a color</h1>
					{#if isSubmitted}
						<div class="form__message--success">
							Picked Color: <PaletteSlot color={selectedColor} />
						</div>
					{/if}
				</div>
				<button
					let:color
					slot="slot"
					class={`palette__slot${selectedColor === color ? ' palette__slot--selected' : ''}`}
					style="--color:{color}"
					on:click|preventDefault={_onSlotClick(color)}
				/>
				<div slot="input" />
				<div slot="footer" class="palette__footer">
					<button class="form__button" type="submit" disabled={!selectedColor}>Submit</button>
				</div>
			</Palette>
		</form>
	</div>

</main>

<style>
	main {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		padding: 1rem;
		background-color: var(--bgColor);
	}

	hr {
		background-color: #fff;
		border: none;
		height: 1px;
	}

	.container {
		max-width: 640px;
	}

	.form__message--success {
		display: flex;
		align-items: center;
		column-gap: 0.5rem;
		padding: 1rem;
		background-color: #e3e3e3;
		border-radius: 0.7rem;
	}

	.form__button {
		margin: 0;
	}

	.palette__header {
		display: flex;
		flex-direction: column;
		align-items: center;
		column-gap: 0.5rem;
		border-radius: 0.7rem;
	}

	.palette__slot {
		cursor: pointer;
		width: 2rem;
		height: 2rem;
		margin: 0;
		background-color: var(--color);
		border-radius: 20%;
		border: 1px solid rgba(0, 0, 0, 0.2);
		box-shadow: 0.1rem 0.1rem 0.3rem rgba(0, 0, 0, 0.2);
	}

	.palette__slot.palette__slot--selected {
		box-shadow: 0 0 0 2px #fff, 0 0 0 4px var(--color);
	}
</style>
