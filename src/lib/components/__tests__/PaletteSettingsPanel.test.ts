import { afterEach, expect, test } from 'vitest'
import { cleanup, render, waitFor } from '@testing-library/svelte/svelte5'
import type { Component } from 'svelte'

import PaletteSettingsPanel from '../PaletteSettingsPanel.svelte'

const setup = (component: Component, options?: Record<string, unknown>) => {
	return render(component, options)
}

afterEach(() => cleanup())

test('Renders panel in body when isVisible is true', () => {
	setup(PaletteSettingsPanel, { props: { isVisible: true } })
	const panel = document.querySelector('.palette__settings__panel')
	expect(panel).toBeInTheDocument()
	expect(panel).toHaveClass('palette__settings__panel--visible')
})

test('Removes panel from DOM when isVisible is false', () => {
	setup(PaletteSettingsPanel, { props: { isVisible: false } })
	// hide() detaches the node from the document
	expect(document.querySelector('.palette__settings__panel')).not.toBeInTheDocument()
})

test('Does not move panel when target selector is empty', () => {
	// getTargetEl('') → !!'' is false → returns null → show() is a no-op
	setup(PaletteSettingsPanel, { props: { target: '', isVisible: true } })
	const panel = document.querySelector('.palette__settings__panel')
	expect(panel).toBeInTheDocument()
})

test('Updates targetEl when target prop changes', async () => {
	const customEl = document.createElement('div')
	customEl.id = 'custom-portal'
	document.body.appendChild(customEl)

	const { rerender } = setup(PaletteSettingsPanel, { props: { target: 'body', isVisible: false } })
	// action update: newTarget '#custom-portal' !== 'body' → getTargetEl('#custom-portal')
	rerender({ target: '#custom-portal', isVisible: true })

	await waitFor(() => {
		expect(customEl.querySelector('.palette__settings__panel')).toBeInTheDocument()
	})

	document.body.removeChild(customEl)
})

test('Shows panel when isVisible changes from false to true', async () => {
	const { rerender } = setup(PaletteSettingsPanel, { props: { isVisible: false } })
	expect(document.querySelector('.palette__settings__panel')).not.toBeInTheDocument()

	rerender({ isVisible: true })

	await waitFor(() => {
		expect(document.querySelector('.palette__settings__panel')).toBeInTheDocument()
	})
})

test('Keeps panel visible when rerendered with same isVisible value', async () => {
	const { rerender } = setup(PaletteSettingsPanel, { props: { isVisible: true } })
	expect(document.querySelector('.palette__settings__panel')).toBeInTheDocument()

	rerender({ isVisible: true })

	await waitFor(() => {
		expect(document.querySelector('.palette__settings__panel')).toBeInTheDocument()
	})
})
