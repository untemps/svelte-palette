<script lang="ts">
	interface Props {
		/** Text announced by assistive tech while the palette colors are loading. */
		label?: string
	}

	let { label = 'Loading colors' }: Props = $props()
</script>

<div class="palette__loader" role="status">
	<svg
		class="palette__loader__spinner"
		width="24"
		viewBox="0 0 24 24"
		aria-hidden="true"
		xmlns="http://www.w3.org/2000/svg"
	>
		<path d="M12,2.5 A9.5,9.5 0 0,1 21.5,12" stroke-width="2" stroke="#ccc" fill="none" />
	</svg>
	<span class="palette__loader__label">{label}</span>
</div>

<style>
	.palette__loader__spinner {
		transform-origin: 50% 50%;
		animation: palette-spin 1s linear infinite;
	}

	.palette__loader__label {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	@keyframes palette-spin {
		to {
			transform: rotate(360deg);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.palette__loader__spinner {
			animation: none;
		}
	}
</style>
