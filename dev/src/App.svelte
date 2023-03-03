<script>
	import { Button, Select, SelectItem, Slider, Toggle } from 'carbon-components-svelte'

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
	let showCompactControl = true
	let numColumns = 5
</script>

<style>
	main {
		overflow: hidden;
		position: relative;
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: 100%;
		background-color: var(--bgColor);
	}

	.container {
		width: 100%;
        max-width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.settings__container {
		overflow: hidden auto;
		width: 480px;
		height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
        justify-content: center;
		background-color: black;
	}

	.settings__form {
		width: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: flex-start;
		padding: 2rem;
	}

	.settings__space {
		border: none;
		margin: 0.5rem 0;
	}

	.settings__preselection {
		position: relative;
	}

	.settings__preselection__color {
		position: absolute;
		top: 24px;
		left: 46px;
		width: 50px;
		height: 16px;
	}

	:global(.bx--toggle__switch) {
		margin-top: 0.5rem !important;
	}

	:global(.bx--slider__range-label) {
		font-family: 'IBM Plex Sans' !important;
		font-size: 0.75rem !important;
		color: #c6c6c6 !important;
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
			tooltipContentSelector={useCustomTooltipContent ? '#tooltip-content' : null}
			showTransparentSlot={showTransparentSlot}
			maxColors={maxColors}
			inputType={inputType}
			numColumns={numColumns}
			on:select={({ detail: { color } }) => {
				bgColor = color
				preselectColor = !!bgColor
			}} />
	</div>
	<div class="settings__container">
		<form class="settings__form">
			<div class="settings__preselection">
				<Toggle labelText="Preselect Color" size="sm" bind:toggled={preselectColor}>
					<span slot="labelA" />
					<span slot="labelB" />
				</Toggle>
				<span class="settings__preselection__color" style={`background-color: ${bgColor}`} />
			</div>
            <hr class="settings__space" />
            <Slider
                    labelText="Set Number of Columns"
                    hideTextInput
                    min={1}
                    max={colors.length + 2}
                    step={1}
                    bind:value={numColumns} />
            <hr class="settings__space" />
            <Slider labelText="Set Max Colors" hideTextInput min={1} max={50} step={1} bind:value={maxColors} />
			<hr class="settings__space" />
			<Toggle labelText="Allow Duplicates" size="sm" bind:toggled={allowDuplicates}>
				<span slot="labelA" />
				<span slot="labelB" />
			</Toggle>
            <hr class="settings__space" />
            <Select labelText="Input Type" inline bind:selected={inputType}>
                <SelectItem value="text" />
                <SelectItem value="color" />
            </Select>
			<hr class="settings__space" />
			<Select labelText="Select Deletion Mode" inline bind:selected={deletionMode}>
				<SelectItem value="none" />
				<SelectItem value="tooltip" />
				<SelectItem value="drop" />
			</Select>
			<hr class="settings__space" />
			<Toggle labelText="Customize Tooltip Class" size="sm" bind:toggled={useCustomTooltipClass}>
				<span slot="labelA" />
				<span slot="labelB" />
			</Toggle>
			<hr class="settings__space" />
			<Toggle labelText="Customize Tooltip Content" size="sm" bind:toggled={useCustomTooltipContent}>
				<span slot="labelA" />
				<span slot="labelB" />
			</Toggle>
			<div style="position: absolute; left: -200px">
				<Button id="tooltip-content">Delete</Button>
			</div>
			<hr class="settings__space" />
			<Toggle labelText="Show Transparent Slot" size="sm" bind:toggled={showTransparentSlot}>
				<span slot="labelA" />
				<span slot="labelB" />
			</Toggle>
			<hr class="settings__space" />
            <Toggle labelText="Show Compact Control" size="sm" bind:toggled={showCompactControl}>
                <span slot="labelA" />
                <span slot="labelB" />
            </Toggle>
		</form>
	</div>
</main>
