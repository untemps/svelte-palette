<script lang="ts">
	import { Palette, DEFAULT_LABELS, TOOLTIP } from '$lib'

	import type { PaletteLabels } from '$lib/types'

	const _colors = ['#2ec4b6', '#e71d36', '#ff9f1c', '#011627', '#41ead4', '#f71735', '#3a86ff', '#8338ec']

	const _frLabels: PaletteLabels = {
		slots: 'Emplacements de couleur',
		loader: 'Chargement des couleurs',
		error: 'Échec du chargement des couleurs',
		transparentSlot: 'Emplacement transparent',
		compact: 'Réduire la palette',
		enlarge: 'Agrandir la palette',
		inputColor: 'Saisir une couleur hexadécimale',
		inputColorError: 'La valeur doit être une couleur hexadécimale valide',
		submitColor: 'Ajouter la couleur',
		eyeDropper: "Prélever une couleur à l'écran",
		tools: 'Outils de la palette',
		settings: 'Aller aux paramètres',
		trash: 'Supprimer la couleur',
	}

	const _locales = {
		en: { name: 'English', labels: DEFAULT_LABELS },
		fr: { name: 'Français', labels: _frLabels },
	}

	let locale = $state<keyof typeof _locales>('en')
	let colors = $state([..._colors])
	let selectedColor = $state<string | null>(null)
</script>

<main class="example7" style="--bgColor:{selectedColor ?? '#1b1b1b'}">
	<h1 class="title">Localized Labels</h1>
	<p class="intro">
		Every built-in name — the listbox, the input, the tools, the deletion tooltip — is driven by a single
		<code>labels</code> bag. Switch the locale to swap the whole set; hover a slot to delete it, or inspect the controls
		with a screen reader to hear the localized accessible names.
	</p>

	<div class="controls" role="group" aria-label="Locale">
		{#each Object.entries(_locales) as [key, { name }] (key)}
			<button
				type="button"
				class="controls__button"
				class:controls__button--active={locale === key}
				aria-pressed={locale === key}
				onclick={() => (locale = key as keyof typeof _locales)}
			>
				{name}
			</button>
		{/each}
	</div>

	<div class="content">
		<Palette
			class="palette__custom"
			data-palette-theme="light"
			bind:colors
			bind:selectedColor
			numColumns={4}
			showInput
			showTransparentSlot
			deletionMode={TOOLTIP}
			compactColorIndices={[0, 2, 4, 6]}
			labels={_locales[locale].labels}
			onselect={({ color }) => (selectedColor = color)}
		>
			{#snippet settings({ onClose })}
				<div class="settings">
					<p>{locale === 'fr' ? 'Panneau des paramètres' : 'Settings panel'}</p>
					<button type="button" class="settings__close" onclick={onClose}>
						{locale === 'fr' ? 'Fermer' : 'Close'}
					</button>
				</div>
			{/snippet}
		</Palette>
	</div>

	<p class="intro intro--muted">
		The active bag is <code>{_locales[locale].name}</code>. Passing <code>DEFAULT_LABELS</code> (English) is equivalent
		to omitting the prop.
	</p>
</main>

<style>
	.example7 {
		min-height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.25rem;
		padding: 2.5rem 1.5rem;
		font-family: Helvetica, sans-serif;
		color: #f5f5f5;
		background-color: var(--bgColor);
		transition: background-color 0.4s ease;
	}

	.title {
		margin: 0;
		font-size: 1.75rem;
		text-align: center;
	}

	.intro {
		max-width: 42rem;
		margin: 0;
		text-align: center;
		line-height: 1.5;
	}

	.intro--muted {
		margin-top: 1rem;
		opacity: 0.85;
	}

	.intro code {
		padding: 0.05rem 0.3rem;
		font-size: 0.85em;
		background-color: rgba(255, 255, 255, 0.14);
		border-radius: 0.2rem;
	}

	.controls {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		justify-content: center;
	}

	.controls__button {
		padding: 0.5rem 1rem;
		font: inherit;
		font-size: 0.875rem;
		color: #1b1b1b;
		background-color: #f5f5f5;
		border: 2px solid transparent;
		border-radius: 0.3rem;
		cursor: pointer;
	}

	.controls__button:hover {
		background-color: #fff;
	}

	.controls__button--active {
		border-color: #3a86ff;
	}

	.content {
		width: 100%;
		max-width: 26rem;
	}

	.example7 :global(.palette[data-palette].palette__custom) {
		border-radius: 0.5rem;
	}

	.settings {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		padding: 1rem;
		color: #1b1b1b;
	}

	.settings__close {
		padding: 0.35rem 0.9rem;
		font: inherit;
		font-size: 0.8rem;
		color: #fff;
		background-color: #1b1b1b;
		border: none;
		border-radius: 0.3rem;
		cursor: pointer;
	}
</style>
