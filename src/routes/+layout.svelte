<script lang="ts">
	import { onMount } from 'svelte'
	import type { Snippet } from 'svelte'

	import '../demo/styles/tokens.css'
	import '../demo/styles/base.css'
	import '../demo/styles/app.css'

	import { initTheme } from '../demo/lib/theme.svelte'
	import Header from '../demo/components/Header.svelte'
	import Footer from '../demo/components/Footer.svelte'

	let { children }: { children?: Snippet } = $props()

	onMount(() => initTheme())
</script>

<div class="page">
	<Header />
	{@render children?.()}
	<Footer />
</div>
