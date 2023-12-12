<script>
	import { Palette } from '$lib'

	const colors1 = ['#EDEDE9', '#D6CCC2', '#F5EBE0', '#E3D5CA', '#D5BDAF']
	const colors2 = ['#2F1847', '#624763', '#C62E65', '#F9B3D1', '#D63AF9']
	const colors3 = ['#DEF2C8', '#C5DAC1', '#BCD0C7', '#A9B2AC', '#898980']
	const colors4 = ['#F2F3AE', '#EDD382', '#FC9E4F', '#F4442E', '#020122']

	let bgColor = '#000'
</script>

<main class="example2" style="--bgColor:{bgColor}">
	<div class="content">
		<div class="content__grid">
			<Palette class="palette__custom" colors={colors1} numColumns="5">
				<div slot="slot" let:color style="--color: {color}" class="slot"></div>
				<div slot="tools"></div>
				<div slot="input"></div>
				<div slot="footer" class="footer">
					<h1>Quiet & Warm</h1>
					<p>Winter Sunday Afternoon</p>
				</div>
			</Palette>
			<Palette class="palette__custom" colors={colors2} numColumns="5">
				<div slot="slot" let:color style="--color: {color}" class="slot"></div>
				<div slot="tools"></div>
				<div slot="input"></div>
				<div slot="footer" class="footer">
					<h1>Fancy Night</h1>
					<p>Club, Cocktails & More</p>
				</div>
			</Palette>
			<Palette class="palette__custom" colors={colors3} numColumns="5">
				<div slot="slot" let:color style="--color: {color}" class="slot"></div>
				<div slot="tools"></div>
				<div slot="input"></div>
				<div slot="footer" class="footer">
					<h1>Grand'ma Jersey</h1>
					<p>Cozy Wool</p>
				</div>
			</Palette>
			<Palette class="palette__custom" colors={colors4} numColumns="5">
				<div slot="slot" let:color style="--color: {color}" class="slot"></div>
				<div slot="tools"></div>
				<div slot="input"></div>
				<div slot="footer" class="footer">
					<h1>California Sunset</h1>
					<p>Chill & the Beach</p>
				</div>
			</Palette>
		</div>
	</div>
</main>

<style>
	.example2 {
		position: relative;
		overflow-x: hidden;
		min-height: 100%;
		display: flex;
		justify-content: space-between;
		align-items: stretch;
		background-color: var(--bgColor);
	}

	.example2 .content {
		width: 100%;
		max-width: 100%;
		min-height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.example2 .content .content__grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		grid-template-rows: repeat(2, 1fr);
		grid-column-gap: 1rem;
		grid-row-gap: 1rem;
	}

	.example2 :global(.palette[role='main'].palette__custom) {
		background-color: #fff;
		border-radius: 1rem;
	}

	.example2 :global(.palette[role='main'].palette__custom > .palette__content) {
		padding: 0;
	}

	:global(.palette[role='main'].palette__custom > .palette__content > .palette__cells) {
		column-gap: 0;
	}

	.example2
		:global(.palette[role='main'].palette__custom > .palette__content > .palette__cells > li:first-child > .slot) {
		border-top-left-radius: 1rem;
	}

	.example2
		:global(.palette[role='main'].palette__custom > .palette__content > .palette__cells > li:last-child > .slot) {
		border-top-right-radius: 1rem;
	}

	.example2 .slot {
		background-color: var(--color);
		height: 100px;
		width: 100%;
	}

	.example2 .footer {
		width: 100%;
		padding: 1.5rem;
	}

	.example2 .footer h1 {
		font-size: 1.5rem;
		font-weight: 600;
	}
</style>
