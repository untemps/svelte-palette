<script lang="ts">
	import CopyButton from './CopyButton.svelte'

	interface Props {
		code: string
		summary?: string
		open?: boolean
	}

	let { code, summary = 'View source', open = false }: Props = $props()
</script>

<details class="code" {open}>
	<summary>{summary}</summary>
	<div class="code__body">
		<CopyButton value={code} />
		<pre><code>{code}</code></pre>
	</div>
</details>
