<script>
	import { Palette } from '$lib'

	const blueColors = [
		{ name: 'Blue 1', value: '#e5f0ff' },
		{ name: 'Blue 2', value: '#cee5ff' },
		{ name: 'Blue 3', value: '#9CC9FE' },
		{ name: 'Blue 4', value: '#65b0fb' },
		{ name: 'Blue 5', value: '#3496ff' },
		{ name: 'Blue 6', value: '#057cff' },
		{ name: 'Blue 7', value: '#0362cd' },
		{ name: 'Blue 8', value: '#024b98' },
		{ name: 'Blue 9', value: '#003464' },
		{ name: 'Blue 10', value: '#021730' },
	]
	const purpleColors = [
		{ name: 'Purple 1', value: '#F8EEFC' },
		{ name: 'Purple 2', value: '#EFDBF8' },
		{ name: 'Purple 3', value: '#DFBBF2' },
		{ name: 'Purple 4', value: '#CF99EB' },
		{ name: 'Purple 5', value: '#C076E5' },
		{ name: 'Purple 6', value: '#AF52DF' },
		{ name: 'Purple 7', value: '#8A42B1' },
		{ name: 'Purple 8', value: '#6A3184' },
		{ name: 'Purple 9', value: '#432258' },
		{ name: 'Purple 10', value: '#23102A' },
	]
	const redColors = [
		{ name: 'Red 1', value: '#FEEAEA' },
		{ name: 'Red 2', value: '#FFD9D6' },
		{ name: 'Red 3', value: '#FFB2AC' },
		{ name: 'Red 4', value: '#FF8983' },
		{ name: 'Red 5', value: '#FF635A' },
		{ name: 'Red 6', value: '#FF3B2F' },
		{ name: 'Red 7', value: '#CC3127' },
		{ name: 'Red 8', value: '#99241E' },
		{ name: 'Red 9', value: '#661A13' },
		{ name: 'Red 10', value: '#350A0C' },
	]
</script>

<main class="example3" style="--bgColor:#000">
	<div class="content">
		<Palette class="palette__custom" colors={blueColors} numColumns="10">
			<div slot="header" class="header">
				<h1>Blue</h1>
			</div>
			<div slot="slot" class="slot" let:color let:colorName let:index>
				<div class="slot__color" style="--color:{color}"></div>
				<div>
					<div class="slot__color-rank">{`${index < 9 ? '0' : ''}${index + 1}`}</div>
					<div class="slot__color-label">{colorName}</div>
				</div>
			</div>
			<div slot="input"></div>
			<div slot="tools"></div>
		</Palette>
		<Palette class="palette__custom" colors={purpleColors} numColumns="10">
			<div slot="header" class="header">
				<h1>Purple</h1>
			</div>
			<div slot="slot" class="slot" let:color let:colorName let:index>
				<div class="slot__color" style="--color:{color}"></div>
				<div>
					<div class="slot__color-rank">{`${index < 9 ? '0' : ''}${index + 1}`}</div>
					<div class="slot__color-label">{colorName}</div>
				</div>
			</div>
			<div slot="input"></div>
			<div slot="tools"></div>
		</Palette>
		<Palette class="palette__custom" colors={redColors} numColumns="10">
			<div slot="header" class="header">
				<h1>Red</h1>
			</div>
			<div slot="slot" class="slot" let:color let:colorName let:index>
				<div class="slot__color" style="--color:{color}"></div>
				<div>
					<div class="slot__color-rank">{`${index < 9 ? '0' : ''}${index + 1}`}</div>
					<div class="slot__color-label">{colorName}</div>
				</div>
			</div>
			<div slot="input"></div>
			<div slot="tools"></div>
		</Palette>
	</div>
</main>

<style>
	.example3 {
		position: relative;
		overflow-x: hidden;
		min-height: 100%;
		display: flex;
		justify-content: center;
		align-items: stretch;
		background-color: var(--bgColor);
		padding: 1rem;
	}

	.example3 .content {
		width: 100%;
		max-width: 600px;
		min-height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		row-gap: 1px;
	}

	.example3 :global(.palette[role='main'].palette__custom) {
		background-color: #fff;
	}

	@media screen and (max-width: 640px) {
		.example3 :global(.palette[role='main'].palette__custom .palette__cells) {
			grid-template-columns: repeat(var(--num-columns), minmax(1rem, 1fr));
			column-gap: 0;
		}
	}

	.example3 .header {
		width: 100%;
	}

	.example3 .header > h1 {
		font-size: 1rem;
		font-weight: 700;
		margin-bottom: 0.5rem;
	}

	.example3 .slot {
		width: 100%;
		display: flex;
		flex-direction: column;
		row-gap: 0.5rem;
	}

	@media screen and (max-width: 320px) {
		.example3 .slot {
			row-gap: 0;
		}
	}

	.example3 .slot__color {
		width: 100%;
		max-width: 50px;
		height: 50px;
		background-color: var(--color);
	}

	.example3 .slot__color-rank {
		font-size: 0, 9rem;
		font-weight: 700;
	}

	@media screen and (max-width: 320px) {
		.example3 .slot__color-rank {
			display: none;
		}
	}

	.example3 .slot__color-label {
		font-size: 0.6rem;
		font-weight: 400;
	}

	@media screen and (max-width: 640px) {
		.example3 .slot__color-label {
			display: none;
		}
	}
</style>
