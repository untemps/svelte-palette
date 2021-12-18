import { DOMObserver } from '@untemps/dom-observer'

import './useTooltip.css'

const useTooltip = (node, { templateSelector, index, callback, disabled }) => {
	Tooltip.init(templateSelector)

	const tooltip = new Tooltip(node, index, callback)
	if (disabled) {
		tooltip.disable()
	}

	return {
		update: ({ disabled, index, callback }) => {
			tooltip.update(index, callback)
			disabled ? tooltip.disable() : tooltip.enable()
		},
		destroy: () => {
			tooltip.destroy()
		},
	}
}

export class Tooltip {
	static #isInitialized = false
	static #observer = null
	static #tooltip = null
	static #instances = []

	#target = null
	#index = null
	#callback = null
	#container = null

	#boundEnterHandler = null
	#boundLeaveHandler = null
	#boundClickHandler = null

	constructor(target, index, callback) {
		this.#target = target
		this.#index = index
		this.#callback = callback
		this.#container = Tooltip.#tooltip

		this.#activateTarget()

		Tooltip.#instances.push(this)
	}

	static init(templateSelector) {
		if (!Tooltip.#isInitialized) {
			Tooltip.#tooltip = document.createElement('div')
			Tooltip.#tooltip.setAttribute('class', 'tooltip')

			Tooltip.#observer = new DOMObserver()
			Tooltip.#observer.wait(templateSelector, null, { events: [DOMObserver.ADD] }).then(({ node }) => {
				Tooltip.#tooltip.appendChild(node)
			})

			Tooltip.#isInitialized = true
		}
	}

	static destroy() {
		Tooltip.#instances.forEach((instance) => {
			instance.destroy()
		})
		Tooltip.#instances = []

		Tooltip.#observer.clear()
		Tooltip.#isInitialized = false
	}

	update(index, callback) {
		this.#index = index
		this.#callback = callback
	}

	destroy() {
		this.#deactivateTarget()
		this.#removeTooltipFromTarget()
	}

	enable() {
		this.#boundEnterHandler = this.#onTargetEnter.bind(this)
		this.#boundLeaveHandler = this.#onTargetLeave.bind(this)

		this.#target.addEventListener('mouseenter', this.#boundEnterHandler)
		this.#target.addEventListener('mouseleave', this.#boundLeaveHandler)
	}

	disable() {
		this.#target.removeEventListener('mouseenter', this.#boundEnterHandler)
		this.#target.removeEventListener('mouseleave', this.#boundLeaveHandler)

		this.#boundEnterHandler = null
		this.#boundLeaveHandler = null
	}

	#activateTarget() {
		this.#target.title = ''
		this.#target.setAttribute('style', 'position: relative')

		this.enable()
	}

	#deactivateTarget() {
		this.disable()
	}

	#appendTooltipToTarget() {
		this.#target.appendChild(this.#container)

		this.#boundClickHandler = this.#onTooltipClick.bind(this)
		this.#container.addEventListener('click', this.#boundClickHandler)
	}

	#removeTooltipFromTarget() {
		if (this.#target.contains(this.#container)) {
			this.#target.removeChild(this.#container)
		}

		this.#container.removeEventListener('click', this.#boundClickHandler)
		this.#boundClickHandler = null
	}

	#onTargetEnter() {
		this.#appendTooltipToTarget()

		Tooltip.#observer.wait('.tooltip', null, { events: [DOMObserver.ADD] }).then(({ node }) => {
			const { width: targetWidth } = this.#target.getBoundingClientRect()
			const { width: tooltipWidth, height: tooltipHeight } = this.#container.getBoundingClientRect()
			this.#container.style.left = `${-(tooltipWidth - targetWidth) >> 1}px`
			this.#container.style.top = `${-tooltipHeight - 6}px`
		})
	}

	#onTargetLeave() {
		this.#removeTooltipFromTarget()
	}

	#onTooltipClick() {
		this.#removeTooltipFromTarget()

		this.#callback?.(this.#index)
	}
}

export default useTooltip
