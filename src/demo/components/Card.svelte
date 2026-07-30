<script lang="ts">
	import type { Snippet } from 'svelte'

	import CodeBlock from './CodeBlock.svelte'

	interface Props {
		title: string
		badge?: string
		description?: string
		code?: string
		docHref?: string
		docLabel?: string
		children?: Snippet
	}

	let { title, badge, description, code, docHref, docLabel = 'Read the docs', children }: Props = $props()
</script>

<article class="card">
	<div class="card__head">
		<h3 class="card__title">
			{title}
			{#if badge}<span class="card__badge">{badge}</span>{/if}
		</h3>
		{#if description}
			<p class="card__desc">{@html description}</p>
		{/if}
	</div>
	<div class="card__body">
		{@render children?.()}
		{#if code}<CodeBlock {code} />{/if}
		{#if docHref}
			<a class="card__link" href={docHref} target="_blank" rel="noopener noreferrer">{docLabel} →</a>
		{/if}
	</div>
</article>
