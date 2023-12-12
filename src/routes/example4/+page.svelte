<script>
	import fontColorContrast from 'font-color-contrast'

	import { Palette, PaletteInput, PaletteSlot } from '$lib'

	let colors = ['#F3B700', '#FAA300', '#E57C04', '#FF6201', '#F63E02', '#F50202']

	let selectedColor = colors[3]
	let textColor = '#fff'
	let showInput = false

	const _onSelect = ({ detail: { color } }) => {
		selectedColor = color
		textColor = fontColorContrast(selectedColor)
	}

	const _onOpen = () => {
		showInput = true
	}

	const _onClose = () => {
		showInput = false
	}

	const _onAdd = ({ detail: { color } }) => {
		colors = [...colors, color]
	}
</script>

<main class="example4" style="--bgColor:#000">
	<div class="content">
		<div>
			<Palette {colors} {selectedColor} numColumns={5} {showInput} allowDuplicates on:select={_onSelect}>
				<div
					slot="header"
					class="header"
					let:selectedColor
					style="--color:{selectedColor}; --textColor: {textColor}"
				>
					{selectedColor ?? ''}
				</div>
				<div slot="tools"></div>
				<PaletteSlot
					slot="slot"
					let:color
					{color}
					class="slot__custom"
					selected={color === selectedColor}
					on:select={_onSelect}
				></PaletteSlot>
				<li slot="after_slot" class="slot__add">
					<button class="icon-button" on:click={_onOpen}>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="32"
							height="32"
							fill="#646464"
							viewBox="0 0 256 256"
							><path
								d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"
							></path></svg
						>
					</button>
				</li>
				<div slot="input" let:selectedColor let:inputType class="input">
					<PaletteInput class="input__input" on:add={_onAdd} />
					<button class="icon-button" on:click={_onClose}>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							fill="#646464"
							viewBox="0 0 256 256"
							><path
								d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"
							></path></svg
						>
					</button>
				</div>
			</Palette>
		</div>
	</div>
</main>

<style>
	.example4 {
		position: relative;
		overflow-x: hidden;
		min-height: 100%;
		display: flex;
		justify-content: space-between;
		align-items: stretch;
		background-color: var(--bgColor);
	}

	.example4 .content {
		width: 100%;
		max-width: 100%;
		min-height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.example4 .header {
		width: 100%;
		min-width: 12rem;
		height: 100px;
		background-color: var(--color);
		color: var(--textColor);
		padding: 0.5rem;
		margin-bottom: 1rem;
	}

	.example4 :global(button.slot__custom) {
		width: 2rem;
		height: 2rem;
		background-color: var(--color);
		border-radius: 50%;
	}

	.example4 :global(button.slot__custom--empty) {
		width: 2rem;
		height: 2rem;
		border: 1px solid #aaa;
		border-radius: 50%;
	}

	.example4 .slot__add {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.example4 .icon-button {
		background: none;
		border: none;
		padding: 0;
		margin-bottom: -6px;
		cursor: pointer;
	}

	.example4 .input {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: flex-start;
		width: 100%;
		position: relative;
	}

	.example4 :global(.input > .palette__divider) {
		display: none;
	}

	.example4 :global(.input .icon-button) {
		position: absolute;
		right: 1rem;
		top: -0.5rem;
	}
</style>
