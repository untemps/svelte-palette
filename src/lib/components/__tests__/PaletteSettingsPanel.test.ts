import { render } from '@testing-library/svelte/svelte5'
import { tick } from 'svelte'

import PaletteSettingsPanelReactive from './PaletteSettingsPanel.test.svelte'

const PANEL_SELECTOR = '.palette__settings__panel'

const panelInDocument = () => document.querySelector(PANEL_SELECTOR) !== null

test('Renders the panel content', () => {
	render(PaletteSettingsPanelReactive, { props: { initialIsVisible: true } })
	expect(document.querySelector('[data-testid="__panel-content__"]')).not.toBeNull()
})

test('Removes the panel from the document when closed after opening (initial hidden)', async () => {
	const { component } = render(PaletteSettingsPanelReactive, {
		props: { initialIsVisible: false },
	})
	expect(panelInDocument()).toBe(false)

	component.setIsVisible(true)
	await tick()
	expect(panelInDocument()).toBe(true)

	component.setIsVisible(false)
	await tick()
	expect(panelInDocument()).toBe(false)
})

test('Re-appends the panel to the document when reopened after closing (initial visible)', async () => {
	const { component } = render(PaletteSettingsPanelReactive, {
		props: { initialIsVisible: true },
	})
	expect(panelInDocument()).toBe(true)

	component.setIsVisible(false)
	await tick()
	expect(panelInDocument()).toBe(false)

	component.setIsVisible(true)
	await tick()
	expect(panelInDocument()).toBe(true)
})

test('Re-parents a visible panel when the target changes', async () => {
	const altTarget = document.createElement('div')
	altTarget.id = '__alt-portal-target__'
	document.body.appendChild(altTarget)

	try {
		const { component } = render(PaletteSettingsPanelReactive, {
			props: { initialTarget: 'body', initialIsVisible: true },
		})

		expect(altTarget.contains(document.querySelector(PANEL_SELECTOR))).toBe(false)

		component.setTarget('#__alt-portal-target__')
		await tick()

		expect(altTarget.contains(document.querySelector(PANEL_SELECTOR))).toBe(true)
	} finally {
		altTarget.remove()
	}
})
