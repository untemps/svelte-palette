<script>
	import { Palette } from '$lib'

	const colors = [
		{
			name: 'Warm',
			colors: ['#865C54', '#8F5447', '#A65846', '#A9715E', '#AD8C72', '#C2B091'],
		},
		{
			name: 'Cool',
			colors: ['#172B41', '#32465C', '#617899', '#9BA2BC', '#847999', '#50526A'],
		},
		{
			name: 'Nature',
			colors: ['#8B8C6B', '#97A847', '#5B652C', '#6A6A40'],
		},
		{
			name: 'Vivid',
			colors: ['#F2D9BF', '#F5BAAE', '#F1A191', '#F56476', '#E43F6F', '#BE3E82', '#5E4352'],
		},
	]

	let selectedColor = $state(colors[0].colors[0])
</script>

<main class="example5" style="--bgColor:{selectedColor}">
	<h1 class="title">Color Groups</h1>
	<div class="content">
		<Palette
			class="palette__custom"
			{colors}
			bind:selectedColor
			numColumns={6}
			onselect={({ color }) => {
				selectedColor = color
			}}
		/>
	</div>
</main>

<style>
	.example5 {
		position: relative;
		overflow-x: hidden;
		min-height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		gap: 1em;
		background-color: var(--bgColor);
		transition: background-color 0.3s ease;
	}

	.example5 .title {
		width: 100%;
		max-width: 480px;
		text-align: left;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-size: 0.65rem;
		font-weight: 800;
	}

	.example5 .content {
		width: 100%;
		max-width: 480px;
	}

	.example5 :global(.palette[role='main'].palette__custom) {
		background-color: #fff;
		border-radius: 0.5rem;
	}

	.example5 :global(.palette__groups__group) {
		flex-direction: row;
		align-items: center;
	}

	.example5 :global(.palette__groups__group__name) {
		color: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-size: 0.65rem;
		width: 100px;
		height: 50px;
		background-color: #000;
		border-radius: 0.5rem;
	}

	.example5 :global(.palette__cells) {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 1em;
		border-radius: 0.5rem;
		padding: 0 1em;
		height: 50px;
	}
</style>
