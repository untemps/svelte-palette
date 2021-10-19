<script>
	import Palette from '../../src'

	let colors = [
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

<main>
	<Palette {colors} />
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>
