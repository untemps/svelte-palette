<script lang="ts">
	import { createClipboard } from '../lib/clipboard.svelte'
	import Icon from './Icon.svelte'
	import ThemeToggle from './ThemeToggle.svelte'

	const INSTALL_CMD = 'yarn add @untemps/svelte-palette'
	const clip = createClipboard()
</script>

<header class="header">
	<div class="container header__inner">
		<span class="brand">
			<span class="brand__dots" aria-hidden="true">
				<span class="brand__dot" style="background:#f56476"></span>
				<span class="brand__dot" style="background:#ffb703"></span>
				<span class="brand__dot" style="background:#3a86ff"></span>
				<span class="brand__dot" style="background:#2ec4b6"></span>
			</span>
			<span><span class="brand__scope">@untemps/</span><span class="brand__name">svelte-palette</span></span>
		</span>

		<span class="header__spacer"></span>

		<button
			type="button"
			class="install"
			onclick={() => clip.copy(INSTALL_CMD)}
			aria-label={clip.copied ? 'Copied install command' : 'Copy install command'}
		>
			<code>{INSTALL_CMD}</code>
			<Icon name={clip.copied ? 'check' : 'copy'} size={17} />
			<span class="visually-hidden" role="status" aria-live="polite"
				>{clip.copied ? 'Copied to clipboard' : ''}</span
			>
		</button>

		<div class="header__actions">
			<a
				class="iconbtn"
				href="https://github.com/untemps/svelte-palette"
				target="_blank"
				rel="noopener noreferrer"
				aria-label="GitHub repository"
			>
				<Icon name="github" />
			</a>
			<a
				class="iconbtn"
				href="https://www.npmjs.com/package/@untemps/svelte-palette"
				target="_blank"
				rel="noopener noreferrer"
				aria-label="npm package"
			>
				<Icon name="npm" />
			</a>
			<ThemeToggle />
		</div>
	</div>
</header>
