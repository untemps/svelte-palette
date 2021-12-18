/**
 * @jest-environment jsdom
 */

import { fireEvent } from '@testing-library/svelte'

import useTooltip, { Tooltip } from '../useTooltip'

describe('useTooltip', () => {
	let target,
		template,
		options,
		action = null

	beforeEach(() => {
		target = _createElement('target')
		template = _createElement('template')
		options = {
			templateSelector: '#template',
			index: 1,
			callback: jest.fn(),
			disabled: false,
		}
	})

	afterEach(() => {
		action.destroy()
		action = null

		_removeElement('#target')
		_removeElement('#template')

		target = null
		template = null
		options = null

		Tooltip.destroy()
	})

	it('Adds template to the DOM on mouse enter', async () => {
		action = useTooltip(target, options)
		await fireEvent.mouseOver(target) // fireEvent.mouseEnter only works if mouseOver is triggered before
		await fireEvent.mouseEnter(target)
		expect(template).toBeVisible()
	})

	it('Does not add template to the DOM on mouse enter if disabled', async () => {
		action = useTooltip(target, { ...options, disabled: true })
		await fireEvent.mouseOver(target) // fireEvent.mouseEnter only works if mouseOver is triggered before
		await fireEvent.mouseEnter(target)
		expect(template).not.toBeVisible()
	})

	it('Does not add template to the DOM on mouse enter if disabled after update', async () => {
		action = useTooltip(target, options)
		const newOptions = { ...options, disabled: true }
		action.update(newOptions)
		await fireEvent.mouseOver(target) // fireEvent.mouseEnter only works if mouseOver is triggered before
		await fireEvent.mouseEnter(target)
		expect(template).not.toBeVisible()
	})

	it('Removes template from the DOM on mouse leave', async () => {
		action = useTooltip(target, options)
		await fireEvent.mouseOver(target) // fireEvent.mouseEnter only works if mouseOver is triggered before
		await fireEvent.mouseEnter(target)
		await fireEvent.mouseLeave(target)
		expect(template).not.toBeVisible()
	})

	it('Triggers callback on tooltip click', async () => {
		action = useTooltip(target, options)
		await fireEvent.mouseOver(target) // fireEvent.mouseEnter only works if mouseOver is triggered before
		await fireEvent.mouseEnter(target)
		await fireEvent.click(template)
		expect(options.callback).toHaveBeenCalledWith(options.index)
	})

	it('Triggers new callback on tooltip click after update', async () => {
		action = useTooltip(target, options)
		const newCallback = jest.fn()
		const newOptions = { ...options, callback: newCallback }
		action.update(newOptions)
		await fireEvent.mouseOver(target) // fireEvent.mouseEnter only works if mouseOver is triggered before
		await fireEvent.mouseEnter(target)
		await fireEvent.click(template)
		expect(newCallback).toHaveBeenCalledWith(options.index)
	})

	it('Destroys tooltip', async () => {
		action = useTooltip(target, options)
		action.destroy()
		await fireEvent.mouseOver(target) // fireEvent.mouseEnter only works if mouseOver is triggered before
		await fireEvent.mouseEnter(target)
		expect(options.callback).not.toHaveBeenCalled()
	})
})
