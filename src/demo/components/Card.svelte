<script lang="ts">
	import type { Snippet } from 'svelte'

	import CodeBlock from './CodeBlock.svelte'

	interface Props {
		/** Capability name shown as the card heading. */
		title: string
		/** Short monospace tag, usually the key prop/API this card is about. */
		badge?: string
		/** One-line description. Trusted static markup — inline `<code>` is allowed. */
		description?: string
		/** Minimal source snippet, rendered in a collapsible block. */
		code?: string
		/** Link to the matching README section. */
		docHref?: string
		docLabel?: string
		/** The live, interactive stage for the capability. */
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
			<!-- eslint-disable-next-line svelte/no-at-html-tags -- trusted static demo copy -->
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
