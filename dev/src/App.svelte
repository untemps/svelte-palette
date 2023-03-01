<script>
	import { Palette } from '../../src'

	import SettingsIcon from './SettingsIcon.svelte'
	import CloseIcon from './CloseIcon.svelte'

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
		'#F56476',
		'#E43F6F',
		'#BE3E82',
		'#5E4352',
	]
	const compactIndices = [2, 7, 13, 20]

	let bgColor = colors[Math.round(Math.random() * (colors.length - 1))]

	let preselectColor = true
	let allowDuplicates = true
	let deletionMode = 'tooltip'
	let useCustomTooltipClass = false
	let useCustomTooltipContent = false
	let showTransparentSlot = true
	let maxColors = 23
	let inputType = 'text'
	let useCustomClass = false
	let showCompactControl = true
	let numColumns = 5
</script>

<style>
	main {
		position: relative;
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: 100%;
		background-color: var(--bgColor);
	}

	.toggle__button {
		background: none;
		border: none;
		color: white;
		cursor: pointer;
		width: 36px;
	}

	.container {
        width: 100%;
		display: flex;
        flex-direction: column;
		align-items: center;
	}

	.settings__container {
		overflow: hidden auto;
		width: 100vw;
        height: 100vh;
		max-width: 320px;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
	}

	.settings__form {
        height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 1rem;
		background-color: #fafafa;
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
		margin: 0;
	}

	:global(.palette) {
		display: flex;
		flex-direction: column;
		row-gap: 1rem;
		padding: 2rem;
		background: black;
		box-shadow: 0 0 10px 5px rgba(0, 0, 0, 0.18);
	}

	:global(.tooltip) {
		position: absolute;
		z-index: 9999;
		max-width: 120px;
		background-color: #ee7008;
		color: #fff;
		text-align: center;
		border-radius: 6px;
		padding: 0.5rem;
	}

	:global(.tooltip::after) {
		content: '';
		position: absolute;
		top: 100%;
		left: 50%;
		margin-left: -5px;
		border-width: 5px;
		border-style: solid;
		border-color: #ee7008 transparent transparent transparent;
	}

	@media screen and (max-height: 700px) {
		.settings__container {
			max-height: 100vh;
		}
	}
</style>

<main style="--bgColor:{bgColor}">
	<div class="container">
		<Palette
			colors={colors}
            compactColorIndices={showCompactControl ? compactIndices : null}
			selectedColor={preselectColor ? bgColor : null}
			allowDuplicates={allowDuplicates}
			deletionMode={deletionMode}
			tooltipClassName={useCustomTooltipClass ? 'tooltip' : null}
			tooltipContentSelector={useCustomTooltipContent ? '.palette__tooltip__button' : null}
			showTransparentSlot={showTransparentSlot}
			maxColors={maxColors}
			inputType={inputType}
            numColumns={numColumns}
			on:select={({ detail: { color } }) => {
				bgColor = color
				preselectColor = !!bgColor
			}}
			class={useCustomClass ? 'palette' : null} />
	</div>
    <div class="settings__container">
        <form class="settings__form">
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
                    Deletion Mode:
                    <select bind:value={deletionMode}>
                        <option value="none">none</option>
                        <option value="tooltip">tooltip</option>
                        <option value="drop">drop</option>
                    </select>
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
                    <button type="button" class="palette__tooltip__button">Delete</button>
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
            <fieldset>
                <label>
                    Show Compact Control:
                    <input type="checkbox" bind:checked={showCompactControl} />
                </label>
            </fieldset>
            <fieldset>
                <label>
                    Number of Columns:
                    <input type="range" min={1} max={colors.length + 2} bind:value={numColumns} />
                </label>
            </fieldset>
        </form>
    </div>
</main>
