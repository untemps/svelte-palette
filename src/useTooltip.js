import { DOMObserver } from '@untemps/dom-observer'

import './useTooltip.css'

const useTooltip = async (target, { templateSelector, callback }) => {
	try {
		const { node: template } = await new DOMObserver().wait(templateSelector)
		template?.parentNode?.removeChild(template)

		const _removeTooltip = () => {
			const tooltip = document.querySelector('.tooltip')
			tooltip?.parentNode?.removeChild(tooltip)
			return tooltip
		}

		const _onMouseEnter = async () => {
			try {
				_removeTooltip()

				const tooltip = document.createElement('div')
				tooltip.setAttribute('class', 'tooltip')
				tooltip.addEventListener('click', _onTooltipClick)
				
				if (template) {
					template.setAttribute('style', `display: block; visibility: visible`)
					tooltip.appendChild(typeof template === 'string' ? document.createTextNode(template) : template)
				}

				new MutationObserver(mutationList => {
					mutationList.forEach(mutation => {
						mutation.addedNodes.forEach(node => {
							if (node === tooltip) {
								const { width: nodeWidth } = target.getBoundingClientRect()
								const { width: tooltipWidth, height: tooltipHeight } = tooltip.getBoundingClientRect()
								tooltip.style.left = `${-(tooltipWidth - nodeWidth) >> 1}px`
								tooltip.style.top = `${-tooltipHeight - 6}px`
							}
						})
					})
				}).observe(target, { childList: true })

				target.appendChild(tooltip)
			} catch (error) {
				console.error(error)
			}
		}

		const _onMouseLeave = () => {
			_removeTooltip()
		}

		const _onTooltipClick = e => {
			e.preventDefault()

			_removeTooltip()

			callback?.()
		}

		target.title = ''
		target.setAttribute('style', 'position: relative')
		target.addEventListener('mouseenter', _onMouseEnter)
		target.addEventListener('mouseleave', _onMouseLeave)

		return {
			update: async ({ template: newTemplate }) => {
				const { node: template } = await new DOMObserver().wait(templateSelector)
				newTemplate?.parentNode?.removeChild(newTemplate)
			},
			destroy: () => {
				const tooltip = _removeTooltip()
				tooltip?.removeEventListener('click', _onTooltipClick)

				target.removeEventListener('mouseenter', _onMouseEnter)
				target.removeEventListener('mouseleave', _onMouseLeave)
			},
		}
	} catch (error) {
		console.error(error)
	}
}

export default useTooltip
