<script lang="ts">
	import EditablePaletteCard from '../demo/cards/EditablePaletteCard.svelte'
	import SelectionCallbacksCard from '../demo/cards/SelectionCallbacksCard.svelte'
	import LayoutCard from '../demo/cards/LayoutCard.svelte'
	import CompactModeCard from '../demo/cards/CompactModeCard.svelte'
	import ColorGroupsCard from '../demo/cards/ColorGroupsCard.svelte'
	import AsyncColorsCard from '../demo/cards/AsyncColorsCard.svelte'
	import PresentationalSlotCard from '../demo/cards/PresentationalSlotCard.svelte'
	import CustomSnippetsCard from '../demo/cards/CustomSnippetsCard.svelte'
	import TransparentSlotCard from '../demo/cards/TransparentSlotCard.svelte'
	import DeletionModesCard from '../demo/cards/DeletionModesCard.svelte'
	import EyeDropperCard from '../demo/cards/EyeDropperCard.svelte'
	import AccessibilityCard from '../demo/cards/AccessibilityCard.svelte'
	import LocalizedLabelsCard from '../demo/cards/LocalizedLabelsCard.svelte'
	import ThemingTokensCard from '../demo/cards/ThemingTokensCard.svelte'
	import DarkModeCard from '../demo/cards/DarkModeCard.svelte'
</script>

<main class="container" id="main">
	<section class="intro">
		<span class="intro__eyebrow">
			<span class="brand__dot" style="background:var(--accent)"></span>
			Svelte 5 · Themeable · Accessible
		</span>
		<h1>The color palette component for <span class="accent">Svelte</span>.</h1>
		<p>
			Editable slots, color groups, async sources, custom snippets, CSS-token theming and built-in dark mode —
			every capability below is a live, interactive {'<Palette>'} you can poke at.
		</p>
		<div class="intro__meta">
			<span>Toggle the theme in the header; every palette follows.</span>
			<a href="https://github.com/untemps/svelte-palette#readme" target="_blank" rel="noopener noreferrer">
				Read the docs →
			</a>
		</div>
	</section>

	<h2 class="section-title">Explore the capabilities</h2>
	<p class="section-lead">
		Fifteen focused cards, one capability each — each backed by a live palette and its snippet.
	</p>

	<div class="grid">
		<EditablePaletteCard />
		<SelectionCallbacksCard />
		<LayoutCard />
		<CompactModeCard />
		<ColorGroupsCard />
		<AsyncColorsCard />
		<PresentationalSlotCard />
		<CustomSnippetsCard />
		<TransparentSlotCard />
		<DeletionModesCard />
		<EyeDropperCard />
		<AccessibilityCard />
		<LocalizedLabelsCard />
		<ThemingTokensCard />
		<DarkModeCard />
	</div>
</main>
