<script>
	import { Palette } from '$lib'

	const blueColors = [
		'#e5f0ff',
		'#cee5ff',
		'#9CC9FE',
		'#65b0fb',
		'#3496ff',
		'#057cff',
		'#0362cd',
		'#024b98',
		'#003464',
		'#021730',
	]
	const purpleColors = [
		'#F8EEFC',
		'#EFDBF8',
		'#DFBBF2',
		'#CF99EB',
		'#C076E5',
		'#AF52DF',
		'#8A42B1',
		'#6A3184',
		'#432258',
		'#23102A',
	]
	const redColors = [
		'#FEEAEA',
		'#FFD9D6',
		'#FFB2AC',
		'#FF8983',
		'#FF635A',
		'#FF3B2F',
		'#CC3127',
		'#99241E',
		'#661A13',
		'#350A0C',
	]
</script>

<main class="example3" style="--bgColor:#000">
	<div class="content">
		<Palette class="palette__custom" colors={blueColors} numColumns="10">
			<div slot="header" class="header">
				<h1>Blue</h1>
			</div>
			<div slot="slot" class="slot" let:color let:index>
				<div class="slot__color" style="--color:{color}"></div>
				<div>
					<div class="slot__color-rank">{`${index < 9 ? '0' : ''}${index + 1}`}</div>
					<div class="slot__color-label">{color}</div>
				</div>
			</div>
			<div slot="input"></div>
			<div slot="tools"></div>
		</Palette>
		<Palette class="palette__custom" colors={purpleColors} numColumns="10">
			<div slot="header" class="header">
				<h1>Purple</h1>
			</div>
			<div slot="slot" class="slot" let:color let:index>
				<div class="slot__color" style="--color:{color}"></div>
				<div>
					<div class="slot__color-rank">{`${index < 9 ? '0' : ''}${index + 1}`}</div>
					<div class="slot__color-label">{color}</div>
				</div>
			</div>
			<div slot="input"></div>
			<div slot="tools"></div>
		</Palette>
		<Palette class="palette__custom" colors={redColors} numColumns="10">
			<div slot="header" class="header">
				<h1>Red</h1>
			</div>
			<div slot="slot" class="slot" let:color let:index>
				<div class="slot__color" style="--color:{color}"></div>
				<div>
					<div class="slot__color-rank">{`${index < 9 ? '0' : ''}${index + 1}`}</div>
					<div class="slot__color-label">{color}</div>
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
