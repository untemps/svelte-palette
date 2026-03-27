import { afterEach, expect, test, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/svelte/svelte5'
import userEvent from '@testing-library/user-event'
import type { Component } from 'svelte'

import { COMPACT, SETTINGS } from '../../enums/PaletteTool'

import PaletteTools from '../PaletteTools.svelte'

const setup = (component: Component, options?: Record<string, unknown>) => {
	return {
		user: userEvent.setup(),
		...render(component, options),
	}
}

afterEach(() => cleanup())

test('Renders no buttons when tools is empty', () => {
	setup(PaletteTools, { props: { tools: [] } })
	const compactButton = screen.queryByTestId('__palette-compact-toggle-button__')
	const settingsButton = screen.queryByTestId('__palette-settings-button__')
	expect(compactButton).not.toBeInTheDocument()
	expect(settingsButton).not.toBeInTheDocument()
})

test('Renders compact button when tools contains compact', () => {
	setup(PaletteTools, { props: { tools: [COMPACT] } })
	const button = screen.getByTestId('__palette-compact-toggle-button__')
	expect(button).toBeInTheDocument()
})

test('Renders settings button when tools contains settings', () => {
	setup(PaletteTools, { props: { tools: [SETTINGS] } })
	const button = screen.getByTestId('__palette-settings-button__')
	expect(button).toBeInTheDocument()
})

test('Calls onselect with compact tool when compact button is clicked', async () => {
	const onSelect = vi.fn(() => 0)
	const { user } = setup(PaletteTools, { props: { tools: [COMPACT], onselect: onSelect } })
	const button = screen.getByTestId('__palette-compact-toggle-button__')
	await user.click(button)
	expect(onSelect).toHaveBeenCalledWith({ tool: COMPACT })
})

test('Calls onselect with settings tool when settings button is clicked', async () => {
	const onSelect = vi.fn(() => 0)
	const { user } = setup(PaletteTools, { props: { tools: [SETTINGS], onselect: onSelect } })
	const button = screen.getByTestId('__palette-settings-button__')
	await user.click(button)
	expect(onSelect).toHaveBeenCalledWith({ tool: SETTINGS })
})
