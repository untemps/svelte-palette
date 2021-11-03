import './useTooltip.css'

const useTooltip = (target, { template, callback }) => {
	const _onMouseEnter = () => {
		target.appendChild(tooltip)
		if (tooltipTemplate) {
			tooltip.appendChild(
				typeof tooltipTemplate === 'string' ? document.createTextNode(tooltipTemplate) : tooltipTemplate
			)
		}
	}

	const _onMouseLeave = () => {
		if (target.contains(tooltip)) {
			target.removeChild(tooltip)
		}
	}

	const _onTooltipClick = (e) => {
		e.preventDefault()
		callback?.()
		if (target.contains(tooltip)) {
			target.removeChild(tooltip)
		}
	}

	target.title = ''
	target.setAttribute('style', 'position: relative')
	target.addEventListener('mouseenter', _onMouseEnter)
	target.addEventListener('mouseleave', _onMouseLeave)

	let tooltipTemplate = template

	const tooltip = document.createElement('div')
	tooltip.className = 'tooltip'
	tooltip.addEventListener('click', _onTooltipClick)

	new MutationObserver((mutationList) => {
		mutationList.forEach((mutation) => {
			mutation.addedNodes.forEach((node) => {
				if (node === tooltip) {
					const { width: nodeWidth } = target.getBoundingClientRect()
					const { width: tooltipWidth, height: tooltipHeight } = tooltip.getBoundingClientRect()
					tooltip.style.left = `${-(tooltipWidth - nodeWidth) >> 1}px`
					tooltip.style.top = `${-tooltipHeight - 6}px`
				}
			})
		})
	}).observe(target, { childList: true })

	return {
		update: ({ template, callback }) => {
			tooltipTemplate = template
			if (tooltipTemplate) {
				if (tooltipTemplate.parentNode) {
					tooltipTemplate.parentNode.removeChild(tooltipTemplate)
				}
			}
		},
		destroy: () => {},
	}
}

export default useTooltip
