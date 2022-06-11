<script>
	import { Palette } from '../../src'

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

	let preselectColor = true
	let useCustomClass = false
	let allowDuplicates = true
	let allowDeletion = true
	let useCustomTooltipClass = false
	let useCustomTooltipContent = false
	let showTransparentSlot = true
	let maxColors = 20
	let inputType = 'text'
</script>

<main style="--bgColor:{bgColor}">
	<div class="container">
		<Palette
			{colors}
			selectedColor={preselectColor ? bgColor : null}
			{allowDuplicates}
			{allowDeletion}
            tooltipClassName={useCustomTooltipClass ? 'palette__tooltip' : null}
			tooltipContentSelector={useCustomTooltipContent ? '#tooltip-custom-template' : null}
			{showTransparentSlot}
			{maxColors}
            {inputType}
			on:select={({ detail: { color } }) => {
				bgColor = color
				preselectColor = !!color
			}}
			class={useCustomClass ? 'palette' : null}
		/>
		<form class="settings__form">
			<h1>Settings</h1>
			<fieldset>
				<label>
					Preselect color:
					<input type="checkbox" bind:checked={preselectColor} />
				</label>
			</fieldset>
			<fieldset>
				<label>
					Use Custom Class:
					<input type="checkbox" bind:checked={useCustomClass} />
				</label>
			</fieldset>
			<fieldset>
				<label>
					Allow Duplicates:
					<input type="checkbox" bind:checked={allowDuplicates} />
				</label>
			</fieldset>
			<fieldset>
				<label>
					Allow Deletion:
					<input type="checkbox" bind:checked={allowDeletion} />
				</label>
			</fieldset>
			<fieldset>
				<label>
					Use Custom Tooltip Class:
					<input type="checkbox" bind:checked={useCustomTooltipClass} />
				</label>
			</fieldset>
			<fieldset>
				<label>
					Use Custom Tooltip Content:
					<input type="checkbox" bind:checked={useCustomTooltipContent} />
				</label>
			</fieldset>
			<fieldset>
				<label>
					Show Transparent Slot:
					<input type="checkbox" bind:checked={showTransparentSlot} />
				</label>
			</fieldset>
			<fieldset>
				<label>
					Max Colors:
					<input type="number" min="1" max="30" bind:value={maxColors} />
				</label>
			</fieldset>
			<fieldset>
				<label>
					Input Type:
                    <select bind:value={inputType}>
                        <option value="text">text</option>
                        <option value="color">color</option>
                    </select>
				</label>
			</fieldset>
		</form>
	</div>
</main>

<template id="tooltip-custom-template">
	<button class="palette__tooltip__button">Delete</button>
</template>

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
		row-gap: 1rem;
	}

	.settings__form {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 1rem;
		background-color: #eee;
	}

	.settings__form fieldset {
		width: 100%;
		border: none;
	}

	.settings__form label {
		display: flex;
		align-items: center;
		justify-content: space-between;
		column-gap: 1rem;
	}

	.settings__form input {
		margin: 0;
	}

	.settings__form input[type='checkbox'] {
		padding: 0;
	}

    .palette__tooltip__button {
        pointer-events: none;
    }

	:global(.palette) {
		display: flex;
		flex-direction: column;
		row-gap: 1rem;
		padding: 2rem;
		background: #ffffff;
        border-radius: 1rem;
		box-shadow: 0 0 10px 5px rgba(0, 0, 0, 0.18);
	}

	:global(.palette__tooltip) {
		position: absolute;
		z-index: 9999;
		max-width: 120px;
		background-color: #ee7008;
		color: #fff;
		text-align: center;
		border-radius: 6px;
		padding: 0.5rem;
	}

	:global(.palette__tooltip::after) {
		content: '';
		position: absolute;
		top: 100%;
		left: 50%;
		margin-left: -5px;
		border-width: 5px;
		border-style: solid;
		border-color: #ee7008 transparent transparent transparent;
	}
</style>
