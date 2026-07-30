/*
 * Per-instance clipboard helper. Returns a reactive `copied` flag that flips to
 * true for a short window after a successful copy, so a button can show a
 * transient "Copied" affordance without each caller wiring its own timer.
 */
export const createClipboard = (resetMs = 1600) => {
	let copied = $state(false)
	let timer: ReturnType<typeof setTimeout> | undefined

	const copy = async (value: string): Promise<void> => {
		try {
			await navigator.clipboard.writeText(value)
			copied = true
			clearTimeout(timer)
			timer = setTimeout(() => (copied = false), resetMs)
		} catch {
			copied = false
		}
	}

	return {
		get copied() {
			return copied
		},
		copy,
	}
}
