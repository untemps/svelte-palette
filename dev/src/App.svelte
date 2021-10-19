<script>
	import Palette from '../../src'

	let bgColor = '#fff000'

	const colors = [
		'#ff0000',
		'#ffa600',
		'#37ff00',
		'#00ffff',
		'#000dff',
		'#a100ff',
		'#ff00f2',
		'#00ff95',
		'#ddff00',
		'#00e1ff',
	]
</script>

<main style="--bgColor:{bgColor}">
	<Palette {colors} on:select={({ detail: { color } }) => (bgColor = color)} />
</main>

<style>
	main {
		height: 100%;
		padding: 1rem;
		background-color: var(--bgColor);
	}
</style>
