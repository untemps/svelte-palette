<script lang="ts">
	import { createClipboard } from '../lib/clipboard.svelte'
	import Icon from './Icon.svelte'

	interface Props {
		value: string
		label?: string
		class?: string
	}

	let { value, label = 'Copy code', class: className = 'btn btn--ghost btn--sm code__copy' }: Props = $props()

	const clip = createClipboard()
</script>

<button type="button" class={className} onclick={() => clip.copy(value)} aria-label={clip.copied ? 'Copied' : label}>
	<Icon name={clip.copied ? 'check' : 'copy'} size={16} />
	<span aria-hidden="true">{clip.copied ? 'Copied' : 'Copy'}</span>
	<span class="visually-hidden" role="status" aria-live="polite">{clip.copied ? 'Copied to clipboard' : ''}</span>
</button>
