const useConditional = (target, { action, options, condition }) => {
	if (condition) {
		action(target, options)
		return {
			update: ({ action: newAction, options: newOptions, condition: newCondition }) => {
				if (newCondition) {
					newAction(target, newOptions)
				}
			},
		}
	}
	return undefined
}

export default useConditional
