<script lang="ts">
	import { DEFAULT_LABELS } from '../labels'

	interface Props {
		/** The error that caused the async `colors` source to reject. Rendered as a message when it yields readable text. */
		error?: unknown
		/** Text announced by assistive tech and shown as the headline when the palette colors fail to load. */
		label?: string
	}

	let { error = null, label = DEFAULT_LABELS.error }: Props = $props()

	const _message = $derived.by(() => {
		if (error == null) {
			return ''
		}
		if (error instanceof Error) {
			return error.message
		}
		if (typeof error === 'string') {
			return error
		}
		if (typeof error === 'number' || typeof error === 'boolean') {
			return String(error)
		}
		const { message, statusText } = error as { message?: unknown; statusText?: unknown }
		if (typeof message === 'string' && message) {
			return message
		}
		if (typeof statusText === 'string' && statusText) {
			return statusText
		}
		return ''
	})
</script>

<div class="palette__error" role="alert">
	<svg
		class="palette__error__icon"
		width="24"
		height="24"
		viewBox="0 0 24 24"
		aria-hidden="true"
		xmlns="http://www.w3.org/2000/svg"
	>
		<circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" stroke-width="2" />
		<path d="M12 7v6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
		<circle cx="12" cy="16.5" r="1.25" fill="currentColor" />
	</svg>
	<span class="palette__error__label">{label}</span>
	{#if _message}
		<span class="palette__error__message">{_message}</span>
	{/if}
</div>

<style>
	.palette__error {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.4rem;
		text-align: center;
		color: #c0392b;
		font-family: inherit;
	}

	.palette__error__label {
		font-size: 0.875rem;
		font-weight: 600;
	}

	.palette__error__message {
		font-size: 0.75rem;
		color: #595959;
		word-break: break-word;
	}
</style>
