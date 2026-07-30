<script lang="ts" module>
	export type IconName = 'sun' | 'moon' | 'github' | 'npm' | 'copy' | 'check' | 'external'
</script>

<script lang="ts">
	interface Props {
		name: IconName
		size?: number
	}

	let { name, size = 20 }: Props = $props()
</script>

{#if name === 'github'}
	<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
		<path
			d="M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.7 5.4-5.27 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5Z"
		/>
	</svg>
{:else if name === 'npm'}
	<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
		<path d="M2 4v16h9V7h4v13h7V4H2Zm7 14H6V8h3v10Z" />
	</svg>
{:else}
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
	>
		{#if name === 'sun'}
			<circle cx="12" cy="12" r="4" />
			<path
				d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
			/>
		{:else if name === 'moon'}
			<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
		{:else if name === 'copy'}
			<rect x="9" y="9" width="12" height="12" rx="2" />
			<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
		{:else if name === 'check'}
			<path d="M20 6 9 17l-5-5" />
		{:else if name === 'external'}
			<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
		{/if}
	</svg>
{/if}
