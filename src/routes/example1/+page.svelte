<script>
	import { onMount } from 'svelte'
	import { fade, blur, fly, scale } from 'svelte/transition'
	import { elasticOut } from 'svelte/easing'
	import { Button, Select, SelectItem, Slider, Toggle } from 'carbon-components-svelte'
	import Close from 'carbon-icons-svelte/lib/Close.svelte'

	import { Palette } from '$lib'

	let unique = {}
	let colors = null

	/*onMount(() => {
		colors = fetch('https://www.colr.org/json/colors/random/30')
			.then((result) => {
				return result.json()
			})
			.then((result) => {
				const colorList = result.colors.filter((c) => c.hex?.length).map((c) => `#${c.hex}`)
				return colorList
			})
			.then((result) => {
				return new Promise((resolve) => setTimeout(() => resolve(result), 2000))
			})
			.then((result) => {
				maxNumColumns = result.length + 2
				bgColor = result[Math.round(Math.random() * (result.length - 1))]
				return result
			})
	})*/

	colors = [
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

	let bgColor = colors?.[Math.round(Math.random() * (colors?.length - 1))]

	let preselectColor = true
	let allowDuplicates = true
	let deletionMode = 'tooltip'
	let useCustomTooltipClass = false
	let useCustomTooltipContent = false
	let showTransparentSlot = true
	let maxColors = 30
	let showInput = true
	let inputType = 'text'
	let showCompactControl = true
	let numColumns = 5
	let maxNumColumns = 10
	let transitionType = 'custom'

	$: unique = {}

	const whoosh = (node, params) => {
		const existingTransform = getComputedStyle(node).transform.replace('none', '')

		return {
			delay: params.delay || 0,
			duration: params.duration || 400,
			easing: params.easing || elasticOut,
			css: (t, u) => `transform: ${existingTransform} scale(${t})`,
		}
	}

	const transitions = {
		none: null,
		custom: { fn: whoosh, args: { duration: 3600 } },
		blur: { fn: blur, args: { duration: 1000 } },
		fade: { fn: fade, args: { duration: 1000 } },
		fly: { fn: fly, args: { y: 20, duration: 1000 } },
		scale: { fn: scale, args: { opacity: 0.5, start: 0.5, duration: 1000 } },
	}
</script>

<main class="example1" style="--bgColor:{bgColor}">
	<div class="content">
		<div>
			{#key unique}
				<Palette
					class="palette__custom"
					{colors}
					compactColorIndices={showCompactControl ? compactIndices : null}
					selectedColor={preselectColor ? bgColor : null}
					{allowDuplicates}
					{deletionMode}
					tooltipClassName={useCustomTooltipClass ? 'tooltip' : null}
					tooltipContentSelector={useCustomTooltipContent ? '#tooltip-content' : null}
					{showTransparentSlot}
					{maxColors}
					{showInput}
					{inputType}
					{numColumns}
					transition={transitions[transitionType]}
					on:select={({ detail: { color } }) => {
						bgColor = color
						preselectColor = !!bgColor
					}}
				>
					<div slot="settings" class="palette__settings" let:onClose>
						<div class="settings">
							<Button
								kind="tertiary"
								iconDescription="Close Settings"
								tooltipPosition="left"
								icon={Close}
								class="settings__close-button"
								on:click={onClose}
							/>
							<form class="settings__form">
								<div class="settings__preselection">
									<Toggle labelText="Preselect Color" size="sm" bind:toggled={preselectColor}>
										<span slot="labelA" />
										<span slot="labelB" />
									</Toggle>
									<span
										class="settings__preselection__color"
										style={`background-color: ${bgColor}`}
									/>
								</div>
								<hr class="settings__space" />
								<Select
									labelText="Input Type"
									inline
									selected={inputType}
									on:change={(e) => (inputType = e.target.value)}
								>
									<SelectItem value="text" />
									<SelectItem value="color" />
								</Select>
								<hr class="settings__space" />
								<Slider
									labelText="Number of Columns"
									fullWidth
									min={0}
									max={maxNumColumns}
									step={1}
									bind:value={numColumns}
								/>
								<hr class="settings__space" />
								<Slider
									labelText="Maximum Number of Colors"
									fullWidth
									min={1}
									max={50}
									step={1}
									bind:value={maxColors}
								/>
								<hr class="settings__space" />
								<Toggle labelText="Allow Duplicates" size="sm" bind:toggled={allowDuplicates}>
									<span slot="labelA" />
									<span slot="labelB" />
								</Toggle>
								<hr class="settings__space" />
								<Select
									labelText="Deletion Mode"
									inline
									selected={deletionMode}
									on:change={(e) => (deletionMode = e.target.value)}
								>
									<SelectItem value="none" />
									<SelectItem value="tooltip" />
									<SelectItem value="drop" />
								</Select>
								<hr class="settings__space" />
								<Toggle labelText="Custom Tooltip Class" size="sm" bind:toggled={useCustomTooltipClass}>
									<span slot="labelA" />
									<span slot="labelB" />
								</Toggle>
								<hr class="settings__space" />
								<Toggle
									labelText="Custom Tooltip Content"
									size="sm"
									bind:toggled={useCustomTooltipContent}
								>
									<span slot="labelA" />
									<span slot="labelB" />
								</Toggle>
								<div style="position: absolute; left: -200px; top: -200px">
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
								<hr class="settings__space" />
								<Toggle labelText="Show Input" size="sm" bind:toggled={showInput}>
									<span slot="labelA" />
									<span slot="labelB" />
								</Toggle>
								<hr class="settings__space" />
								<Select
									labelText="Transition Type"
									inline
									bind:selected={transitionType}
									on:change={(e) => (transitionType = e.target.value)}
								>
									<SelectItem value="none" />
									<SelectItem value="custom" />
									<SelectItem value="fade" />
									<SelectItem value="blur" />
									<SelectItem value="fly" />
									<SelectItem value="scale" />
								</Select>
							</form>
						</div>
					</div>
				</Palette>
			{/key}
		</div>
	</div>
</main>

<style>
	.example1 {
		position: relative;
		overflow-x: hidden;
		min-height: 100%;
		display: flex;
		justify-content: space-between;
		align-items: stretch;
		background-color: var(--bgColor);
	}

	.example1 .content {
		width: 100%;
		max-width: 100%;
		min-height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.example1 :global(.palette[role='main'].palette__custom) {
		background-color: #fff;
	}

	.example1 .palette__settings {
		position: absolute;
		right: 0;
		top: 0;
		bottom: 0;
		z-index: 999;
	}

	.example1 .settings {
		overflow: hidden auto;
		width: 320px;
		min-width: 320px;
		min-height: 100%;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		justify-content: center;
		background-color: black;
		padding: 2rem;
	}

	.example1 :global(.bx--btn.bx--btn--icon-only.bx--tooltip__trigger) {
		position: absolute !important;
		right: 20px !important;
		top: 20px !important;
	}

	.example1 :global(.settings--collapsed > .bx--btn.bx--btn--icon-only.bx--tooltip__trigger.settings__close-button) {
		display: none !important;
	}

	.example1 :global(.settings--expanded + .bx--btn.bx--btn--icon-only.bx--tooltip__trigger.settings__open-button) {
		display: none !important;
	}

	.example1 .settings__form {
		width: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: flex-start;
	}

	.example1 .settings__space {
		border: none;
		margin: 0.5rem 0;
	}

	.example1 .settings__preselection {
		position: relative;
	}

	.example1 .settings__preselection__color {
		position: absolute;
		top: 24px;
		left: 46px;
		width: 50px;
		height: 16px;
	}

	.example1 :global(.bx--toggle__switch) {
		margin-top: 0.5rem !important;
	}

	.example1 :global(.bx--slider__range-label) {
		font-family: 'IBM Plex Sans', 'Helvetica Neue', Arial, sans-serif !important;
		font-size: 0.75rem !important;
		color: #c6c6c6 !important;
	}

	.example1 :global(.bx--slider) {
		min-width: 6rem !important;
	}

	.example1 :global(.bx--form-item) {
		width: 100%;
	}

	.example1 :global(.tooltip) {
		position: absolute;
		z-index: 9999;
		max-width: initial;
		background-color: #fff;
		color: #fff;
		text-align: center;
		border-radius: 0;
		padding: 0.5rem;
		filter: drop-shadow(0px 0px 5px rgba(0, 0, 0, 0.3));
	}

	.example1 :global(.tooltip::after) {
		content: '';
		position: absolute;
		top: 100%;
		left: 50%;
		margin-left: -5px;
		border-width: 5px;
		border-style: solid;
		border-color: #fff transparent transparent transparent;
	}
</style>
