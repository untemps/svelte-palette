<script lang="ts">
	import { Palette, DEFAULT_LABELS } from '$lib'
	import type { ColorsProp, ColorValue, PaletteLabels } from '$lib/types'

	import Card from '../components/Card.svelte'
	import { getPaletteTheme } from '../lib/theme.svelte'

	const DESCRIPTION =
		'Every built-in string — the listbox, input, tools and deletion tooltip — is driven by one <code>labels</code> bag. Override a subset to localize the palette or tweak individual accessible names.'

	const CODE = `<Palette
	labels={locale === 'fr' ? frLabels : DEFAULT_LABELS}
	showInput
	showTransparentSlot
/>`

	const FR_LABELS: PaletteLabels = {
		slots: 'Emplacements de couleur',
		loader: 'Chargement des couleurs',
		error: 'Échec du chargement des couleurs',
		transparentSlot: 'Emplacement transparent',
		compact: 'Réduire la palette',
		enlarge: 'Agrandir la palette',
		inputHex: 'Saisir une couleur hexadécimale',
		inputHexError: 'La valeur doit être une couleur hexadécimale valide',
		submitHex: 'Ajouter la couleur',
		eyeDropper: "Prélever une couleur à l'écran",
		tools: 'Outils de la palette',
		settings: 'Aller aux paramètres',
		trash: 'Supprimer la couleur',
	}

	const LOCALES = {
		en: { name: 'English', labels: DEFAULT_LABELS },
		fr: { name: 'Français', labels: FR_LABELS },
	}

	let colors = $state<ColorsProp | null>(['#2ec4b6', '#e71d36', '#ff9f1c', '#011627', '#41ead4', '#3a86ff'])
	let selectedColor = $state<ColorValue | null>(null)
	let locale = $state<keyof typeof LOCALES>('en')
</script>

<Card
	title="Localized labels"
	badge="labels"
	description={DESCRIPTION}
	code={CODE}
	docHref="https://github.com/untemps/svelte-palette#internationalization"
>
	<div class="seg" role="group" aria-label="Locale">
		{#each Object.entries(LOCALES) as [key, { name }] (key)}
			<button
				type="button"
				class="seg__btn"
				aria-pressed={locale === key}
				onclick={() => (locale = key as keyof typeof LOCALES)}
			>
				{name}
			</button>
		{/each}
	</div>

	<div class="card__stage">
		<div class="palette-frame">
			<Palette
				bind:colors
				bind:selectedColor
				numColumns={4}
				showInput
				showTransparentSlot
				deletionMode="tooltip"
				labels={LOCALES[locale].labels}
				data-palette-theme={getPaletteTheme()}
			/>
		</div>
	</div>

	<p class="hint">
		Active bag: <code>{LOCALES[locale].name}</code>. Inspect the controls with a screen reader to hear the localized
		names.
	</p>
</Card>
