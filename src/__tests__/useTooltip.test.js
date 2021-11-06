/**
 * @jest-environment jsdom
 */

import { fireEvent } from '@testing-library/svelte'

import useTooltip from '../useTooltip'

describe('useTooltip', () => {
	const target = document.createElement('div')
	const template = document.createElement('div')
	template.className = 'template'
	const options = {
		template,
		callback: jest.fn(),
	}

	it('Adds template to the DOM on mouse enter', async () => {
		useTooltip(target, options)
		await fireEvent.mouseEnter(target)
		expect(target).toContainElement(template)
	})

	it('Removes template from the DOM on mouse leave', async () => {
		useTooltip(target, options)
		await fireEvent.mouseEnter(target)
		await fireEvent.mouseLeave(target)
		expect(target).not.toContainElement(template)
	})

	it('Triggers callback on tooltip click', async () => {
		useTooltip(target, options)
		await fireEvent.mouseEnter(target)
		await fireEvent.click(template)
		expect(options.callback).toHaveBeenCalled()
	})
})
