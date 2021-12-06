<script>
	import { Palette, PaletteSlot } from '../../src'

	const colors = [
		'#865C54',
		'#8F5447',
		'#A65846',
		'#A9715E',
		'#AD8C72',
		'#C2B091',
		'#172B41',
		'#32465C',
		'#617899',
		'#9BA2BC',
		'#847999',
		'#50526A',
		'#8B8C6B',
		'#97A847',
		'#5B652C',
		'#6A6A40',
		'#F2D9BF',
		'#F5BAAE',
		'#F1A191',
	]

	let bgColor = colors[0]
	let selectedColor = null
	let isSubmitted = false

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
	<div class="container">
		<Palette {colors} selectedColor={bgColor} allowDuplicates allowDeletion showTransparentSlot maxColors={30} on:select={({ detail: { color } }) => (bgColor = color)} class='palette' />
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
				<hr slot='header-divider' class='palette__divider'/>
				<button
					let:color
					slot="slot"
					class={`palette__slot${selectedColor === color ? ' palette__slot--selected' : ''}`}
					style="--color:{color}"
					on:click|preventDefault={_onSlotClick(color)}
				/>
				<hr slot='footer-divider' class='palette__divider'/>
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

	.container {
		max-width: 640px;
		display: flex;
		flex-direction: column;
		row-gap: 5rem;
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

    :global(.palette) {
        display: flex;
        flex-direction: column;
        row-gap: 1rem;
		padding: 2rem;
        background: white;
        box-shadow: 0 0 10px 5px rgba(0,0,0,0.18);;
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

	.palette__divider {
        border: #ccc dashed 1px;
        width: 50%;
	}

	.palette__slot.palette__slot--selected {
		box-shadow: 0 0 0 2px #fff, 0 0 0 4px var(--color);
	}
</style>
