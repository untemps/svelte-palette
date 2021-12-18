import { DOMObserver } from '@untemps/dom-observer'

import './useTooltip.css'

const useTooltip = (node, { contentSelector, contentActions, disabled }) => {
	Tooltip.init(contentSelector)

	const tooltip = new Tooltip(node, contentActions)
	if (disabled) {
		tooltip.disable()
	}

	return {
		update: ({ contentActions, disabled }) => {
			tooltip.update(contentActions)
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
	#actions = null
	#container = null
	#events = []

	#boundEnterHandler = null
	#boundLeaveHandler = null

	constructor(target, actions) {
		this.#target = target
		this.#actions = actions
		this.#container = Tooltip.#tooltip

		this.#activateTarget()

		Tooltip.#instances.push(this)
	}

	static init(contentSelector) {
		if (!Tooltip.#isInitialized) {
			Tooltip.#tooltip = document.createElement('div')
			Tooltip.#tooltip.setAttribute('class', 'tooltip')

			Tooltip.#observer = new DOMObserver()
			Tooltip.#observer.wait(contentSelector, null, { events: [DOMObserver.ADD] }).then(({ node }) => {
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

	update(actions) {
		this.#actions = actions
	}

	destroy() {
		this.#deactivateTarget()
		this.#removeContainerFromTarget()
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

	#appendContainerToTarget() {
		this.#target.appendChild(this.#container)

		if (this.#actions) {
			Object.entries(this.#actions).forEach(([key, { eventType, callback, callbackParams }]) => {
				const trigger = key === '*' ? this.#container : this.#container.querySelector(key)
				if (trigger) {
					const listener = (event) => callback?.apply(null, [...callbackParams, event])
					trigger.addEventListener(eventType, listener)
					this.#events.push({ trigger, eventType, listener })
				}
			})
		}
	}

	#removeContainerFromTarget() {
		if (this.#target.contains(this.#container)) {
			this.#target.removeChild(this.#container)
		}

		this.#events.forEach(({ trigger, eventType, listener }) => trigger.removeEventListener(eventType, listener))
		this.#events = []
	}

	#onTargetEnter() {
		this.#appendContainerToTarget()

		Tooltip.#observer.wait('.tooltip', null, { events: [DOMObserver.ADD] }).then(({ node }) => {
			const { width: targetWidth } = this.#target.getBoundingClientRect()
			const { width: tooltipWidth, height: tooltipHeight } = this.#container.getBoundingClientRect()
			this.#container.style.left = `${-(tooltipWidth - targetWidth) >> 1}px`
			this.#container.style.top = `${-tooltipHeight - 6}px`
		})
	}

	#onTargetLeave() {
		this.#removeContainerFromTarget()
	}
}

export default useTooltip
