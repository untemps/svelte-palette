<script lang="ts">
	import { Palette } from '$lib'

	import type { ColorsProp, ColorObject } from '$lib/types'

	// One slot per accepted format — the palette renders each straight from CSS, and the `name`
	// surfaces the format in the slot tooltip.
	const _initialColors: ColorObject[] = [
		{ name: 'Named color', value: 'rebeccapurple' },
		{ name: 'rgb()', value: 'rgb(46, 196, 182)' },
		{ name: 'rgba() with alpha', value: 'rgba(231, 29, 54, 0.5)' },
		{ name: 'hsl() space syntax', value: 'hsl(41 100% 55%)' },
		{ name: 'Hex', value: '#3a86ff' },
	]

	let colors = $state<ColorsProp>(_initialColors)
	let selectedColor = $state<string | null>(null)

	// After the palette normalizes an added color, the bound list holds it as hex — read it back
	// to show typed rgb()/hsl()/named input landing canonicalized.
	const _values = $derived(
		Array.isArray(colors) ? colors.map((color) => (typeof color === 'string' ? color : color.value)) : []
	)
</script>

<main class="example9" style="--bgColor:{selectedColor ?? '#1b1b1b'}">
	<h1 class="title">Any CSS Color Format</h1>
	<p class="intro">
		The input accepts hex, <code>rgb()</code>/<code>rgba()</code>, <code>hsl()</code>/<code>hsla()</code> (comma or
		space syntax) and CSS named colors. Type <code>red</code>, <code>rgb(255 0 0)</code> or
		<code>hsl(210 100% 50%)</code> and the submit button lights up. Whatever you type is normalized to hex on add —
		8-digit <code>#RRGGBBAA</code> when it carries alpha — matching the eyedropper.
	</p>

	<div class="content">
		<Palette
			class="palette__custom"
			data-palette-theme="light"
			bind:colors
			bind:selectedColor
			allowDuplicates
			showInput
			numColumns={5}
		/>
	</div>

	<div class="values" data-testid="__example-values__">
		<span class="values__label">Stored values</span>
		<ul class="values__list">
			{#each _values as value (value)}
				<li><code>{value}</code></li>
			{/each}
		</ul>
	</div>
</main>

<style>
	.example9 {
		min-height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.25rem;
		padding: 2.5rem 1.5rem;
		font-family: Helvetica, sans-serif;
		color: #f5f5f5;
		background-color: var(--bgColor);
		transition: background-color 0.4s ease;
	}

	.title {
		margin: 0;
		font-size: 1.75rem;
		text-align: center;
	}

	.intro {
		max-width: 42rem;
		margin: 0;
		text-align: center;
		line-height: 1.5;
	}

	.intro code {
		padding: 0.05rem 0.3rem;
		font-size: 0.85em;
		background-color: rgba(255, 255, 255, 0.14);
		border-radius: 0.2rem;
	}

	.content {
		width: 100%;
		max-width: 26rem;
	}

	.example9 :global(.palette[data-palette].palette__custom) {
		border-radius: 0.5rem;
		overflow: hidden;
	}

	.values {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.8rem;
	}

	.values__label {
		padding: 0.1rem 0.4rem;
		font-family: monospace;
		color: #1b1b1b;
		background-color: #f5f5f5;
		border-radius: 0.2rem;
	}

	.values__list {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.4rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.values__list code {
		padding: 0.1rem 0.4rem;
		background-color: rgba(255, 255, 255, 0.14);
		border-radius: 0.2rem;
	}
</style>
